// 诊断日志：环形缓冲 200 条 + 持久化 + 订阅。
//
// 用途：
//   - 失败恢复弹窗里的"查看诊断"按钮展开
//   - 控制面板状态区
//   - 用户调试时可导出 / 清空
//
// 设计：
//   - 内存里一份环形缓冲（最新 N 条），同时落盘到 GM_setValue
//   - 持久化用 setTimeout 节流，避免高频日志触发频繁 IO
//   - 监听者列表供 UI 实时刷新（控制面板展开时能看到新日志）
//
// 不包含敏感信息：x-argus / x-ladon 等签名 token 不进日志。
// 这是有意的设计——签凭据长期留在 localStorage 等于泄露账号身份。

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
    ts: number
    level: LogLevel
    category: string
    message: string
    /** 附加上下文，请求 URL/状态码/设备 ID 等，不要放签名头 */
    meta?: Record<string, unknown>
}

const STORAGE_KEY = 'fqa.diagnostic_log'
const MAX_ENTRIES = 200
const PERSIST_DEBOUNCE_MS = 500

let ringBuffer: LogEntry[] = []
const listeners = new Set<() => void>()
let persistTimer: ReturnType<typeof setTimeout> | null = null
let initialized = false

function load(): LogEntry[] {
    try {
        const raw = GM_getValue<string>(STORAGE_KEY, '[]')
        const arr = JSON.parse(raw)
        if (!Array.isArray(arr)) return []
        // 截断到 MAX_ENTRIES，防止历史遗留数据膨胀
        return arr.slice(-MAX_ENTRIES) as LogEntry[]
    } catch {
        return []
    }
}

function persist(): void {
    try {
        GM_setValue(STORAGE_KEY, JSON.stringify(ringBuffer))
    } catch (e) {
        // 容量超限或 GM 不可用，保守放弃持久化，不影响内存缓冲
        console.warn('[fqa:logger] persist failed:', e)
    }
}

function schedulePersist(): void {
    if (persistTimer) return
    persistTimer = setTimeout(() => {
        persistTimer = null
        persist()
    }, PERSIST_DEBOUNCE_MS)
}

function notify(): void {
    listeners.forEach((fn) => {
        try {
            fn()
        } catch (e) {
            console.warn('[fqa:logger] listener error:', e)
        }
    })
}

/**
 * 初始化：从持久化层加载历史日志。
 * 必须在 mainInit 最早阶段调用，其他模块会用到 logger。
 */
export function initLogger(): void {
    if (initialized) return
    ringBuffer = load()
    initialized = true
    info('logger', `日志系统就绪（历史 ${ringBuffer.length} 条）`)
}

export function log(
    level: LogLevel,
    category: string,
    message: string,
    meta?: Record<string, unknown>,
): void {
    const entry: LogEntry = meta
        ? { ts: Date.now(), level, category, message, meta }
        : { ts: Date.now(), level, category, message }
    ringBuffer.push(entry)
    if (ringBuffer.length > MAX_ENTRIES) {
        ringBuffer = ringBuffer.slice(-MAX_ENTRIES)
    }

    // 同时打到浏览器控制台（按级别着色），便于开 F12 直接查
    const tag = `[fqa:${category}]`
    switch (level) {
        case 'error':
            console.error(tag, message, meta ?? '')
            break
        case 'warn':
            console.warn(tag, message, meta ?? '')
            break
        case 'info':
            console.info(tag, message, meta ?? '')
            break
        default:
            console.debug(tag, message, meta ?? '')
    }

    notify()
    schedulePersist()
}

export const debug = (category: string, message: string, meta?: Record<string, unknown>) =>
    log('debug', category, message, meta)
export const info = (category: string, message: string, meta?: Record<string, unknown>) =>
    log('info', category, message, meta)
export const warn = (category: string, message: string, meta?: Record<string, unknown>) =>
    log('warn', category, message, meta)
export const error = (category: string, message: string, meta?: Record<string, unknown>) =>
    log('error', category, message, meta)

/** 当前缓冲的快照（控制面板 / 导出用） */
export function getLog(): LogEntry[] {
    return ringBuffer.slice()
}

export function clearLog(): void {
    ringBuffer = []
    persist()
    notify()
    info('logger', '诊断日志已清空')
}

/** 订阅日志变化，返回取消订阅的函数。供控制面板实时刷新 */
export function subscribe(fn: () => void): () => void {
    listeners.add(fn)
    return () => {
        listeners.delete(fn)
    }
}

/** 导出为 JSON 字符串（剪贴板复制用） */
export function exportLog(): string {
    return JSON.stringify(ringBuffer, null, 2)
}

/**
 * 导出为可读文本（粘贴到工单 / GitHub issue 时便于阅读）。
 * 格式：[时间] [级别] [分类] 消息 | meta
 */
export function exportLogText(): string {
    const lines: string[] = []
    for (const e of ringBuffer) {
        const t = new Date(e.ts).toISOString().slice(11, 23) // HH:MM:SS.mmm
        const tag = e.level.toUpperCase().padEnd(5)
        lines.push(`${t} [${tag}] [${e.category}] ${e.message}`)
        if (e.meta) {
            for (const [k, v] of Object.entries(e.meta)) {
                lines.push(`         ${k} = ${typeof v === 'string' ? v : JSON.stringify(v)}`)
            }
        }
    }
    return lines.join('\n')
}

/** 强制持久化（卸载前调用，避免丢失最后几条） */
export function flush(): void {
    if (persistTimer) {
        clearTimeout(persistTimer)
        persistTimer = null
    }
    persist()
}