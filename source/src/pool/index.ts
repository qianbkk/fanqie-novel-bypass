// 设备池管理：3 个槽位 + 启动时一次性注册 + 失败自动切换 + 手动补员 + 全 dead 自动恢复。
//
// 设计动机：
//   - L6 防线：原版 "replaceDevice on failure" 是死亡螺旋主因。
//     本池把"是否重新冒险"的决策权交还用户：判封后自动换到下一个槽位，
//     但绝不自动注册新设备。
//
//   - 「不自残」针对单设备风控有效，但**极端情况**（snssdk 把同 IP/fingerprint
//     所有设备都风控了）会让用户卡在"3 个槽全 dead"状态，必须手动 reset。
//     **v0.1.2 改进**：检测到「全 dead」时，启动 5 分钟倒计时自动 reset 整个池子，
//     给用户恢复能力（不需要每次被要求手动点）。
//     安全护栏：24h 内最多自动 reset 一次，避免触发 snssdk 批量注册风控。
//
// 数据模型：
//   - slots: 3 个槽位，每个有 device_id/install_id/key_info 等
//   - activeIndex: 当前生效槽位下标
//   - 失败计数：每个槽位独立记，连续 2 次失败则标记 dead
//   - 补员冷却：dead 槽位 24h 内不能补（防你连点触发批量注册）
//   - lastAutoResetAt: 24h 内最多自动 reset 一次（持久化）
//
// 启动行为：
//   - 首次安装：注册槽 1 立刻可用，槽 2/3 在后台分别延迟 10s/30s 注册
//     （避免"3 个设备同时注册"的批量注册风控）
//   - 已有池子：直接复用，无需重新注册
//
// 与原版 provision.ts 的关系：
//   - 本模块**取代** ensureDevice() 和 replaceDevice()
//   - 通过 setActiveDevice() 把当前槽位的设备信息推给 config.currentConfig
//   - 通过 recordSuccess()/recordFailure() 上报请求结果

import configStore, { type DeviceConfig, type KeyInfo, defaultConfig } from '../config'
import { b64encode } from '../crypto'
import { del, read, write } from '../localStorage'
import { registerDevice, activatePremium, registerKey } from '../api/device'
import { settings } from '../settings'
import { info, warn, error as logError, debug } from '../utils/logger'

const POOL_STORAGE_KEY = 'fqa.device_pool.v1'
const POOL_SIZE = 3
const FAILURE_THRESHOLD = 2
const REFILL_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 小时
const STAGGER_REGISTER_MS = [0, 10_000, 30_000] // 启动后槽 2/3 延迟注册时间
// 自动恢复: 全部槽 dead 后等 5 分钟自动 reset 整个池子
const AUTO_RESET_DELAY_MS = 5 * 60 * 1000
// 自动 reset 节流: 24h 内最多自动 reset 一次 (避免触发 snssdk 批量注册风控)
const AUTO_RESET_THROTTLE_MS = 24 * 60 * 60 * 1000
// 自动 reset 计划时间持久化 key (跨页面刷新保留)
const AUTO_RESET_PLAN_KEY = 'fqa.auto_reset_plan.v1'

export type SlotHealth = 'healthy' | 'dead'

export interface PoolSlot {
    index: number
    device_id: string
    install_id: string
    device_type?: string
    key_info?: KeyInfo
    vip_expire_time?: string
    health: SlotHealth
    /** 连续失败次数（成功时清零） */
    failureStreak: number
    /** 最后一次失败时间 */
    lastFailureAt: number
    /** 注册时间 */
    registeredAt: number
    /** 最后一次成功时间 */
    lastSuccessAt: number
    /** 手动补员冷却结束时间（被标记 dead 后开始算） */
    refillCooldownUntil: number
}

export interface PoolState {
    slots: PoolSlot[]
    activeIndex: number
}

const EMPTY_POOL: PoolState = {
    slots: [],
    activeIndex: 0,
}

/** 池子上的订阅者（控制面板刷新） */
const listeners = new Set<() => void>()

/** 自动 reset 计划（如果已调度，保存 setTimeout id + 计划触发时间） */
interface AutoResetPlan {
    /** setTimeout id (用于 cancelAutoReset) */
    timerId: ReturnType<typeof setTimeout> | null
    /** 计划触发时间戳 (用于持久化跨页面刷新) */
    plannedAt: number
    /** 调度时间戳 */
    scheduledAt: number
}

