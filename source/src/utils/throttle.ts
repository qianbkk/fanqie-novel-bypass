// 请求节流：5-25s 随机间隔 + L4 行为模拟（偶发长停顿）。
//
// 设计动机：
//   - L1 防线：单纯高频请求是最容易被服务端识别的特征，必须打散。
//   - L4 防线：真人阅读会有"上厕所 / 走神"的长停顿，纯匀速请求模式
//     比"5-25s 抖动"更像机器人。3% 概率插入 30-90s 长停顿模拟这种行为。
//
// 行为契约：
//   - waitForThrottle() 在请求前 await，确保请求间隔符合配置
//   - getCountdown() 控制面板实时显示距离下次请求的等待秒数
//   - 配置通过 setThrottleConfig() 动态调整（控制面板可调）
//
// 不替代"用户主动翻页"的 UI 反馈，章节加载状态仍由 readerHook 处理。

import { debug, info } from './logger'

export interface ThrottleConfig {
    enabled: boolean
    /** 最小间隔（毫秒） */
    minMs: number
    /** 最大间隔（毫秒） */
    maxMs: number
    /** L4 行为模拟：长停顿概率 0-1 */
    longPauseChance: number
    /** L4 长停顿区间（毫秒） */
    longPauseMinMs: number
    longPauseMaxMs: number
}

const DEFAULT_CONFIG: ThrottleConfig = {
    enabled: true,
    minMs: 5000,
    maxMs: 25000,
    longPauseChance: 0.03,
    longPauseMinMs: 30000,
    longPauseMaxMs: 90000,
}

let config: ThrottleConfig = { ...DEFAULT_CONFIG }
/** 上一次节流"放行时刻"。0 表示还没开始计。 */
let lastReleaseTime = 0

/** 均匀随机整数 [min, max] */
function uniformInRange(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min))
}

/**
 * Box-Muller 正态分布：均值 mean，标准差 stddev。
 * 返回值钳制在 [min, max]，避免极端值。
 *
 * 真人阅读节奏不是均匀的——大部分时候停留时间落在均值附近，
 * 偶尔偏长偶尔偏短。正态分布比 [min, max] 均匀分布更像人。
 */
function normalDelay(mean: number, stddev: number, min: number, max: number): number {
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const v = mean + z * stddev
    return Math.max(min, Math.min(max, Math.floor(v)))
}

/**
 * 计算下一次应该等待的间隔。
 *
 * 包含 L4 行为模拟：
 *   - 正常情况：正态分布，中心 12s（5-25s 区间的中段偏短，因为真人翻页常快）
 *   - 长停顿：按 longPauseChance 概率走 [30s, 90s] 区间
 */
function computeDelay(): number {
    if (Math.random() < config.longPauseChance) {
        const long = uniformInRange(config.longPauseMinMs, config.longPauseMaxMs)
        debug('throttle', `L4 长停顿触发`, { ms: long })
        return long
    }
    // 均值偏短：median 翻页真人不会等到上限才点
    const mean = (config.minMs + config.maxMs) * 0.45
    const stddev = (config.maxMs - config.minMs) * 0.25
    return normalDelay(mean, stddev, config.minMs, config.maxMs)
}

/**
 * 在调用方发起请求前调用：等到节流时间到才返回。
 *
 * 第一次调用立即放行（lastReleaseTime === 0）。
 * 之后每次保证距离上次放行至少 minMs（实际上因为 random，会在 [min, max] 之间）。
 */
export async function waitForThrottle(): Promise<void> {
    if (!config.enabled) return
    const now = Date.now()
    if (lastReleaseTime === 0) {
        lastReleaseTime = now
        debug('throttle', '节流器首次放行')
        return
    }
    const desiredDelay = computeDelay()
    const elapsed = now - lastReleaseTime
    const wait = desiredDelay - elapsed
    if (wait <= 0) {
        lastReleaseTime = now
        return
    }
    debug('throttle', `节流等待 ${Math.ceil(wait / 1000)}s`, {
        elapsedMs: elapsed,
        targetMs: desiredDelay,
    })
    await new Promise<void>((resolve) => setTimeout(resolve, wait))
    lastReleaseTime = Date.now()
}

/**
 * 当前距离下次请求可放行还有多少秒（向上取整）。
 * 控制面板的状态指示器用这个值。
 *
 * 返回 0 表示当前可立即请求；返回 >0 表示还需要等待。
 */
export function getCountdownSeconds(): number {
    if (!config.enabled) return 0
    if (lastReleaseTime === 0) return 0
    const elapsed = Date.now() - lastReleaseTime
    // 用 minMs 估算"最早"放行时间——UI 让用户看到"最快"还要多久。
    // 实际可能更长（正态分布可能落更慢的一端），但给用户希望感。
    const earliestWait = config.minMs - elapsed
    return earliestWait > 0 ? Math.ceil(earliestWait / 1000) : 0
}

/** 重置节流状态。控制面板"重置"按钮或设置变更时调用 */
export function resetThrottle(): void {
    lastReleaseTime = 0
    info('throttle', '节流器已重置')
}

export function getThrottleConfig(): ThrottleConfig {
    return { ...config }
}

export function setThrottleConfig(patch: Partial<ThrottleConfig>): void {
    config = { ...config, ...patch }
    info('throttle', '配置已更新', { ...config })
}