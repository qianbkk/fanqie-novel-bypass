// 搜索词的唯一来源。
//
// URL 和视图都要能改搜索词，各自持有一份必然打架：hook 收到 onUrlChange 后
// 重挂视图，会把视图刚发起的搜索冲掉。所以把搜索词提到这里，
// hook 只负责 URL -> ref，视图只负责 ref -> URL，两边都跳过与当前值相同的更新。

import { ref } from 'vue'

/** 当前搜索词，空串表示落地页 */
export const routeQuery = ref('')

/** /search/<词> 里的词，落地页返回空串 */
export function parseQuery(path: string): string {
    const rest = path.replace(/^\/search\/?/, '')
    if (!rest) return ''
    try {
        return decodeURIComponent(rest)
    } catch {
        // 非法百分号编码时按原文处理
        return rest
    }
}

/** URL -> 状态。hook 在 load / onUrlChange 时调用 */
export function syncFromUrl(path: string): void {
    const q = parseQuery(path)
    if (routeQuery.value !== q) routeQuery.value = q
}

/** 状态 -> URL。视图在用户提交搜索时调用 */
export function pushQuery(q: string): void {
    routeQuery.value = q
    const next = q ? `/search/${encodeURIComponent(q)}` : '/search'
    if (unsafeWindow.location.pathname === next) return
    // pushState 保留前进后退；脚本自身的导航钩子会收到通知，
    // 那边比对后发现与 routeQuery 一致，不会重复触发搜索
    unsafeWindow.history.pushState(null, '', next)
}