let autoResetPlan: AutoResetPlan | null = null
/** 取消自动 reset 后的回调（恢复弹窗倒计时需要清空） */
let autoResetCancelListeners: Set<() => void> = new Set()
/** 自动 reset 实际执行后的回调（恢复弹窗需要重载页面） */
let autoResetExecuteListeners: Set<() => void> = new Set()

function loadPool(): PoolState {
    const raw = read(POOL_STORAGE_KEY) as PoolState | null
    if (!raw || !Array.isArray(raw.slots)) return structuredClone(EMPTY_POOL)
    return raw
}

function savePool(p: PoolState): void {
    write(POOL_STORAGE_KEY, p)
}

function notify(): void {
    listeners.forEach((fn) => {
        try { fn() } catch (e) { console.warn('[fqa:pool] listener error:', e) }
    })
}

/**
 * 启动入口。
 *
 * 1. 加载已持久化的池子
 * 2. 若手填了设备，回退到单设备模式（不进入池子）
 * 3. 若池子未满，调度注册（首次启动走 stagger；后续启动不应该有空槽）
 */
export async function initPool(): Promise<void> {
    const { deviceId, installId } = settings
    if (deviceId.trim() && installId.trim()) {
        info('pool', '手填设备模式，跳过池子初始化')
        // 手填设备沿用 ensureDevice 行为，单槽位
        await ensureSingleDeviceFromSettings()
        return
    }

    let pool = loadPool()
    if (pool.slots.length === 0) {
        info('pool', '池子为空，开始首次注册…')
        // 同步注册第一个，异步注册第二三个
        const slot0 = await provisionSingleSlot()
        if (!slot0) {
            warn('pool', '首槽注册失败，回退到内置匿名设备')
            configStore.currentConfig = defaultConfig
            return
        }
        pool = {
            slots: [slot0],
            activeIndex: 0,
        }
        savePool(pool)
        scheduleBackgroundFills(pool)
    } else {
        info('pool', `复用池子（${pool.slots.length} 个槽位）`, {
            activeIndex: pool.activeIndex,
            healthy: pool.slots.filter((s) => s.health === 'healthy').length,
        })
    }

    // 推当前槽位给 config.currentConfig
    pushActiveToConfig(pool)
    // 健康自检：当前槽位如果已 dead 且有 healthy 的，自动切
    if (getActiveSlot(pool)?.health === 'dead') {
        const next = findHealthySlotIndex(pool, pool.activeIndex)
        if (next !== -1) {
            info('pool', `当前槽位 dead,自动切换到槽 ${next}`)
            pool.activeIndex = next
            savePool(pool)
            pushActiveToConfig(pool)
        } else {
            warn('pool', '当前槽位 dead 且无备用槽位,请手动补员')
            // v0.1.2: 全 dead 时调度自动 reset (5min 后)
            detectAllDeadAndSchedule()
        }
    } else if (pool.slots.every((s) => s.health === 'dead')) {
        // 极端情况: 所有槽都 dead (例如 active 是被 refill 的 placeholder)
        warn('pool', '所有槽位 dead, 调度自动 reset')
        detectAllDeadAndSchedule()
    }
    notify()
}

async function ensureSingleDeviceFromSettings(): Promise<void> {
    // 与原版 ensureDevice 行为一致
    const cached = read('device') as DeviceConfig | null
    if (cached) {
        configStore.currentConfig = cached
        return
    }
    try {
        const dev = await registerDevice()
        const vip = await activatePremium(dev)
        const keyInfo = await registerKey(dev)
        const c: DeviceConfig = {
            device_id: dev.device_id,
            install_id: dev.install_id,
            device_type: dev.device_type,
            key_info: keyInfo,
        }
        configStore.currentConfig = c
        write('device', c)
        write('keyinfo', { key: b64encode(keyInfo.key!), keyver: keyInfo.keyver })
        info('pool', '手填模式注册新设备完成', { device_id: c.device_id })
        if (vip) debug('pool', `VIP 到期 ${vip}`)
    } catch (e) {
        warn('pool', '手填模式注册失败', { error: String(e) })
        configStore.currentConfig = defaultConfig
    }
}

function scheduleBackgroundFills(_pool: PoolState): void {
    for (let i = 1; i < POOL_SIZE; i++) {
        const delay = STAGGER_REGISTER_MS[i] ?? (i * 30_000)
        setTimeout(() => {
            void fillSlotIfEmpty(i)
        }, delay)
    }
}

