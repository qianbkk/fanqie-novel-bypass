import { createApp, watch, type App } from 'vue'
import type { HookConfig } from '../config'
import SearchView from '../views/SearchView.vue'
import searchcss from '../assets/search.css?raw'
import { waitForElement } from '../utils'
import { settings } from '../settings'
import { routeQuery, syncFromUrl } from '../views/searchRoute'

const CONTAINER_ID = 'fqa-search-root'
const STYLE_ID = 'fqa-search-style'

/** 原站搜索结果页根节点 */
const RESULT_SELECTOR = '.muye-search'
/** 原站 404 页根节点，/search 会命中 */
const NOTFOUND_SELECTOR = '.muye-undefined'
const ORIGIN_SELECTOR = `${RESULT_SELECTOR}, ${NOTFOUND_SELECTOR}`

let app: App | null = null
let container: HTMLElement | null = null
let observer: MutationObserver | null = null
/** 标题跟随搜索词，挂载后一直监听 */
let stopTitleWatch: (() => void) | null = null

function injectStyle() {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = searchcss
    document.head.appendChild(style)
}

function isSearchPath(path: string): boolean {
    return path === '/search' || path === '/search/' || path.startsWith('/search/')
}

function hideOrigin(root: ParentNode = document) {
    root.querySelectorAll<HTMLElement>(ORIGIN_SELECTOR).forEach(el => {
        if (el.id === CONTAINER_ID || el.closest(`#${CONTAINER_ID}`)) return
        el.classList.add('fqa-hide')
    })
}

function unmount() {
    observer?.disconnect()
    observer = null
    stopTitleWatch?.()
    stopTitleWatch = null
    app?.unmount()
    app = null
    container?.remove()
    container = null
    // 还原原站节点，避免返回时白屏
    document.querySelectorAll<HTMLElement>(ORIGIN_SELECTOR).forEach(el => {
        el.classList.remove('fqa-hide')
    })
}

async function mainHook(_previous?: string): Promise<void> {
    const path = window.location.pathname
    if (!isSearchPath(path) || !settings.enhanceSearch) {
        unmount()
        return
    }

    // URL 是搜索词的来源；视图 watch 这个 ref，不需要重挂
    syncFromUrl(path)

    if (app) {
        hideOrigin()
        return
    }

    injectStyle()

    // 落地页命中的是 404 根节点，结果页是 .muye-search
    const origin = await waitForElement(ORIGIN_SELECTOR, 8000)
    if (!isSearchPath(window.location.pathname)) return
    if (app) return

    hideOrigin()
    mount(origin)

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

function mount(origin: HTMLElement | null) {
    container = document.createElement('div')
    container.id = CONTAINER_ID

    if (origin?.parentElement) {
        origin.insertAdjacentElement('beforebegin', container)
    } else {
        const anchor = document.querySelector('#root') ?? document.body
        anchor.appendChild(container)
    }

    app = createApp(SearchView)
    app.config.errorHandler = (err, _instance, info) => {
        console.error(`[fqa:search] Vue error (${info}):`, err)
    }
    app.mount(container)

    stopTitleWatch = watch(
        routeQuery,
        q => {
            document.title = q ? `${q} - 搜索 - 番茄小说` : '搜索 - 番茄小说'
        },
        { immediate: true }
    )
    console.log('[fqa:search] 搜索视图已挂载:', routeQuery.value || '(落地页)')
}

function filter(path: string, _query: URLSearchParams, _hash: string): boolean {
    // 已挂载时也要放行，否则离开搜索页时没机会卸载
    return isSearchPath(path) || !!app
}

async function overloadTitle(_previous?: string): Promise<void> {
    const searchKey = routeQuery.value || '搜索'
    document.title = `${searchKey} - 番茄小说`
}

const _exports: HookConfig[] = [
    {
        id: 'searchHook_onload',
        event: 'load',
        filter,
        handler: mainHook,
    },
    {
        id: 'searchHook_onurlchange',
        event: 'onUrlChange',
        filter,
        handler: mainHook,
    },
    {
        id: 'searchHook_e',
        event: 'enter',
        filter,
        handler: overloadTitle,
    }
]

export default _exports
