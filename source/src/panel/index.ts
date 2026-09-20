// 控制面板：浮动小图标 + 点击展开 Popover，可一键升级为右侧侧栏。
//
// 4 个分区（用户原始诉求）：
//   - 状态：当前设备 + 池子总览 + 节流倒计时
//   - 设备池：3 个槽位的健康状态 + 手动切换 + 手动补员
//   - Pin 列表：已 pin 的书，每条有删除按钮
//   - 诊断日志：最近 30 条 + 复制全部 + 清空
//
// 模式：
//   - popover：默认，点击 ⚙️ 展开，外部点击自动关闭
//   - sidebar：永久显示在屏幕右侧，点齿轮切回 popover
//
// 实时刷新：
//   - 订阅 pool/cache/logger 的变更事件
//   - 节流倒计时每 1s 刷新一次（仅面板打开时）

import * as pool from '../pool'
import {
    listPinnedBooks,
    unpinBook,
    type PinnedBookMeta,
} from '../cache'
import {
    getLog, clearLog, exportLogText, subscribe as subscribeLogger,
    type LogEntry,
} from '../utils/logger'
import {
    getThrottleConfig, setThrottleConfig, getCountdownSeconds, resetThrottle,
} from '../utils/throttle'
import { info, warn } from '../utils/logger'

const PANEL_ID = 'fqa-control-panel'
const POPOVER_ID = 'fqa-control-popover'
const SIDEBAR_ID = 'fqa-control-sidebar'
const STYLE_ID = 'fqa-control-styles'

type Mode = 'popover' | 'sidebar'
let mode: Mode = (GM_getValue('fqa.panel.mode', 'popover') as Mode)
let mounted = false
let countdownTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const unsubs: Array<() => void> = []

export function mountPanel(): void {
    if (mounted) return
    mounted = true
    injectStyles()
    attachTriggerButton()

    unsubs.push(pool.subscribe(scheduleRefresh))
    unsubs.push(subscribeLogger(scheduleRefresh))
    info('panel', `控制面板已挂载（模式: ${mode}）`)
}

// 把"创建 + 挂 ⚙️ 按钮"抽出来，供 ensurePanelButton() 重复调用（SPA 路由切换会删 DOM）
function attachTriggerButton(): void {
    if (!document.body) return
    if (document.getElementById(PANEL_ID)) return  // 已存在不重复挂
    const button = document.createElement('button')
    button.id = PANEL_ID
    button.className = 'fqa-control-trigger'
    button.title = '番茄助手控制面板'
    button.textContent = '⚙️'
    button.addEventListener('click', toggleMode)
    document.body.appendChild(button)
}

// 自愈：SPA 路由切换可能清掉 ⚙️，调用一次确保按钮在 DOM 里
export function ensurePanelButton(): void {
    if (!mounted) return  // mountPanel 还没跑过就不管
    attachTriggerButton()
}

export function unmountPanel(): void {
    if (!mounted) return
    mounted = false
    if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
    }
    if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
    }
    unsubs.forEach((fn) => fn())
    unsubs.length = 0
    document.getElementById(PANEL_ID)?.remove()
    document.getElementById(POPOVER_ID)?.remove()
    document.getElementById(SIDEBAR_ID)?.remove()
}

function toggleMode(): void {
    if (mode === 'popover') {
        // 展开 popover
        const existing = document.getElementById(POPOVER_ID)
        if (existing) {
            existing.remove()
            stopCountdown()
            return
        }
        document.getElementById(SIDEBAR_ID)?.remove()
        renderPopover()
        startCountdown()
        mode = 'popover'
    } else {
        // sidebar ↔ popover 切换
        mode = 'popover'
        GM_setValue('fqa.panel.mode', mode)
        document.getElementById(SIDEBAR_ID)?.remove()
        renderPopover()
        startCountdown()
    }
}

function switchToSidebar(): void {
    mode = 'sidebar'
    GM_setValue('fqa.panel.mode', mode)
    document.getElementById(POPOVER_ID)?.remove()
    stopCountdown()
    renderSidebar()
}

function renderPopover(): void {
    const pop = document.createElement('div')
    pop.id = POPOVER_ID
    pop.className = 'fqa-control-popover'
    pop.innerHTML = buildHTML(true)
    document.body.appendChild(pop)
    bindActions(pop)
    // 外部点击关闭
    setTimeout(() => {
        document.addEventListener('click', onDocClickClosePopover)
    }, 0)
}

