// 失败恢复弹窗：当设备池发生自动切换、或池子空了时弹出。
//
// 选项（用户原始诉求）：
//   - [立即重试]：立刻重试当前请求（5s 冷却后发）
//   - [切换设备]：手动切到下一个 healthy 槽位
//   - [X 秒后自动重试]：退避重试，X 可选 10/30/60/120
//   - [查看诊断]：折叠展开诊断日志（最新 50 条）
//   - [放弃]：关闭弹窗，标记此次会话"放弃"，下次失败仍会弹
//
// v0.1.2 新增自动恢复倒计时：
//   - 全 dead 时 pool 自动调度 5min 后 reset 整个池子
//   - 恢复弹窗显示倒计时 + "取消自动重置"按钮
//   - 用户取消后, 当前会话不再自动 reset (页面刷新后才会重新调度)
//
// 设计：
//   - 浮动居中模态，不打断阅读器 DOM
//   - 点击背景或 X 不关闭（避免误关后再失败没提示）
//   - 默认展开"查看诊断"折叠区（你说便于查看日志）
//
// 与 pool 模块的关系：
//   - pool.subscribe() 订阅自动切换事件
//   - pool.getAutoResetPlan() / pool.cancelAutoReset() / pool.subscribeAutoResetExecute() 控制自动恢复
//   - 切换后主动查 getPoolState() 决定弹窗文案

import * as pool from '../pool'
import { info, warn, exportLogText } from '../utils/logger'

const MODAL_ID = 'fqa-recovery-modal'

type Reason =
    | { kind: 'auto_switched'; fromIndex: number; toIndex: number }
    | { kind: 'pool_empty' }
    | { kind: 'all_dead' }

interface RecoveryContext {
    reason: Reason
    shownAt: number
}

let currentContext: RecoveryContext | null = null
let mounted = false
let unsubPool: (() => void) | null = null
let unsubAutoResetExecute: (() => void) | null = null
let unsubAutoResetCancel: (() => void) | null = null

export function mountRecoveryUI(): void {
    if (mounted) return
    mounted = true
    unsubPool = pool.subscribe(handlePoolChange)
    // 自动 reset 完成后, reload 页面让 readerHook 重新跑
    unsubAutoResetExecute = pool.subscribeAutoResetExecute(() => {
        info('recovery', '自动 reset 已完成, 重新加载页面')
        stopAutoResetCountdown()
        removeModal()
        currentContext = null
        location.reload()
    })
    // 自动 reset 被取消后, 如果当前弹窗还开着就刷新一下 (移除倒计时区块)
    unsubAutoResetCancel = pool.subscribeAutoResetCancel(() => {
        info('recovery', '自动 reset 被取消, 移除倒计时区块')
        const modal = document.getElementById(MODAL_ID)
        if (modal) {
            const block = modal.querySelector('#fqa-recovery-auto-reset')
            if (block) block.remove()
        }
        stopAutoResetCountdown()
    })
    // 检查持久化的自动 reset 计划 (页面刷新后保留)
    const plan = pool.getAutoResetPlan()
    if (plan) {
        info('recovery', `检测到持久化的自动 reset 计划, 剩余 ${Math.round((plan.plannedAt - Date.now()) / 1000)}s`)
    }
    info('recovery', '恢复弹窗模块已挂载')
}

export function unmountRecoveryUI(): void {
    if (!mounted) return
    mounted = false
    if (unsubPool) {
        unsubPool()
        unsubPool = null
    }
    if (unsubAutoResetExecute) {
        unsubAutoResetExecute()
        unsubAutoResetExecute = null
    }
    if (unsubAutoResetCancel) {
        unsubAutoResetCancel()
        unsubAutoResetCancel = null
    }
    removeModal()
    currentContext = null
}

function handlePoolChange(): void {
    const state = pool.getPoolState()
    if (state.slots.length === 0) return
    const active = state.slots[state.activeIndex]
    if (!active) return
    // 当前槽位 dead 且没有 healthy 备用 → 弹"无路可走"提示
    if (active.health === 'dead') {
        const healthyCount = state.slots.filter((s) => s.health === 'healthy').length
        if (healthyCount === 0) {
            showModal({
                reason: { kind: 'all_dead' },
                shownAt: Date.now(),
            })
        }
    }
}

/** 由集成层在检测到请求失败时主动调用（例如 api/app 收到 EmptyResponse） */
export function notifyFailure(switchedFrom?: number, switchedTo?: number): void {
    if (typeof switchedFrom === 'number' && typeof switchedTo === 'number') {
        showModal({
            reason: { kind: 'auto_switched', fromIndex: switchedFrom, toIndex: switchedTo },
            shownAt: Date.now(),
        })
    } else {
        const state = pool.getPoolState()
        const healthyCount = state.slots.filter((s) => s.health === 'healthy').length
        showModal({
            reason: healthyCount === 0 ? { kind: 'all_dead' } : { kind: 'pool_empty' },
            shownAt: Date.now(),
        })
    }
}

