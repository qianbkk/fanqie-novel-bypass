const SECOND = 1_000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export function normalizeTimestamp(ts?: number | null): number {
    if (!ts || ts <= 0) return 0
    return ts < 1e12 ? ts * 1000 : ts
}

export function fromNow(ts?: number | null): string {
    const time = normalizeTimestamp(ts)
    if (!time) return '从未'
    const diff = Date.now() - time
    if (diff < MINUTE) return '刚刚'
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}分钟前`
    if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`
    if (diff < MONTH) return `${Math.floor(diff / DAY)}天前`
    if (diff < YEAR) return `${Math.floor(diff / MONTH)}个月前`
    return `${Math.floor(diff / YEAR)}年前`
}

export function formatDateTime(ts?: number | null): string {
    const time = normalizeTimestamp(ts)
    if (!time) return '未知'
    const d = new Date(time)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
