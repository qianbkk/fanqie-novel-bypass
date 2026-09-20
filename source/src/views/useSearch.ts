import { computed, ref } from 'vue'
import { BOOK_TAB_TYPE, search } from '../api/search'
import type { SearchBook, SearchTab, SelectorRow } from '../types'

/** 兜底 tab，接口没返回 search_tabs 时至少能搜书 */
const FALLBACK_TABS: SearchTab[] = [{ tab_type: BOOK_TAB_TYPE, tab_name: '综合', has_selector: true }]

export function useSearch() {
    const query = ref('')
    const tabType = ref<number>(BOOK_TAB_TYPE)
    const tabs = ref<SearchTab[]>([])
    const selectorRows = ref<SelectorRow[]>([])
    /** 行名 -> 选中的 selector_item_id。每行单选 */
    const selected = ref<Record<string, string>>({})

    const books = ref<SearchBook[]>([])
    /** 服务端翻页游标。按 cell 计数，必须回填它给的值 */
    const passback = ref(0)
    const hasMore = ref(false)

    /** 首次加载（换词/换 tab/换筛选）*/
    const loading = ref(false)
    /** 追加下一页 */
    const loadingMore = ref(false)
    const error = ref<string | null>(null)
    /** 已经搜过至少一次，用于区分「空结果」和「还没搜」*/
    const searched = ref(false)

    /** 并发请求时丢弃过期响应 */
    let token = 0

    const selectedItems = computed(() =>
        Object.values(selected.value).filter(Boolean)
    )

    const availableTabs = computed(() => (tabs.value.length ? tabs.value : FALLBACK_TABS))

    /** 只有书籍 tab 支持筛选 */
    const canFilter = computed(() => tabType.value === BOOK_TAB_TYPE && selectorRows.value.length > 0)

    const filterCount = computed(() => selectedItems.value.length)

    async function run(reset: boolean): Promise<void> {
        const q = query.value.trim()
        if (!q) return

        const current = ++token
        if (reset) {
            passback.value = 0
            loading.value = true
            error.value = null
        } else {
            if (loadingMore.value || !hasMore.value) return
            loadingMore.value = true
        }

        try {
            const result = await search({
                query: q,
                passback: passback.value,
                selectedItems: selectedItems.value,
                tabType: tabType.value,
            })
            if (current !== token) return

            // 同一本书可能在相邻页重复出现，按 book_id 去重
            if (reset) {
                books.value = result.books
            } else {
                const seen = new Set(books.value.map(b => b.book_id))
                books.value = [...books.value, ...result.books.filter(b => !seen.has(b.book_id))]
            }
            passback.value = result.next_passback
            hasMore.value = result.has_more
            // tab 列表每次都会回传，第一次拿到后就固定下来
            if (result.tabs.length) tabs.value = result.tabs
            if (result.selector_rows.length) selectorRows.value = result.selector_rows
            searched.value = true
        } catch (err) {
            if (current !== token) return
            console.error('[fqa:search] 搜索失败:', err)
            // 追加失败不清空已有结果，只提示
            error.value = err instanceof Error ? err.message : String(err)
            if (reset) books.value = []
            searched.value = true
        } finally {
            if (current === token) {
                loading.value = false
                loadingMore.value = false
            }
        }
    }

    /** 换词或换条件，从第一页重搜 */
    async function submit(q?: string): Promise<void> {
        if (q !== undefined) query.value = q
        await run(true)
    }

    /**
     * 回到「还没搜过」的状态，用于返回落地页。
     * 光清 query 不够：结果、游标、筛选都得一起清掉，
     * 否则下次搜索会带上上一次的筛选条件和翻页位置。
     */
    function reset(): void {
        // 递增 token，丢弃仍在途的响应，避免它回来又把结果写回去
        token++
        query.value = ''
        books.value = []
        passback.value = 0
        hasMore.value = false
        searched.value = false
        error.value = null
        loading.value = false
        loadingMore.value = false
        selected.value = {}
        tabType.value = BOOK_TAB_TYPE
    }

    async function loadMore(): Promise<void> {
        if (!hasMore.value || loading.value || loadingMore.value) return
        await run(false)
    }

    function selectTab(next: number): void {
        if (tabType.value === next) return
        tabType.value = next
        // 筛选是书籍 tab 专属，切走时清掉避免误带
        if (next !== BOOK_TAB_TYPE) selected.value = {}
        void run(true)
    }

    function toggleFilter(rowName: string, itemId: string): void {
        const cur = selected.value[rowName]
        // 点已选中的项等于取消
        if (cur === itemId) {
            const next = { ...selected.value }
            delete next[rowName]
            selected.value = next
        } else {
            selected.value = { ...selected.value, [rowName]: itemId }
        }
        void run(true)
    }

    function clearFilters(): void {
        if (!filterCount.value) return
        selected.value = {}
        void run(true)
    }

    const isEmpty = computed(
        () => searched.value && !loading.value && !error.value && books.value.length === 0
    )

    return {
        query,
        tabType,
        availableTabs,
        selectorRows,
        selected,
        canFilter,
        filterCount,
        books,
        hasMore,
        loading,
        loadingMore,
        error,
        searched,
        isEmpty,
        submit,
        reset,
        loadMore,
        selectTab,
        toggleFilter,
        clearFilters,
    }
}
