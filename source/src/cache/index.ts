// IndexedDB 章节缓存 + Pin（持久化整本书）。
//
// 数据模型：
//   - chapters: 单章节内容，按 id（bookId:itemId）存储
//   - pinnedBooks: 被 pin 的书元信息，方便面板列出
//
// 两种 scope：
//   - session: 浏览器关闭/脚本重载时清空（initSessionCache 时调用 clearSession）
//   - pin:     用户显式 pin 才会升级为持久；unpin 即删
//
// Pin 配额（默认值，可在控制面板调）：
//   - 最多 50 本
//   - 每本最多 5000 章
//   - 总大小不限（浏览器配额兜底）
//
// 为什么用 IndexedDB 而不是 localStorage：
//   - 配额：localStorage 5MB，一本长篇小说就超；IndexedDB 配额是磁盘级
//   - 性能：异步，不阻塞主线程
//   - 结构化：可以建索引，listPinnedBooks 比遍历 localStorage 快

import { debug, info, warn } from '../utils/logger'

const DB_NAME = 'fqa-cache'
const DB_VERSION = 1
const STORE_CHAPTERS = 'chapters'
const STORE_PINS = 'pinnedBooks'

export const DEFAULT_PIN_BOOK_LIMIT = 50
export const DEFAULT_PIN_CHAPTER_LIMIT = 5000

export interface CachedChapter {
    id: string
    bookId: string
    bookName: string
    itemId: string
    content: string
    createdAt: number
    lastReadAt: number
    scope: 'session' | 'pin'
}

export interface PinnedBookMeta {
    id: string
    bookName: string
    pinnedAt: number
    chapterCount: number
    totalBytes: number
    lastReadItemId: string | null
    /** 进度追踪：用户读到第几章（index，从 0 开始） */
    lastReadIndex: number
}

export interface CacheConfig {
    pinBookLimit: number
    pinChapterLimit: number
}

const DEFAULT_CONFIG: CacheConfig = {
    pinBookLimit: DEFAULT_PIN_BOOK_LIMIT,
    pinChapterLimit: DEFAULT_PIN_CHAPTER_LIMIT,
}

let db: IDBDatabase | null = null
let config: CacheConfig = { ...DEFAULT_CONFIG }
let openingPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
    if (db) return Promise.resolve(db)
    if (openingPromise) return openingPromise
    openingPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            const d = req.result
            if (!d.objectStoreNames.contains(STORE_CHAPTERS)) {
                const store = d.createObjectStore(STORE_CHAPTERS, { keyPath: 'id' })
                store.createIndex('bookId', 'bookId', { unique: false })
                store.createIndex('scope', 'scope', { unique: false })
            }
            if (!d.objectStoreNames.contains(STORE_PINS)) {
                d.createObjectStore(STORE_PINS, { keyPath: 'id' })
            }
        }
        req.onsuccess = () => {
            db = req.result
            resolve(db)
        }
        req.onerror = () => {
            openingPromise = null
            reject(req.error ?? new Error('IDB open failed'))
        }
        req.onblocked = () => {
            warn('cache', 'IndexedDB 升级被阻塞，旧版本页面未关闭？')
        }
    })
    return openingPromise
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

/** 初始化：打开数据库 + 清理 session scope 残留 */
export async function initCache(): Promise<void> {
    await openDb()
    await clearSessionScope()
    info('cache', `缓存系统就绪（DB: ${DB_NAME} v${DB_VERSION}）`)
}

/** 把章节写入 session scope。如果已存在（pin 或 session）则跳过。 */
export async function cacheChapter(
    bookId: string,
    bookName: string,
    itemId: string,
    content: string,
): Promise<void> {
    const id = makeId(bookId, itemId)
    const d = await openDb()
    const t = d.transaction(STORE_CHAPTERS, 'readwrite')
    const store = t.objectStore(STORE_CHAPTERS)
    const existing = await reqToPromise<CachedChapter | undefined>(
        store.get(id) as IDBRequest<CachedChapter | undefined>,
    )
    if (existing) {
        // 已存在（pin 或更早 session），更新 lastReadAt 但保留 scope
        store.put({ ...existing, lastReadAt: Date.now() })
    } else {
        const entry: CachedChapter = {
            id,
            bookId,
            bookName,
            itemId,
            content,
            createdAt: Date.now(),
            lastReadAt: Date.now(),
            scope: 'session',
        }
        store.add(entry)
    }
    await txDone(t)
    debug('cache', `已缓存章节 ${id}`, { scope: 'session' })
}