function renderSidebar(): void {
    const sb = document.createElement('div')
    sb.id = SIDEBAR_ID
    sb.className = 'fqa-control-sidebar'
    sb.innerHTML = buildHTML(false)
    document.body.appendChild(sb)
    bindActions(sb)
}

function onDocClickClosePopover(ev: MouseEvent): void {
    const pop = document.getElementById(POPOVER_ID)
    if (!pop) {
        document.removeEventListener('click', onDocClickClosePopover)
        return
    }
    const target = ev.target as Node
    if (pop.contains(target)) return
    if ((ev.target as HTMLElement)?.id === PANEL_ID) return
    pop.remove()
    stopCountdown()
    document.removeEventListener('click', onDocClickClosePopover)
}

function startCountdown(): void {
    if (countdownTimer) return
    countdownTimer = setInterval(() => {
        const el = document.querySelector('.fqa-throttle-countdown')
        if (el) {
            const s = getCountdownSeconds()
            el.textContent = s > 0 ? `${s}s` : '就绪'
        }
    }, 1000)
}

function stopCountdown(): void {
    if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
    }
}

function scheduleRefresh(): void {
    if (refreshTimer) return
    refreshTimer = setTimeout(() => {
        refreshTimer = null
        refreshContent()
    }, 100)
}

function refreshContent(): void {
    const pop = document.getElementById(POPOVER_ID)
    const sb = document.getElementById(SIDEBAR_ID)
    if (!pop && !sb) return
    const target = pop ?? sb
    if (!target) return
    // 仅替换内部可变区域，避免打断用户输入/焦点
    const newHTML = buildHTML(Boolean(pop))
    target.innerHTML = newHTML
    bindActions(target as HTMLElement)
}

function buildHTML(isPopover: boolean): string {
    const poolState = pool.getPoolState()
    const throttleCfg = getThrottleConfig()
    const countdown = getCountdownSeconds()
    const logs = getLog().slice(-30).reverse()
    // 同步渲染大部分，pinned 异步填充
    return `
        <div class="fqa-panel-header">
            <span class="fqa-panel-title">🍅 番茄助手 控制面板</span>
            <div class="fqa-panel-mode-switch">
                ${isPopover
                    ? '<button data-act="to_sidebar" title="固定为侧栏">⮮</button>'
                    : '<button data-act="to_popover" title="切回浮窗">⮯</button>'}
                <button data-act="help" title="帮助">?</button>
            </div>
        </div>

        <section class="fqa-panel-section">
            <h3>📊 状态</h3>
            <div class="fqa-panel-grid">
                <div>当前设备</div>
                <div class="fqa-mono">${poolState.slots[poolState.activeIndex]?.device_id?.slice(-6) ?? '—'}</div>
                <div>节流倒计时</div>
                <div><span class="fqa-throttle-countdown fqa-mono">${countdown > 0 ? `${countdown}s` : '就绪'}</span></div>
                <div>池子容量</div>
                <div>${poolState.slots.length} / 3 槽</div>
                <div>健康</div>
                <div>${poolState.slots.filter((s) => s.health === 'healthy').length} 健康</div>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>📱 设备池</h3>
            <div class="fqa-pool-list">
                ${renderPoolList(poolState)}
            </div>
            <div class="fqa-panel-actions">
                <button data-act="reset_pool" class="fqa-danger-btn">⚠ 重置整个池子</button>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>📌 已 Pin 的书</h3>
            <div class="fqa-pin-list" id="fqa-pin-list">
                <div class="fqa-pin-loading">加载中…</div>
            </div>
        </section>

        <section class="fqa-panel-section">
            <h3>⏱ 节流</h3>
            <label><input type="checkbox" data-cfg="throttle.enabled" ${throttleCfg.enabled ? 'checked' : ''}> 启用</label>
            <div class="fqa-panel-grid">
                <div>最小 (秒)</div>
                <input type="number" min="0" max="60" data-cfg="throttle.minSec" value="${Math.floor(throttleCfg.minMs / 1000)}">
                <div>最大 (秒)</div>
                <input type="number" min="5" max="180" data-cfg="throttle.maxSec" value="${Math.floor(throttleCfg.maxMs / 1000)}">
            </div>
            <button data-act="reset_throttle" class="fqa-small-btn">重置节流计时</button>
        </section>

        <section class="fqa-panel-section">
            <h3>📋 诊断日志 <span class="fqa-panel-sub">(${getLog().length}/200)</span></h3>
            <div class="fqa-log-list">
                ${renderLogs(logs)}
            </div>
            <div class="fqa-panel-actions">
                <button data-act="copy_log" class="fqa-small-btn">复制全部日志</button>
                <button data-act="clear_log" class="fqa-small-btn">清空日志</button>
            </div>
        </section>
    `
}

