// 搜索接口。
//
// 走同源的 /reading/bookapi/*，签名照旧，Cookie 由浏览器附带。
//
// 响应结构（已抓包核对）：
//   { code, message, search_tabs: [...], selected_tab_idx, log_id }
// 注意 search_tabs 在顶层，没有 data 包裹。
//
// 每个 tab：
//   { tab_type, title, data: cell[], has_more, passback, next_offset, selector? }
//   - 只有 tab_type=1（综合）带 selector
//   - has_more / passback 都在 tab 上，不在顶层
//   - passback 按 cell 计数而非按书计数（首页返回 9 而不是 10），
//     所以翻页必须回填服务端给的 passback，不能自己 (page-1)*10
//
// cell 里只有 show_type=110 是真正的搜索结果（一 cell 一书）。
// 112/191/300/539 等是「猜你喜欢」「相关搜索」「社区」这类插入位，
// use_recommend 在结果 cell 上也是 true，不能用它来区分。

import { webGet } from './app'
import type {
    SearchBook,
    SearchLandingSection,
    SearchResult,
    SearchTab,
    SelectorRow,
} from '../types'
import { settings } from '../settings'

/** 综合 tab，唯一带筛选器的 tab */
export const BOOK_TAB_TYPE = 1

/** 真正的搜索结果 cell */
const RESULT_SHOW_TYPE = 110

/**
 * 能渲染成书籍卡片的 tab。实测各 tab 的返回：
 *   1 综合(110) / 3 书籍(110) / 2 听书(110) / 5 全文(110) / 8 漫画(334)  有 book_data
 *   4 社区(339) / 11 短剧(532,393,369) / 19 漫剧(369) / 6 用户(322)     没有 book_data
 *   13 买书                                                          直接返回空
 * 后面这些是帖子、短剧、用户卡，网页端渲染不了，列出来只会得到空结果页，所以过滤掉。
 */
const RENDERABLE_TABS = new Set([1, 2, 3, 5, 8])

/** 个人化推荐要带登录态，否则匿名请求 */
function credentials(): RequestCredentials {
    return settings.searchPersonalized ? 'include' : 'omit'
}

function num(v: unknown): number {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
}

/**
 * 接口的布尔值下发成字符串 "0"/"1"。
 * 直接 Boolean() 会把 "0" 判成 true，必须显式比较。
 */
function bool(v: unknown): boolean {
    if (typeof v === 'string') return v !== '' && v !== '0' && v !== 'false'
    return Boolean(v)
}

/** 只保留 <em>，其余标签一律去掉后再交给 v-html */
function sanitizeHighlight(html: unknown): string | undefined {
    if (typeof html !== 'string' || !html) return undefined
    return html.replace(/<(?!\/?em\s*\/?>)[^>]*>/gi, '')
}

function normalizeBook(raw: any, cell: any): SearchBook | null {
    const bookId = String(raw?.book_id ?? '')
    if (!bookId || bookId === '0') return null

    // 高亮挂在 cell 上而不是书上
    const hl = cell?.search_high_light
    return {
        book_id: bookId,
        title: raw.book_name || raw.original_book_name || '',
        author: raw.author || '',
        cover_url: raw.thumb_url || raw.audio_thumb_url_hd || '',
        summary: raw.abstract || '',
        status: String(raw.creation_status ?? ''),
        word_count: num(raw.word_number),
        // sub_info 是接口给的展示文案，如「404章」「10.5万人在读」
        sub_info: String(raw.sub_info ?? ''),
        read_count: num(raw.read_count),
        // 未评分的书下发 "0"，视为没有评分
        score: num(raw.score) > 0 ? String(raw.score) : '',
        category: raw.category || '',
        chapter_count: num(raw.serial_count),
        last_chapter_title: raw.last_chapter_title || '',
        last_publish_time: num(raw.last_publish_time) * 1000,
        highlight_title: sanitizeHighlight(hl?.title?.rich_text),
        genre: raw.genre != null ? String(raw.genre) : undefined,
        in_bookshelf: bool(raw.in_bookshelf),
    }
}

/** 从 cell 列表里挑出搜索结果 */
function collectBooks(cells: any[]): SearchBook[] {
    const books: SearchBook[] = []
    const seen = new Set<string>()

    const take = (cell: any) => {
        for (const raw of cell?.book_data ?? []) {
            const book = normalizeBook(raw, cell)
            if (!book || seen.has(book.book_id)) continue
            seen.add(book.book_id)
            books.push(book)
        }
    }

    const results = cells.filter(c => Number(c?.show_type) === RESULT_SHOW_TYPE)
    if (results.length) {
        results.forEach(take)
        return books
    }
    // 其他 tab（听书/漫画等）的结果 cell 编号不同，
    // 没命中 110 时退化成「带 book_data 的都要」
    cells.filter(c => Array.isArray(c?.book_data) && c.book_data.length).forEach(take)
    return books
}

function collectTabs(tabs: any[]): SearchTab[] {
    return tabs
        .map((t: any) => ({
            tab_type: num(t?.tab_type),
            // 字段名是 title，不是 tab_name
            tab_name: String(t?.title ?? ''),
            has_selector: Array.isArray(t?.selector?.rows) && t.selector.rows.length > 0,
        }))
        .filter(t => t.tab_type > 0 && t.tab_name && RENDERABLE_TABS.has(t.tab_type))
}

