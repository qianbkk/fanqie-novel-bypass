import { watch } from 'vue'
import { settings } from './settings'

const STYLE_ID = 'fqa-user-style'

/** 阅读器正文容器（含脚本接管的克隆容器） */
const READER_SCOPE = '#fqa-reader-content, .muye-reader-content'

function buildCss(): string {
    const parts: string[] = []

    const font = settings.readerFont.trim()
    if (font) {
        // 字体名可能含空格，统一加引号；末尾保留 inherit 兜底
        const family = /^["']|,/.test(font) ? font : `"${font}"`
        parts.push(`${READER_SCOPE}, ${READER_SCOPE} p { font-family: ${family}, inherit !important; }`)
    }

    if (settings.customCssEnabled && settings.customCss.trim()) {
        parts.push(settings.customCss)
    }

    return parts.join('\n')
}

function apply(): void {
    const css = buildCss()
    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null

    if (!css) {
        el?.remove()
        return
    }
    if (!el) {
        el = document.createElement('style')
        el.id = STYLE_ID
        document.head.appendChild(el)
    }
    el.textContent = css
}

/** 启动时应用一次，并监听后续改动 */
export default function initUserStyle(): void {
    apply()
    watch(
        () => [settings.readerFont, settings.customCssEnabled, settings.customCss],
        apply
    )
}