function showModal(ctx: RecoveryContext): void {
    // 同一上下文不重复弹
    if (currentContext && contextsEqual(currentContext.reason, ctx.reason)) return
    currentContext = ctx
    removeModal()

    const modal = document.createElement('div')
    modal.id = MODAL_ID
    modal.className = 'fqa-recovery-modal'
    modal.innerHTML = renderModalHTML(ctx)
    document.body.appendChild(modal)
    bindActions(modal)
    // 如果显示了自动重置倒计时, 启动 tick
    if (pool.getAutoResetPlan()) {
        startAutoResetCountdown(modal)
    }
    info('recovery', '弹出失败恢复提示', { reason: ctx.reason })
}

function removeModal(): void {
    const old = document.getElementById(MODAL_ID)
    if (old) old.remove()
}

function contextsEqual(a: Reason, b: Reason): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
}

function renderModalHTML(ctx: RecoveryContext): string {
    const reasonText = renderReason(ctx.reason)
    const autoReset = pool.getAutoResetPlan()
    const autoResetBlock = autoReset
        ? `<div class="fqa-recovery-auto-reset" id="fqa-recovery-auto-reset">
                <div class="fqa-recovery-auto-reset-title">🤖 自动恢复已启用</div>
                <div class="fqa-recovery-auto-reset-body">
                    检测到所有设备 dead, 系统将在
                    <strong id="fqa-auto-reset-countdown" class="fqa-countdown">--</strong>
                    秒后自动重置整个设备池并重新注册 3 个新设备。
                </div>
                <button data-action="cancel_auto_reset" class="fqa-recovery-btn">取消自动重置</button>
            </div>`
        : ''
    return `
        <div class="fqa-recovery-backdrop">
            <div class="fqa-recovery-dialog" role="dialog" aria-modal="true">
                <div class="fqa-recovery-header">
                    <span class="fqa-recovery-icon">⚠️</span>
                    <span class="fqa-recovery-title">阅读遇到问题</span>
                </div>
                <div class="fqa-recovery-body">
                    <p class="fqa-recovery-reason">${reasonText}</p>
                    ${autoResetBlock}
                    <div class="fqa-recovery-actions">
                        <button data-action="retry_now" class="fqa-recovery-btn primary">立即重试</button>
                        <button data-action="manual_switch" class="fqa-recovery-btn">切换设备</button>
                        <div class="fqa-recovery-backoff">
                            <button data-action="backoff" data-seconds="10" class="fqa-recovery-btn small">10s 后重试</button>
                            <button data-action="backoff" data-seconds="30" class="fqa-recovery-btn small">30s 后重试</button>
                            <button data-action="backoff" data-seconds="60" class="fqa-recovery-btn small">60s 后重试</button>
                            <button data-action="backoff" data-seconds="120" class="fqa-recovery-btn small">120s 后重试</button>
                        </div>
                        <button data-action="diagnostic" class="fqa-recovery-btn">查看诊断 ▼</button>
                        <button data-action="reset_pool" class="fqa-recovery-btn danger">⚠ 重置整个池子</button>
                        <button data-action="giveup" class="fqa-recovery-btn warn">放弃本次</button>
                    </div>
                    <details class="fqa-recovery-diag" id="fqa-recovery-diag">
                        <summary style="display:none">诊断日志</summary>
                        <pre class="fqa-recovery-log">${escapeHtml(exportLogText() || '（暂无日志）')}</pre>
                        <div class="fqa-recovery-diag-actions">
                            <button data-action="copy_log" class="fqa-recovery-btn small">复制日志</button>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    `
}

function renderReason(r: Reason): string {
    switch (r.kind) {
        case 'auto_switched':
            return `当前设备失效，已自动切换到槽 ${r.toIndex}。继续阅读前可手动确认或重试。`
        case 'pool_empty':
            return `设备池为空，所有槽位都不可用。请检查诊断或稍后重试。`
        case 'all_dead':
            return `所有 ${pool.getPoolState().slots.length} 个设备都已 dead，无法继续阅读。请在控制面板手动补员。`
    }
}