async function fillSlotIfEmpty(index: number): Promise<void> {
    const pool = loadPool()
    if (pool.slots.length > index && pool.slots[index]) {
        debug('pool', `槽 ${index} 已有设备，跳过`)
        return
    }
    info('pool', `开始填充槽 ${index}…`)
    const slot = await provisionSingleSlot()
    if (!slot) {
        warn('pool', `槽 ${index} 注册失败`)
        return
    }
    const newPool: PoolState = {
        slots: [...pool.slots],
        activeIndex: pool.activeIndex,
    }
    // 填到指定 index（中间可能有 undefined，用 placeholder）
    while (newPool.slots.length <= index) {
        newPool.slots.push(slot)
    }
    newPool.slots[index] = slot
    savePool(newPool)
    notify()
    info('pool', `槽 ${index} 已填充`, { device_id: slot.device_id })
}

/** 完整 provision 一个槽位（含 key 注册 + VIP 激活） */
async function provisionSingleSlot(): Promise<PoolSlot | null> {
    try {
        const dev = await registerDevice()
        const vip = await activatePremium(dev)
        const keyInfo = await registerKey(dev)
        return {
            index: 0, // 后续会被填到正确位置
            device_id: dev.device_id,
            install_id: dev.install_id,
            device_type: dev.device_type,
            key_info: keyInfo,
            vip_expire_time: vip || undefined,
            health: 'healthy',
            failureStreak: 0,
            lastFailureAt: 0,
            registeredAt: Date.now(),
            lastSuccessAt: 0,
            refillCooldownUntil: 0,
        }
    } catch (e) {
        logError('pool', 'provisionSingleSlot 失败', { error: String(e) })
        return null
    }
}

/** 推当前 active 槽位的设备信息给 config.currentConfig */
function pushActiveToConfig(pool: PoolState): void {
    const slot = getActiveSlot(pool)
    if (!slot) return
    configStore.currentConfig = {
        device_id: slot.device_id,
        install_id: slot.install_id,
        device_type: slot.device_type,
        key_info: slot.key_info,
    }
    // content.ts 的 ensureKeyinfo 读 keyinfo key，要保持同步
    if (slot.key_info) {
        write('keyinfo', { key: b64encode(slot.key_info.key!), keyver: slot.key_info.keyver })
    }
}

function getActiveSlot(pool: PoolState): PoolSlot | undefined {
    return pool.slots[pool.activeIndex]
}

/** 找下一个 healthy 槽位（从 index+1 开始环形） */
function findHealthySlotIndex(pool: PoolState, fromIndex: number): number {
    if (pool.slots.length === 0) return -1
    for (let offset = 1; offset <= pool.slots.length; offset++) {
        const idx = (fromIndex + offset) % pool.slots.length
        if (pool.slots[idx]?.health === 'healthy') return idx
    }
    return -1
}

/**
 * 报告一次成功（来自 api/app 层）。
 * 重置当前 active 槽位的失败计数。
 */
export function recordSuccess(): void {
    const pool = loadPool()
    const slot = getActiveSlot(pool)
    if (!slot) return
    if (slot.failureStreak !== 0 || slot.lastSuccessAt === 0) {
        slot.failureStreak = 0
        slot.lastSuccessAt = Date.now()
        savePool(pool)
        notify()
    }
}

/**
 * 报告一次失败（来自 api/app 层）。
 *
 * 行为：
 *   - 当前 active 槽位 failureStreak += 1
 *   - 若 < FAILURE_THRESHOLD：保持现状
 *   - 若 >= FAILURE_THRESHOLD：标记 dead，自动切换到下一个 healthy 槽位
 *     并设置 refillCooldownUntil
 *
 * 返回值：是否发生了切换（控制面板可据此触发恢复弹窗）
 */
export function recordFailure(): { switched: boolean; reason: string } {
    const pool = loadPool()
    const slot = getActiveSlot(pool)
    if (!slot) return { switched: false, reason: 'no active slot' }

    slot.failureStreak += 1
    slot.lastFailureAt = Date.now()

    if (slot.failureStreak < FAILURE_THRESHOLD) {
        savePool(pool)
        notify()
        return {
            switched: false,
            reason: `失败 ${slot.failureStreak}/${FAILURE_THRESHOLD}，未触发切换`,
        }
    }

    // 触发切换
    slot.health = 'dead'
    slot.refillCooldownUntil = Date.now() + REFILL_COOLDOWN_MS
    info('pool', `槽 ${pool.activeIndex} 已标记 dead`, {
        device_id: slot.device_id,
        failureStreak: slot.failureStreak,
    })

    const next = findHealthySlotIndex(pool, pool.activeIndex)
    if (next === -1) {
        savePool(pool)
        notify()
        warn('pool', '无可用 healthy 槽位，池子空了')
        // v0.1.2: 全 dead 后 5min 自动 reset 整个池子 (替代"必须用户手动")
        detectAllDeadAndSchedule()
        return { switched: false, reason: 'no healthy slot available' }
    }

    pool.activeIndex = next
    savePool(pool)
    pushActiveToConfig(pool)
    notify()
    const nextSlot = pool.slots[next]
    info('pool', `已切换到槽 ${next}`, { device_id: nextSlot?.device_id ?? 'unknown' })
    return { switched: true, reason: `auto-switched to slot ${next}` }
}