function renderPoolList(state: pool.PoolState): string {
    if (state.slots.length === 0) {
        return '<div class="fqa-pool-empty">池子为空。请刷新页面重新注册。</div>'
    }
    return state.slots.map((slot) => {
        const isActive = state.slots.indexOf(slot) === state.activeIndex
        const healthBadge = slot.health === 'healthy'
            ? '<span class="fqa-badge healthy">健康</span>'
            : '<span class="fqa-badge dead">已封</span>'
        const activeBadge = isActive ? '<span class="fqa-badge active">当前</span>' : ''
        const cooldownRemain = slot.refillCooldownUntil > Date.now()
            ? `<div class="fqa-pool-cooldown">冷却 ${Math.ceil((slot.refillCooldownUntil - Date.now()) / 1000 / 60)} 分钟</div>`
            : ''
        return `
            <div class="fqa-pool-item">
                <div class="fqa-pool-item-head">
                    <span class="fqa-pool-item-idx">槽 ${state.slots.indexOf(slot)}</span>
                    ${healthBadge} ${activeBadge}
                    <span class="fqa-mono fqa-pool-item-id">...${slot.device_id?.slice(-6) ?? '—'}</span>
                </div>
                <div class="fqa-pool-item-meta">
                    注册 ${formatRelative(slot.registeredAt)} · 失败 ${slot.failureStreak} 连
                </div>
                ${cooldownRemain}
                <div class="fqa-pool-item-actions">
                    ${!isActive && slot.health === 'healthy'
                        ? `<button data-act="manual_switch" data-slot="${state.slots.indexOf(slot)}" class="fqa-small-btn">切到此槽</button>`
                        : ''}
                    ${slot.health === 'dead'
                        ? `<button data-act="manual_refill" data-slot="${state.slots.indexOf(slot)}" class="fqa-small-btn">补新设备</button>`
                        : ''}
                </div>
            </div>
        `
    }).join('')
}

async function renderPinnedAsync(): Promise<void> {
    try {
        const list = await listPinnedBooks()
        const el = document.getElementById('fqa-pin-list')
        if (!el) return
        if (list.length === 0) {
            el.innerHTML = '<div class="fqa-pin-empty">尚未 pin 任何书。阅读时顶栏会有 pin 按钮。</div>'
            return
        }
        el.innerHTML = list.map((b) => renderPinItem(b)).join('')
    } catch (e) {
        warn('panel', 'Pin 列表加载失败', { error: String(e) })
    }
}

function renderPinItem(b: PinnedBookMeta): string {
    const sizeKb = (b.totalBytes / 1024).toFixed(1)
    const progress = b.lastReadIndex > 0
        ? `<div class="fqa-pin-progress">📖 读至第 ${b.lastReadIndex + 1} 章</div>`
        : ''
    return `
        <div class="fqa-pin-item">
            <div class="fqa-pin-item-head">
                <span class="fqa-pin-item-name">${escapeHtml(b.bookName)}</span>
                <button data-act="unpin" data-book="${b.id}" class="fqa-danger-btn">删除</button>
            </div>
            <div class="fqa-pin-item-meta">
                ${b.chapterCount} 章 · ${sizeKb} KB · pin 于 ${formatRelative(b.pinnedAt)}
            </div>
            ${progress}
        </div>
    `
}

function renderLogs(logs: LogEntry[]): string {
    if (logs.length === 0) {
        return '<div class="fqa-log-empty">暂无日志</div>'
    }
    return logs.map((e) => {
        const t = new Date(e.ts).toISOString().slice(11, 19)
        return `<div class="fqa-log-entry fqa-log-${e.level}">[${t}] [${e.category}] ${escapeHtml(e.message)}</div>`
    }).join('')
}