/** 读取章节：先 pin 再 session。返回 null 表示缓存未命中。 */
export async function getCachedChapter(
    bookId: string,
    itemId: string,
): Promise<CachedChapter | null> {
    const id = makeId(bookId, itemId)
    const d = await openDb()
    const t = d.transaction(STORE_CHAPTERS, 'readonly')
    const store = t.objectStore(STORE_CHAPTERS)
    const entry = await reqToPromise<CachedChapter | undefined>(
        store.get(id) as IDBRequest<CachedChapter | undefined>,
    )
    if (!entry) return null
    // 命中后更新 lastReadAt
    const t2 = d.transaction(STORE_CHAPTERS, 'readwrite')
    t2.objectStore(STORE_CHAPTERS).put({ ...entry, lastReadAt: Date.now() })
    await txDone(t2)
    return entry
}

/**
 * Pin 一本书：把所有 scope=session 的章节升级为 pin，并写入元信息。
 *
 * 配额检查：
 *   - 已 pin 的书再次 pin：忽略（幂等）
 *   - 超过 pinBookLimit：拒绝并返回 false
 *
 * 不自动清理超出 pinChapterLimit 的旧章节（用户应主动 unpin）。
 */
export async function pinBook(
    bookId: string,
    bookName: string,
): Promise<{ ok: boolean; reason?: string }> {
    const d = await openDb()
    // 检查是否已 pin
    const t0 = d.transaction(STORE_PINS, 'readonly')
    const existing = await reqToPromise<PinnedBookMeta | undefined>(
        t0.objectStore(STORE_PINS).get(bookId) as IDBRequest<PinnedBookMeta | undefined>,
    )
    if (existing) {
        debug('cache', `书已被 pin，跳过`, { bookId })
        return { ok: true }
    }
    // 检查数量上限
    const tCount = d.transaction(STORE_PINS, 'readonly')
    const count = await reqToPromise<number>(tCount.objectStore(STORE_PINS).count())
    if (count >= config.pinBookLimit) {
        return { ok: false, reason: `已 pin ${count} 本，达到上限 ${config.pinBookLimit}，请先 unpin 其他书` }
    }

    // 升级 session → pin
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], 'readwrite')
    const chapterStore = t.objectStore(STORE_CHAPTERS)
    const idx = chapterStore.index('bookId')
    const cursorReq = idx.openCursor(IDBKeyRange.only(bookId))
    let chapterCount = 0
    let totalBytes = 0
    let firstChapterId: string | null = null
    let lastReadItemId: string | null = null
    let lastReadAt = 0
    await new Promise<void>((resolve, reject) => {
        cursorReq.onsuccess = () => {
            const cursor = cursorReq.result
            if (!cursor) {
                resolve()
                return
            }
            const ch = cursor.value as CachedChapter
            cursor.update({ ...ch, scope: 'pin' })
            chapterCount++
            totalBytes += ch.content.length
            if (firstChapterId === null) firstChapterId = ch.itemId
            if (ch.lastReadAt > lastReadAt) {
                lastReadAt = ch.lastReadAt
                lastReadItemId = ch.itemId
            }
            cursor.continue()
        }
        cursorReq.onerror = () => reject(cursorReq.error)
    })
    const meta: PinnedBookMeta = {
        id: bookId,
        bookName,
        pinnedAt: Date.now(),
        chapterCount,
        totalBytes,
        lastReadItemId,
        lastReadIndex: 0,
    }
    t.objectStore(STORE_PINS).put(meta)
    await txDone(t)
    info('cache', `已 pin 书`, { bookId, bookName, chapterCount, totalBytes })
    return { ok: true }
}