/**
 * 手动切换槽位（用户在面板点"切换到槽 N"）。
 *
 * 校验：目标槽位必须 healthy 才能切。
 */
export function manualSwitch(toIndex: number): { ok: boolean; reason?: string } {
    const pool = loadPool()
    if (toIndex < 0 || toIndex >= pool.slots.length) {
        return { ok: false, reason: `槽 ${toIndex} 不存在` }
    }
    const target = pool.slots[toIndex]
    if (!target) return { ok: false, reason: `槽 ${toIndex} 为空` }
    if (target.health === 'dead') {
        return { ok: false, reason: `槽 ${toIndex} 已 dead，请先补员` }
    }
    pool.activeIndex = toIndex
    target.failureStreak = 0 // 手动切视作重置
    savePool(pool)
    pushActiveToConfig(pool)
    notify()
    info('pool', `手动切换到槽 ${toIndex}`, { device_id: target.device_id })
    return { ok: true }
}

/**
 * 手动补员：在指定槽位上重新注册一个新设备替换 dead 的。
 *
 * 校验：
 *   - 槽位必须存在且 dead
 *   - 冷却未结束则拒绝
 *
 * @returns ok=false 时 reason 给出原因
 */
export async function manualRefill(index: number): Promise<{ ok: boolean; reason?: string }> {
    const pool = loadPool()
    if (index < 0 || index >= POOL_SIZE) {
        return { ok: false, reason: `槽 ${index} 不存在（池容量 ${POOL_SIZE}）` }
    }
    if (index >= pool.slots.length) {
        return { ok: false, reason: `槽 ${index} 尚未注册，无法补员` }
    }
    const slot = pool.slots[index]
    if (!slot) return { ok: false, reason: `槽 ${index} 为空` }
    if (slot.health === 'healthy') {
        return { ok: false, reason: `槽 ${index} 健康，不需要补员` }
    }
    if (slot.refillCooldownUntil > Date.now()) {
        const remain = Math.ceil((slot.refillCooldownUntil - Date.now()) / 1000 / 60)
        return { ok: false, reason: `槽 ${index} 补员冷却中，还剩 ${remain} 分钟` }
    }

    info('pool', `开始手动补员槽 ${index}…`)
    const newSlot = await provisionSingleSlot()
    if (!newSlot) {
        return { ok: false, reason: '新设备注册失败，请查看诊断' }
    }
    newSlot.index = index
    pool.slots[index] = newSlot
    // 如果补的是当前 active 槽位，立即推给 config
    if (pool.activeIndex === index) {
        pushActiveToConfig(pool)
    }
    savePool(pool)
    notify()
    info('pool', `槽 ${index} 补员完成`, { device_id: newSlot.device_id })
    return { ok: true }
}

/** 列出池子状态（控制面板用） */
export function getPoolState(): PoolState {
    return loadPool()
}

/** 重置整个池子（清空所有槽位）。慎用，会让所有设备 ID 失效。 */
export async function resetPool(): Promise<void> {
    info('pool', '正在重置整个设备池…')
    // 清理可能存在的自动 reset 计划 (用户主动 reset 就不需要自动了)
    if (autoResetPlan?.timerId) {
        clearTimeout(autoResetPlan.timerId)
    }
    autoResetPlan = null
    del(AUTO_RESET_PLAN_KEY)
    del(POOL_STORAGE_KEY)
    del('device')
    del('keyinfo')
    configStore.currentConfig = defaultConfig
    notify()
    await initPool()
}

/** 订阅池子变化（控制面板刷新） */
export function subscribe(fn: () => void): () => void {
    listeners.add(fn)
    return () => {
        listeners.delete(fn)
    }
}

// ============================================================================
// 自动恢复: 全 dead 后 5min 自动 reset 整个池子
// ============================================================================

