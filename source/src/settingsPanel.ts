// 设置面板的挂载/卸载。
// 面板是全局单例，从用户菜单里唤起。

import { createApp, h, type App } from 'vue'
import SettingsView from './views/SettingsView.vue'
import settingscss from './assets/settings.css?raw'

const CONTAINER_ID = 'fqa-settings-root'
const STYLE_ID = 'fqa-settings-style'

let app: App | null = null
let container: HTMLElement | null = null

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = settingscss
    document.head.appendChild(style)
}

export function closeSettings(): void {
    app?.unmount()
    app = null
    container?.remove()
    container = null
}

export function openSettings(): void {
    if (app) return
    injectStyle()

    container = document.createElement('div')
    container.id = CONTAINER_ID
    document.body.appendChild(container)

    app = createApp({
        render: () => h(SettingsView, { onClose: closeSettings }),
    })
    app.config.errorHandler = (err, _instance, info) => {
        console.error(`[fqa:settings] Vue error (${info}):`, err)
    }
    app.mount(container)
}

export function toggleSettings(): void {
    if (app) closeSettings()
    else openSettings()
}