/** Unpin 一本书：删除所有 scope=pin 的章节 + 元信息 */
export async function unpinBook(bookId: string): Promise<void> {
    const d = await openDb()
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], 'readwrite')
    const chapterStore = t.objectStore(STORE_CHAPTERS)
    const idx = chapterStore.index('bookId')
    const cursorReq = idx.openCursor(IDBKeyRange.only(bookId))
    await new Promise<void>((resolve, reject) => {
        cursorReq.onsuccess = () => {
            const cursor = cursorReq.result
            if (!cursor) {
                resolve()
                return
            }
            const ch = cursor.value as CachedChapter
            if (ch.scope === 'pin') cursor.delete()
            cursor.continue()
        }
        cursorReq.onerror = () => reject(cursorReq.error)
    })
    await reqToPromise(t.objectStore(STORE_PINS).delete(bookId))
    await txDone(t)
    info('cache', `已 unpin 书`, { bookId })
}

/** 列出所有 pin 的书（按 pin 时间倒序） */
export async function listPinnedBooks(): Promise<PinnedBookMeta[]> {
    const d = await openDb()
    const t = d.transaction(STORE_PINS, 'readonly')
    const all = await reqToPromise<PinnedBookMeta[]>(
        t.objectStore(STORE_PINS).getAll() as IDBRequest<PinnedBookMeta[]>,
    )
    return all.sort((a, b) => b.pinnedAt - a.pinnedAt)
}

/** 检查一本书是否被 pin */
export async function isPinned(bookId: string): Promise<boolean> {
    const d = await openDb()
    const t = d.transaction(STORE_PINS, 'readonly')
    const m = await reqToPromise<PinnedBookMeta | undefined>(
        t.objectStore(STORE_PINS).get(bookId) as IDBRequest<PinnedBookMeta | undefined>,
    )
    return Boolean(m)
}

/** 更新阅读进度（最后读到第 index 章） */
export async function updateReadingProgress(
    bookId: string,
    itemId: string,
    index: number,
): Promise<void> {
    const d = await openDb()
    const t = d.transaction(STORE_PINS, 'readwrite')
    const store = t.objectStore(STORE_PINS)
    const m = await reqToPromise<PinnedBookMeta | undefined>(
        store.get(bookId) as IDBRequest<PinnedBookMeta | undefined>,
    )
    if (!m) return
    await reqToPromise(store.put({
        ...m,
        lastReadItemId: itemId,
        lastReadIndex: index,
    }))
    await txDone(t)
}

/** 清空所有 session scope（脚本启动时调用） */
async function clearSessionScope(): Promise<void> {
    const d = await openDb()
    const t = d.transaction(STORE_CHAPTERS, 'readwrite')
    const store = t.objectStore(STORE_CHAPTERS)
    const idx = store.index('scope')
    const cursorReq = idx.openCursor(IDBKeyRange.only('session'))
    let cleared = 0
    await new Promise<void>((resolve, reject) => {
        cursorReq.onsuccess = () => {
            const cursor = cursorReq.result
            if (!cursor) {
                resolve()
                return
            }
            cursor.delete()
            cleared++
            cursor.continue()
        }
        cursorReq.onerror = () => reject(cursorReq.error)
    })
    await txDone(t)
    if (cleared > 0) info('cache', `已清理 ${cleared} 条 session 缓存`)
}

/** 强制清空所有缓存（"重置"按钮用） */
export async function clearAllCache(): Promise<void> {
    const d = await openDb()
    const t = d.transaction([STORE_CHAPTERS, STORE_PINS], 'readwrite')
    await reqToPromise(t.objectStore(STORE_CHAPTERS).clear())
    await reqToPromise(t.objectStore(STORE_PINS).clear())
    await txDone(t)
    info('cache', '已清空所有缓存')
}

function makeId(bookId: string, itemId: string): string {
    return `${bookId}:${itemId}`
}

function txDone(t: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error)
        t.onabort = () => reject(t.error ?? new Error('tx aborted'))
    })
}

export function getCacheConfig(): CacheConfig {
    return { ...config }
}

export function setCacheConfig(patch: Partial<CacheConfig>): void {
    config = { ...config, ...patch }
    info('cache', '配置已更新', { ...config })
}