/** 当前自动 reset 计划（如果已调度）。null = 未调度 */
export function getAutoResetPlan(): { plannedAt: number; scheduledAt: number } | null {
    if (!autoResetPlan) {
        // 检查持久化: 如果持久化有时间戳, 说明是页面刷新前留下的
        const persisted = read(AUTO_RESET_PLAN_KEY) as { plannedAt: number; scheduledAt: number } | null
        if (persisted && persisted.plannedAt > Date.now()) {
            // 重新调度剩余时间
            const remaining = persisted.plannedAt - Date.now()
            scheduleAutoResetInternal(remaining, persisted.scheduledAt)
            return persisted
        }
        return null
    }
    return {
        plannedAt: autoResetPlan.plannedAt,
        scheduledAt: autoResetPlan.scheduledAt,
    }
}

/** 调度自动 reset（核心逻辑，不暴露 delay 参数；固定 5 分钟） */
function scheduleAutoResetInternal(remainingMs: number, originalScheduledAt: number): void {
    if (autoResetPlan?.timerId) {
        clearTimeout(autoResetPlan.timerId)
    }
    autoResetPlan = {
        timerId: null,
        plannedAt: Date.now() + remainingMs,
        scheduledAt: originalScheduledAt,
    }
    // 持久化 (跨页面刷新保留)
    write(AUTO_RESET_PLAN_KEY, {
        plannedAt: autoResetPlan.plannedAt,
        scheduledAt: autoResetPlan.scheduledAt,
    })
    info('pool', `自动 reset 已调度: ${Math.round(remainingMs / 1000)}s 后执行 (可手动取消)`)
    autoResetPlan.timerId = setTimeout(() => {
        void executeAutoReset()
    }, remainingMs)
}

/** 检测当前池状态，全 dead 且未冷却时调度自动 reset */
function detectAllDeadAndSchedule(): void {
    const pool = loadPool()
    if (pool.slots.length === 0) return
    const allDead = pool.slots.every((s) => s.health === 'dead')
    if (!allDead) return
    // 已调度就不重复
    if (autoResetPlan) return
    // 24h 节流: 上次自动 reset 后 24h 内不重复
    const lastAt = (read('fqa.last_auto_reset.v1') as number | null) ?? 0
    if (Date.now() - lastAt < AUTO_RESET_THROTTLE_MS) {
        debug('pool', '24h 内已自动 reset 过, 不重复调度')
        return
    }
    info('pool', '全 dead 状态检测到, 调度 5min 后自动 reset 整个池子')
    scheduleAutoResetInternal(AUTO_RESET_DELAY_MS, Date.now())
}

/** 实际执行自动 reset (setTimeout 回调) */
async function executeAutoReset(): Promise<void> {
    if (!autoResetPlan) return
    info('pool', '执行自动 reset (全 dead 状态恢复)')
    // 标记时间戳 + 清理持久化
    write('fqa.last_auto_reset.v1', Date.now())
    del(AUTO_RESET_PLAN_KEY)
    if (autoResetPlan.timerId) {
        clearTimeout(autoResetPlan.timerId)
    }
    autoResetPlan = null
    // 执行 reset (清空池子 + 重新注册)
    del(POOL_STORAGE_KEY)
    del('device')
    del('keyinfo')
    configStore.currentConfig = defaultConfig
    notify()
    try {
        await initPool()
        info('pool', '自动 reset 完成, 新池子已生效')
    } catch (e) {
        logError('pool', '自动 reset 后 initPool 失败', { error: String(e) })
    }
    // 通知恢复弹窗: reset 完成, 准备 reload 让 readerHook 重试
    for (const fn of autoResetExecuteListeners) {
        try { fn() } catch (e) { warn('pool', 'autoResetExecute listener 异常', { error: String(e) }) }
    }
}

/** 用户手动取消自动 reset (恢复弹窗"取消"按钮调用) */
export function cancelAutoReset(): boolean {
    if (!autoResetPlan) return false
    if (autoResetPlan.timerId) {
        clearTimeout(autoResetPlan.timerId)
    }
    autoResetPlan = null
    del(AUTO_RESET_PLAN_KEY)
    info('pool', '用户取消了自动 reset 计划')
    for (const fn of autoResetCancelListeners) {
        try { fn() } catch (e) { warn('pool', 'autoResetCancel listener 异常', { error: String(e) }) }
    }
    return true
}

/** 订阅自动 reset 取消事件 */
export function subscribeAutoResetCancel(fn: () => void): () => void {
    autoResetCancelListeners.add(fn)
    return () => {
        autoResetCancelListeners.delete(fn)
    }
}

/** 订阅自动 reset 执行完成事件 (恢复弹窗可据此 reload 页面) */
export function subscribeAutoResetExecute(fn: () => void): () => void {
    autoResetExecuteListeners.add(fn)
    return () => {
        autoResetExecuteListeners.delete(fn)
    }
}