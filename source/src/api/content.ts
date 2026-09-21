import config, { type KeyInfo } from '../config'
import { appGet, appPost } from './app'
import { b64decode, b64encode } from '../crypto'
import { read, write } from '../localStorage'
import { decryptChapter } from '../crypto/content'
import { encryptKeyinfoBody, decryptKeyinfoResponse } from '../crypto/registerkey'
import { sleep } from '../utils'
import { fetch as pageFetch } from '../config'
import { warn } from '../utils/logger'


async function refreshKeyinfo(): Promise<void> {
    const b = await encryptKeyinfoBody(config.currentConfig)
    const res = await appPost('/crypt/registerkey', b)
    const j = res.json()
    const ek = j?.data?.key
    if (!ek) {
        throw new Error(`Failed to get key info: ${res.responseText}`)
    }
    const key = await decryptKeyinfoResponse(ek)
    const keyinfo: KeyInfo = {
        key,
        keyver: j?.data?.keyver as number,
    }
    console.log('Refreshed key info:', keyinfo)
    config.currentConfig.key_info = keyinfo
    write('keyinfo', {
        key: b64encode(key),
        keyver: j?.data?.keyver as number,
    }) // cache key info
}

/** 正在进行的注册。并发调用共享同一次，避免彼此覆盖刚拿到的密钥 */
let refreshInflight: Promise<void> | null = null

/**
 * 强制重新注册密钥，绕过本地缓存。
 *
 * 设备长时间没用过，服务端的密钥注册会失效：此时 keyver 往往还和本地一致，
 * 但正文一律返回 'Invalid'。这种情况只能重新注册，读缓存没有意义。
 */
export function refreshKey(): Promise<void> {
    if (!refreshInflight) {
        refreshInflight = refreshKeyinfo().finally(() => {
            refreshInflight = null
        })
    }
    return refreshInflight
}

async function ensureKeyinfo(expectedKeyVersion?: number): Promise<void> {
    const keyinfo = config.currentConfig.key_info
    const cachedKeyInfo = read('keyinfo')
    console.log('cached key info: ', cachedKeyInfo)
    if (cachedKeyInfo) {
        const cki = {
            key: b64decode(cachedKeyInfo.key),
            keyver: cachedKeyInfo.keyver,
        } as KeyInfo
        if (typeof expectedKeyVersion === 'undefined' || cki.keyver === expectedKeyVersion) {
            config.currentConfig.key_info = cki
            return
        }
    }
    if (!keyinfo) {
        // get from zero
        return await refreshKey()
    }
    if (keyinfo?.keyver !== expectedKeyVersion) {
        // refresh from server
        return await refreshKey()
    }
}


/* ============================================================================
 * v0.2.0 — 同源主路径 (preferred)
 *
 * 浏览器实际拿章节用的是 fanqienovel.com 同源 `/api/reader/full?itemId=...`，
 * 带 msToken / a_bogus / ttwid 这些由字节 secsdk 注入的字段。
 *
 * server response header `x-tt-zhal` 给出该章用的加密字体 id 和 hash：
 *   x-tt-zhal: k=DNMrHsV173Pd4pgy;f=dc027189e0ba4cd;d1=lf6-awef.bytetos.com;d2=...
 *
 * 解密靠 source/src/fontDecrypt.ts 的 mapping 表（已覆盖常见字体）。
 *
 * 该路径对匿名 / 无 device 仍开放，能拿到完整正文（chrome 9/21 实测
 * chapterWordNumber=2016，content 长度匹配），不像 snssdk 设备接口那样按
 * VIP 等级只返回试读段。
 *
 * 失败 fallback 到原 snssdk 路径。
 * ========================================================================== */

/**
 * 通过浏览器原生 fetch 拉同源章节接口。必须在 document 已加载的页面上调用，
 * 否则 ttwid / csrf cookie 没生效、secsdk 也没装。
 *
 * @returns 成功时返回 chapterData + 解析出的 font-id / font-hash；失败抛错
 */
export async function getChapterViaWeb(itemId: string): Promise<{
    chapterData: any
    fontId: string | null
    fontHash: string | null
    fontDomain: string | null
}> {
    const url = `https://fanqienovel.com/api/reader/full?itemId=${encodeURIComponent(itemId)}`
    const resp = await pageFetch(url, {
        credentials: 'include',
        headers: { Accept: 'application/json, text/plain, */*' },
    })
    if (!resp.ok) {
        throw new Error(`web /api/reader/full HTTP ${resp.status}`)
    }
    const j = await resp.json()
    if (j?.code !== 0 || !j?.data?.chapterData) {
        throw new Error(`web /api/reader/full returned code=${j?.code} message=${j?.message ?? ''}`)
    }
    const cd = j.data.chapterData
    if (typeof cd.content !== 'string' || cd.content.length === 0) {
        throw new Error('web /api/reader/full returned empty content')
    }
    // 解析 x-tt-zhal: k=<fontId>;f=<fontHash>;d1=<domain>;d2=<domain>
    const zhal = resp.headers.get('x-tt-zhal') || ''
    const parts = zhal.split(';').map((s) => s.trim()).filter(Boolean)
    let fontId: string | null = null
    let fontHash: string | null = null
    let fontDomain: string | null = null
    for (const p of parts) {
        const [k, v] = p.split('=')
        if (!k || !v) continue
        if (k === 'k') fontId = v
        else if (k === 'f') fontHash = v
        else if (k === 'd1' || k === 'd2') fontDomain = fontDomain ?? v
    }
    return { chapterData: cd, fontId, fontHash, fontDomain }
}