function collectSelectorRows(tabs: any[]): SelectorRow[] {
    const rows = tabs.find((t: any) => Array.isArray(t?.selector?.rows))?.selector?.rows
    if (!Array.isArray(rows)) return []

    return rows
        .map((row: any) => ({
            name: String(row?.row_name ?? ''),
            items: (Array.isArray(row?.items) ? row.items : [])
                .map((item: any) => ({
                    id: String(item?.selector_item_id ?? ''),
                    name: String(item?.show_name ?? ''),
                    default: Boolean(item?.is_default_selected),
                }))
                .filter((item: any) => item.id && item.name),
        }))
        .filter((row: SelectorRow) => row.name && row.items.length > 0)
}

export interface SearchParams {
    query: string
    /** 服务端给的翻页游标，首页传 0 */
    passback?: number
    /** 选中的 selector_item_id 列表 */
    selectedItems?: string[]
    tabType?: number
}

export async function search({
    query,
    passback = 0,
    selectedItems = [],
    tabType = BOOK_TAB_TYPE,
}: SearchParams): Promise<SearchResult> {
    // 筛选只在综合 tab 生效
    const selected = tabType === BOOK_TAB_TYPE ? selectedItems.filter(Boolean).join(',') : ''

    const j = await webGet(
        '/bookapi/search/tab/v',
        {
            query,
            passback: String(passback),
            selected_items: selected,
            tab_type: String(tabType),
        },
        credentials(),
    )

    if (j?.code !== undefined && j.code !== 0) {
        throw new Error(j.message || `搜索失败(code=${j.code})`)
    }

    const tabs: any[] = Array.isArray(j?.search_tabs) ? j.search_tabs : []
    const current = tabs.find((t: any) => num(t?.tab_type) === tabType)
    const cells: any[] = Array.isArray(current?.data) ? current.data : []
    const books = collectBooks(cells)

    return {
        books,
        // 回填服务端游标；没给就按已取回的书数往前推，至少不会原地打转
        next_passback: num(current?.passback) || passback + Math.max(books.length, 1),
        has_more: Boolean(current?.has_more) && books.length > 0,
        tabs: collectTabs(tabs),
        selector_rows: collectSelectorRows(tabs),
    }
}

/* ------------------------------- 搜索中间页 ------------------------------- */
//
// /bookapi/plan/v 的结构：
//   data: cell[]
//     show_type=364 → search_tag_data，猜你想搜
//     show_type=161 → cell_data[] 各种榜单，其中
//         472 番茄热搜榜  search_tag_data（带 tag_attached 热搜值）
//         162 巅峰榜 / 332 漫画榜  book_data
//         388/164/163 是短剧/话题/分类，走 lynx 或视频，网页端渲染不了

function collectWords(list: any): SearchLandingSection['words'] {
    if (!Array.isArray(list)) return []
    return list
        .map((t: any) => ({
            word: String(t?.tag_title ?? ''),
            // 「877405热搜值」之类的附加说明
            tag: t?.tag_attached ? String(t.tag_attached) : undefined,
            label: t?.label ? String(t.label) : undefined,
        }))
        .filter(w => w.word)
}

function collectSugBooks(list: any): SearchLandingSection['books'] {
    if (!Array.isArray(list)) return []
    return list
        .map((b: any) => ({
            book_id: String(b?.book_id ?? ''),
            title: String(b?.book_name ?? ''),
            cover_url: String(b?.thumb_url ?? ''),
            author: b?.author ? String(b.author) : undefined,
            desc: b?.sub_info ? String(b.sub_info) : undefined,
        }))
        .filter(b => b.book_id && b.title)
}

function pushSection(
    out: SearchLandingSection[],
    title: string,
    words: SearchLandingSection['words'],
    books: SearchLandingSection['books'],
) {
    if (!words.length && !books.length) return
    out.push({
        title: title || (words.length ? '热搜' : '推荐'),
        kind: words.length ? 'hotword' : 'book',
        words,
        books,
    })
}

export async function getSearchLanding(): Promise<SearchLandingSection[]> {
    const j = await webGet(
        '/bookapi/plan/v',
        {
            search_source: '1',
            scene: '10',
            new_search_middle_page: 'true',
            search_middle_page_version: '2',
            from: 'search_input_page',
            tab_name: 'store',
            bookstore_tab: '2',
            bookstore_tab_type: '2',
            hot_word_exchange: 'false',
            query_history_removed: 'false',
            user_is_login: settings.searchPersonalized ? '1' : '0',
        },
        credentials(),
    )

    if (j?.code !== undefined && j.code !== 0) {
        throw new Error(j.message || `加载推荐失败(code=${j.code})`)
    }

    const sections: SearchLandingSection[] = []
    for (const cell of Array.isArray(j?.data) ? j.data : []) {
        // 榜单容器，真正内容在 cell_data 里
        if (Array.isArray(cell?.cell_data)) {
            for (const sub of cell.cell_data) {
                pushSection(
                    sections,
                    String(sub?.cell_name ?? ''),
                    collectWords(sub?.search_tag_data),
                    collectSugBooks(sub?.book_data),
                )
            }
            continue
        }
        pushSection(
            sections,
            String(cell?.cell_name ?? '') || '猜你想搜',
            collectWords(cell?.search_tag_data),
            collectSugBooks(cell?.book_data),
        )
    }
    return sections
}