function bindActions(modal: HTMLElement): void {
    modal.addEventListener('click', (ev) => {
        const target = ev.target as HTMLElement
        if (!target.dataset.action) {
            // 点背景不关
            return
        }
        const action = target.dataset.action
        switch (action) {
            case 'retry_now':
                handleRetryNow()
                break
            case 'manual_switch':
                handleManualSwitch()
                break
            case 'backoff':
                handleBackoff(parseInt(target.dataset.seconds ?? '30', 10))
                break
            case 'diagnostic':
                toggleDiagnostic(modal)
                break
            case 'copy_log':
                copyLogToClipboard()
                break
            case 'reset_pool':
                handleResetPool(modal)
                break
            case 'cancel_auto_reset':
                handleCancelAutoReset(modal)
                break
            case 'giveup':
                handleGiveup()
                break
        }
    })
    // 自动展开诊断区（用户偏好：可展开看到日志）
    requestAnimationFrame(() => toggleDiagnostic(modal))
}

let autoResetTickTimer: ReturnType<typeof setInterval> | null = null

function startAutoResetCountdown(modal: HTMLElement): void {
    stopAutoResetCountdown()
    const tick = () => {
        const plan = pool.getAutoResetPlan()
        const el = modal.querySelector<HTMLElement>('#fqa-auto-reset-countdown')
        if (!el) {
            stopAutoResetCountdown()
            return
        }
        if (!plan) {
            el.textContent = '--'
            stopAutoResetCountdown()
            return
        }
        const remainingSec = Math.max(0, Math.round((plan.plannedAt - Date.now()) / 1000))
        el.textContent = String(remainingSec)
        if (remainingSec <= 0) {
            stopAutoResetCountdown()
        }
    }
    tick()
    autoResetTickTimer = setInterval(tick, 1000)
}

function stopAutoResetCountdown(): void {
    if (autoResetTickTimer) {
        clearInterval(autoResetTickTimer)
        autoResetTickTimer = null
    }
}

function handleResetPool(_modal: HTMLElement): void {
    info('recovery', '用户从恢复弹窗触发：重置整个池子')
    if (!confirm('重置整个池子会清空所有 3 个设备 ID 并重新注册。继续？')) return
    stopAutoResetCountdown()
    removeModal()
    currentContext = null
    void pool.resetPool().then(() => {
        info('recovery', '重置完成, 重新加载页面让 readerHook 重试')
        location.reload()
    })
}

function handleCancelAutoReset(modal: HTMLElement): void {
    const ok = pool.cancelAutoReset()
    if (ok) {
        info('recovery', '用户取消了自动重置')
        // 移除自动重置区块
        const block = modal.querySelector('#fqa-recovery-auto-reset')
        if (block) block.remove()
        stopAutoResetCountdown()
    }
}

function handleRetryNow(): void {
    info('recovery', '用户选择立即重试')
    removeModal()
    currentContext = null
    // 触发刷新当前页面让 readerHook 重新发起请求
    location.reload()
}

function handleManualSwitch(): void {
    info('recovery', '用户选择手动切换设备')
    const state = pool.getPoolState()
    const fromIndex = state.activeIndex
    // 找下一个 healthy
    for (let offset = 1; offset <= state.slots.length; offset++) {
        const idx = (fromIndex + offset) % state.slots.length
        if (state.slots[idx]?.health === 'healthy') {
            const r = pool.manualSwitch(idx)
            if (r.ok) {
                removeModal()
                currentContext = null
                location.reload()
                return
            }
        }
    }
    warn('recovery', '手动切换失败：无 healthy 槽位')
}

function handleBackoff(seconds: number): void {
    info('recovery', `用户选择 ${seconds}s 后自动重试`)
    removeModal()
    currentContext = null
    setTimeout(() => {
        location.reload()
    }, seconds * 1000)
}

function toggleDiagnostic(modal: HTMLElement): void {
    const details = modal.querySelector<HTMLDetailsElement>('#fqa-recovery-diag')
    if (!details) return
    details.open = !details.open
    // 滚动到底部
    if (details.open) {
        const pre = details.querySelector('pre')
        if (pre) pre.scrollTop = pre.scrollHeight
    }
}

function copyLogToClipboard(): void {
    const text = exportLogText()
    // 优先用 navigator.clipboard
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
            () => info('recovery', '诊断日志已复制到剪贴板'),
            (e) => warn('recovery', '复制失败', { error: String(e) }),
        )
        return
    }
    // 兜底：textarea + execCommand
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try {
        document.execCommand('copy')
        info('recovery', '诊断日志已复制（execCommand 兜底）')
    } catch (e) {
        warn('recovery', '复制失败', { error: String(e) })
    }
    ta.remove()
}

function handleGiveup(): void {
    info('recovery', '用户选择放弃本次')
    removeModal()
    currentContext = null
    // 不 reload，让用户决定下一步
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}