/**
 * 旧的 snssdk 路径。当成 fallback：web 路径不可用（被拦截 / 接口下线 /
 * nonce 过期等）时退到这里，避免章节完全打不开。
 */
async function getChapterViaSnssdk(itemId: string, _retry?: number): Promise<any> {
    if (typeof _retry === 'undefined') _retry = 0
    if (_retry > 5) {
        throw new Error(`Failed to get chapter: ${itemId}`)
    }
    if (!config.currentConfig.key_info) {
        await ensureKeyinfo()
    }
    const res = await appGet('/reader/full/v', { item_id: itemId, req_type: '1' })
    const j = res.json()?.data
    if (!j) {
        console.warn('Failed to get chapter: ', itemId, ', response: ', res.responseText)
        return await getChapterViaSnssdk(itemId, _retry + 1)
    }
    if (j?.content === 'Invalid' || j?.key_version !== config.currentConfig.key_info?.keyver) {
        if (j?.content === 'Invalid') {
            await refreshKey()
        } else {
            await ensureKeyinfo(parseInt(j?.key_version))
        }
        return await getChapterViaSnssdk(itemId, _retry + 1)
    }
    j.content = await decryptChapter(j?.content, j, config.currentConfig)
    return j
}

/**
 * 取章节，主入口。
 *
 * 1. 优先 /api/reader/full 同源（拿到完整字体验密正文）
 * 2. 失败 fallback snssdk（拿到试读段，至少不卡死）
 *
 * 永远不抛错给 readerHook，最差也是返回 null，reader 自己处理。
 */
export async function getChapter(itemId: string): Promise<any> {
    try {
        const web = await getChapterViaWeb(itemId)
        const cd = web.chapterData
        // 包成跟旧接口兼容的形状：content + novel_data + 额外的 fontId
        return {
            content: cd.content,
            novel_data: {
                book_id: cd.bookId,
                item_id: cd.itemId,
                title: cd.title,
                chapter_word_number: parseInt(cd.chapterWordNumber) || 0,
                author: cd.author,
                book_name: cd.bookName,
                first_pass_time: cd.firstPassTime,
            },
            _webFontId: web.fontId,
            _webFontHash: web.fontHash,
            _webFontDomain: web.fontDomain,
            _source: 'web',
        }
    } catch (webErr) {
        warn('content', '同源路径失败，fallback snssdk', {
            itemId,
            error: String((webErr as Error)?.message ?? webErr),
        })
        try {
            const snssdk = await getChapterViaSnssdk(itemId)
            // snssdk 的 content 是已解密的明文 HTML，不需要 fontDecrypt
            if (snssdk) {
                snssdk._source = 'snssdk-fallback'
            }
            return snssdk
        } catch (snssdkErr) {
            warn('content', 'snssdk 路径也失败', {
                itemId,
                error: String((snssdkErr as Error)?.message ?? snssdkErr),
            })
            return null
        }
    }
}


export interface BatchChapter {
    item_id: string;
    content?: unknown;
    key_version?: number;
    novel_data?: any;
    error?: string;
    [key: string]: unknown;
}


/**
 * 批量章节：v0.2.0 起只走同源。批量接口 `/api/reader/batch/full` 同源 / 跨
 * 域行为历史上不同文档版本差异较大，但 /api/reader/full/v 单独的 snssdk
 * 批量接口已经被风控收紧——为避免再踩坑直接退到同一套 fetch 循环。
 */
export async function getChapters(itemIds: string[], _bookId = '0'): Promise<Record<string, BatchChapter>> {
    const out: Record<string, BatchChapter> = {}
    for (const id of itemIds) {
        try {
            const web = await getChapterViaWeb(id)
            out[id] = {
                item_id: id,
                novel_data: web.chapterData,
                content: web.chapterData.content,
            }
        } catch (e) {
            out[id] = { item_id: id, error: String((e as Error)?.message ?? e) }
        }
        // 同源接口基本无频控，但保险起见留个小间隔
        await sleep(150)
    }
    return out
}

export async function getChapterInfo(itemId: string): Promise<unknown> {
    // 留着老接口名避免外部误调。新代码请用 getChapter / getChapterViaWeb
    const web = await getChapterViaWeb(itemId)
    return web.chapterData
}
