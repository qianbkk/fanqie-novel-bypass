import { createApp, type App } from 'vue'
import type { HookConfig } from '../config'
import BookshelfView from '../views/BookshelfView.vue'
import bookshelfcss from '../assets/bookshelf.css?raw'
import { waitForElement } from '../utils'
import { userState } from '../api/user'

const CONTAINER_ID = 'fqa-bookshelf-root'
const STYLE_ID = 'fqa-bookshelf-style'
// 原站书架根节点，命中其一即视为页面已渲染
const ORIGIN_SELECTOR = '.muye-bookshelf, .muye-bookshelf-home-page, .bookshelf-tabs'

let app: App | null = null
let container: HTMLElement | null = null
let observer: MutationObserver | null = null

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = bookshelfcss
    document.head.appendChild(style)
}

// 防止白屏
function hideOrigin(root: ParentNode = document) {
    root.querySelectorAll<HTMLElement>(ORIGIN_SELECTOR).forEach(el => {
        if (el.id === CONTAINER_ID || el.closest(`#${CONTAINER_ID}`)) return
        el.classList.add('fqa-hide')
    })
}

function isBookshelfPath(path: string) {
    return path.startsWith('/bookshelf')
}

function unmount() {
    observer?.disconnect()
    observer = null
    app?.unmount()
    app = null
    container?.remove()
    container = null
    document.getElementById('fqa-bookshelf-hover')?.remove()
    // 还原原站书架，避免用户离开后又回到 /bookshelf 时白屏
    document.querySelectorAll<HTMLElement>(ORIGIN_SELECTOR).forEach(el => {
        el.classList.remove('fqa-hide')
    })
}

async function mainHook(_previous?: string): Promise<void> {
    if (!isBookshelfPath(window.location.pathname)) {
        unmount()
        return
    }
    if (app) {
        // 已挂载，重复触发（例如 tab 内的 replaceState）时无需重建
        hideOrigin()
        return
    }

    injectStyle()

    const origin = await waitForElement(ORIGIN_SELECTOR)
    // 等待期间可能已经离开书架页
    if (!isBookshelfPath(window.location.pathname)) return
    if (app) return

    hideOrigin()

    container = document.createElement('div')
    container.id = CONTAINER_ID
    const anchor = origin ?? document.querySelector('#root') ?? document.body
    if (origin?.parentElement) {
        origin.insertAdjacentElement('beforebegin', container)
    } else {
        anchor.appendChild(container)
    }

    app = createApp(BookshelfView)
    app.config.errorHandler = (err, _instance, info) => {
        console.error(`[fqa:bookshelf] Vue error (${info}):`, err)
    }
    app.mount(container)
    console.log('[fqa:bookshelf] 书架视图已挂载')

    document.title = '我的书架 - 番茄小说'

    observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof HTMLElement)) continue
                if (node.id === CONTAINER_ID || node.closest(`#${CONTAINER_ID}`)) continue
                if (node.matches?.(ORIGIN_SELECTOR)) {
                    node.classList.add('fqa-hide')
                } else {
                    hideOrigin(node)
                }
            }
        }
    })
    observer.observe(document.body, { childList: true, subtree: true })
}

function filter(path: string, _query: URLSearchParams, _hash: string) {
    return (isBookshelfPath(path) || !!app) && userState.isLogin
}

const _exports: HookConfig[] = [
    {
        id: 'bookshelfHook_onload',
        event: 'load',
        filter,
        handler: mainHook
    },
    {
        id: 'bookshelfHook_onurlchange',
        event: 'onUrlChange',
        filter,
        handler: mainHook
    }
]

export default _exports