function bindActions(root: HTMLElement): void {
    root.addEventListener('click', (ev) => {
        const target = ev.target as HTMLElement
        const act = target.dataset.act
        if (!act) return
        ev.stopPropagation()
        switch (act) {
            case 'to_sidebar':
                switchToSidebar()
                break
            case 'to_popover':
                toggleMode()
                break
            case 'help':
                showHelp()
                break
            case 'manual_switch':
                handleManualSwitch(parseInt(target.dataset.slot ?? '-1', 10))
                break
            case 'manual_refill':
                handleManualRefill(parseInt(target.dataset.slot ?? '-1', 10))
                break
            case 'reset_pool':
                handleResetPool()
                break
            case 'reset_throttle':
                resetThrottle()
                scheduleRefresh()
                break
            case 'copy_log':
                copyLogToClipboard()
                break
            case 'clear_log':
                if (confirm('确认清空所有诊断日志？')) {
                    clearLog()
                    scheduleRefresh()
                }
                break
            case 'unpin':
                handleUnpin(target.dataset.book ?? '')
                break
        }
    })
    // 节流配置变更（输入框）
    root.querySelectorAll<HTMLInputElement>('[data-cfg]').forEach((input) => {
        input.addEventListener('change', () => {
            const key = input.dataset.cfg ?? ''
            if (key === 'throttle.enabled') {
                setThrottleConfig({ enabled: input.checked })
            } else if (key === 'throttle.minSec') {
                setThrottleConfig({ minMs: Math.max(0, parseInt(input.value, 10)) * 1000 })
            } else if (key === 'throttle.maxSec') {
                setThrottleConfig({ maxMs: Math.max(5, parseInt(input.value, 10)) * 1000 })
            }
        })
    })
    // Pin 列表异步填充
    void renderPinnedAsync()
}

function handleManualSwitch(slotIdx: number): void {
    if (slotIdx < 0) return
    const r = pool.manualSwitch(slotIdx)
    if (!r.ok) {
        alert(`切换失败: ${r.reason}`)
        return
    }
    scheduleRefresh()
}

async function handleManualRefill(slotIdx: number): Promise<void> {
    if (slotIdx < 0) return
    const btn = document.querySelector<HTMLButtonElement>(
        `button[data-act="manual_refill"][data-slot="${slotIdx}"]`,
    )
    if (btn) {
        btn.disabled = true
        btn.textContent = '注册中…'
    }
    const r = await pool.manualRefill(slotIdx)
    if (!r.ok) {
        alert(`补员失败: ${r.reason}`)
        if (btn) {
            btn.disabled = false
            btn.textContent = '补新设备'
        }
        return
    }
    scheduleRefresh()
}

async function handleResetPool(): Promise<void> {
    if (!confirm('重置整个池子会清空所有 3 个设备 ID 并重新注册。继续？')) return
    info('panel', '用户触发：重置整个池子')
    await pool.resetPool()
    scheduleRefresh()
}

async function handleUnpin(bookId: string): Promise<void> {
    if (!bookId) return
    if (!confirm('确认删除这本书的缓存？')) return
    await unpinBook(bookId)
    scheduleRefresh()
}

function copyLogToClipboard(): void {
    const text = exportLogText()
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
            () => info('panel', '日志已复制'),
            (e) => warn('panel', '复制失败', { error: String(e) }),
        )
    } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        try { document.execCommand('copy') } catch {}
        ta.remove()
    }
}

function showHelp(): void {
    alert(`🍅 番茄助手 控制面板 帮助

【设备池】
- 默认 3 个槽位，注册后会同时持有
- 某个被服务端封禁时，自动切换到下一个
- "补新设备"按钮手动注册替换 dead 槽（24h 冷却）

【节流】
- 5-25 秒随机间隔，避免请求模式被识别
- 偶发 30-90 秒长停顿，模拟真人阅读节奏

【Pin】
- 阅读器顶栏会有 📌 按钮
- 持久化保存整本书，可离线翻阅
- 最多 50 本 / 本最多 5000 章

【诊断日志】
- 最近 200 条（环形缓冲）
- 失败时会自动展开
- 可复制粘贴到工单/issue
`)
}

