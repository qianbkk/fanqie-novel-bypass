// 番茄小说助手 lite (fork from fanqie-assistant v0.0.6)
//
// L1-L6 反封禁防线：
//   L1 节流     utils/throttle  (5-25s 随机 + L4 长停顿)
//   L2 缓存     cache/         (session + Pin)
//   L3 签名/UA  沿用上游
//   L4 行为模拟 utils/throttle  (正态分布 + 偶尔长停顿)
//   L5 注册流程 沿用上游
//   L6 失败不自残 pool/         (3 槽 + 手动补 + 不自杀)
//
// 用户可见的功能：
//   - 浮动 ⚙️ 按钮（控制面板）
//   - 阅读器顶栏 📌 按钮（Pin 当前书）
//   - 失败时弹恢复提示（5 选项 + 诊断可展开）

import _config from './config'
import injectCSS from './cssInject'
import initFontDecrypt from './fontDecrypt'
import initUserStyle from './userStyle'
import { onLoad, onUrlChange, onHashChange, onEnter } from './hooks'
import { version, name } from '../package.json'

import { initLogger, info } from './utils/logger'
import { initCache } from './cache'
import { initPool } from './pool'
import { mountPanel, ensurePanelButton } from './panel'
import { mountRecoveryUI } from './panel/recovery'

const win = unsafeWindow

let previousUrl = win.location.href
let previousHash = win.location.hash

function installNavigationHooks() {
    for (const method of ['pushState', 'replaceState'] as const) {
        const original = win.history[method]
        win.history[method] = function (
            this: History,
            ...args: Parameters<History[typeof method]>
        ) {
            const result = original.apply(this, args)
            void onUrlChange(previousUrl)
            previousUrl = win.location.href
            return result
        }
    }
    win.addEventListener('popstate', () => {
        void onUrlChange(previousUrl)
        previousUrl = win.location.href
    })
    win.addEventListener('hashchange', () => {
        void onHashChange(previousHash)
        previousHash = win.location.hash
    })
}

async function mainInit() {
    // 1. logger 必须最先（其他模块都依赖它）
    initLogger()

    // 2. config 必须最先以确保一些全局函数没有被劫持
    if (_config.currentConfig) {} // force load

    console.log(`================================================`)
    console.log(`==  ${name} - ${version}                       ==`)
    console.log(`==  L1-L6 反封禁 + 设备池 + Pin              ==`)
    console.log(`================================================`)
    info('main', `${name} ${version} 启动`)

    // 3. 导航钩子
    installNavigationHooks()

    // 4. 触发 enter 钩子（readerHook 会接管页面）—— document-start 就跑
    void onEnter()

    // 5. 早期 UI 模块（不依赖 body）
    initFontDecrypt()
    void injectCSS()
    initUserStyle()
    mountRecoveryUI()

    // 6. 等待 body 可用（document-start 时 body 还不存在，不能直接挂 ⚙️）
    await whenBodyReady()

    // 7. 挂 ⚙️（此时 body 已就绪）
    mountPanel()

    // 8. 异步初始化：缓存 + 设备池（并行）
    await Promise.allSettled([
        initCache().catch((e) => console.error('[fqa:main] initCache failed:', e)),
        initPool().catch((e) => console.error('[fqa:main] initPool failed:', e)),
    ])

    // 9. load 钩子（页面已有内容时触发）+ 自愈检查
    void onLoad()
    ensurePanelButton()

    info('main', '主流程初始化完成')
}

function whenBodyReady(): Promise<void> {
    return new Promise((resolve) => {
        if (document.body) {
            resolve()
            return
        }
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
    })
}

mainInit()