function formatRelative(ts: number): string {
    if (!ts) return '—'
    const diff = Date.now() - ts
    if (diff < 60_000) return '刚刚'
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`
    return `${Math.floor(diff / 86400_000)} 天前`
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function injectStyles(): void {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
        #${PANEL_ID} {
            position: fixed; bottom: 20px; right: 20px; z-index: 999998;
            width: 40px; height: 40px; border-radius: 50%;
            background: #ff6b35; color: #fff; border: none; cursor: pointer;
            font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform .2s;
        }
        #${PANEL_ID}:hover { transform: scale(1.1); }
        .fqa-control-popover {
            position: fixed; bottom: 70px; right: 20px; z-index: 999999;
            width: 380px; max-height: 80vh; overflow-y: auto;
            background: #1f1f1f; color: #eee; border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4); padding: 0;
            font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 13px; line-height: 1.5;
        }
        .fqa-control-sidebar {
            position: fixed; top: 0; right: 0; bottom: 0; width: 320px; z-index: 999999;
            background: #1f1f1f; color: #eee;
            box-shadow: -4px 0 16px rgba(0,0,0,0.3);
            overflow-y: auto; padding: 16px;
            font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 13px; line-height: 1.5;
        }
        .fqa-panel-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 16px; border-bottom: 1px solid #333;
        }
        .fqa-panel-title { font-weight: 600; font-size: 14px; }
        .fqa-panel-mode-switch button {
            background: transparent; color: #aaa; border: 1px solid #444;
            padding: 2px 8px; border-radius: 4px; margin-left: 4px; cursor: pointer;
        }
        .fqa-panel-mode-switch button:hover { background: #333; }
        .fqa-panel-section {
            padding: 12px 16px; border-bottom: 1px solid #2a2a2a;
        }
        .fqa-panel-section h3 { margin: 0 0 8px; font-size: 13px; color: #ff9d5c; }
        .fqa-panel-sub { color: #888; font-size: 11px; font-weight: normal; }
        .fqa-panel-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;
        }
        .fqa-panel-grid > div:nth-child(odd) { color: #aaa; }
        .fqa-mono { font-family: "SF Mono", Consolas, monospace; }
        .fqa-pool-item {
            background: #2a2a2a; border-radius: 6px; padding: 8px 10px;
            margin-bottom: 6px;
        }
        .fqa-pool-item-head {
            display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
        }
        .fqa-pool-item-idx { color: #ff9d5c; font-weight: 600; }
        .fqa-badge {
            font-size: 10px; padding: 1px 6px; border-radius: 3px; font-weight: 600;
        }
        .fqa-badge.healthy { background: #2d6a4f; color: #d8f3dc; }
        .fqa-badge.dead { background: #9d0208; color: #ffcdd2; }
        .fqa-badge.active { background: #ff6b35; color: #fff; }
        .fqa-pool-item-id { color: #888; font-size: 11px; margin-left: auto; }
        .fqa-pool-item-meta { color: #888; font-size: 11px; margin: 2px 0; }
        .fqa-pool-cooldown { color: #f4a261; font-size: 11px; }
        .fqa-pool-item-actions { margin-top: 6px; display: flex; gap: 4px; }
        .fqa-small-btn, .fqa-danger-btn {
            background: #444; color: #fff; border: none; padding: 4px 10px;
            border-radius: 4px; cursor: pointer; font-size: 12px;
        }
        .fqa-small-btn:hover { background: #555; }
        .fqa-danger-btn { background: #6a040f; }
        .fqa-danger-btn:hover { background: #9d0208; }
        .fqa-pin-item {
            background: #2a2a2a; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px;
        }
        .fqa-pin-item-head {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;
        }
        .fqa-pin-item-name { font-weight: 600; }
        .fqa-pin-item-meta { color: #888; font-size: 11px; }
        .fqa-pin-progress { color: #ff9d5c; font-size: 11px; margin-top: 4px; }
        .fqa-pin-empty, .fqa-pin-loading, .fqa-pool-empty, .fqa-log-empty {
            color: #888; font-size: 12px; font-style: italic; padding: 8px 0;
        }
        .fqa-log-list {
            max-height: 200px; overflow-y: auto;
            background: #0d0d0d; border-radius: 4px; padding: 6px 8px;
        }
        .fqa-log-entry {
            font-family: "SF Mono", Consolas, monospace; font-size: 11px;
            padding: 2px 0; border-bottom: 1px solid #1a1a1a;
            word-break: break-word;
        }
        .fqa-log-entry:last-child { border-bottom: none; }
        .fqa-log-error { color: #ff6b6b; }
        .fqa-log-warn { color: #f4a261; }
        .fqa-log-info { color: #87ceeb; }
        .fqa-log-debug { color: #888; }
        .fqa-panel-actions { margin-top: 8px; display: flex; gap: 6px; }
        .fqa-throttle-countdown { color: #5eead4; font-weight: 600; }
        input[type="checkbox"] { margin-right: 4px; }
        input[type="number"] {
            background: #2a2a2a; color: #fff; border: 1px solid #444;
            padding: 2px 6px; border-radius: 3px; width: 100%; box-sizing: border-box;
        }
    `
    document.head.appendChild(style)
}

// 自动挂载（如果有 body）
if (document.body) {
    mountPanel()
} else {
    document.addEventListener('DOMContentLoaded', mountPanel, { once: true })
}