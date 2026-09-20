import { computed, ref } from 'vue'
import { getBookshelf, multidetail } from '../api/bookshelf'
import type {
    BookShelfBookInfo,
    BookShelfCell,
    BookShelfEntry,
    BookShelfGroup,
    BookShelfItem,
    BookShelfTabKey
} from '../types'
import { chunk } from '../utils'

/** multidetail 一次请求的书籍数，避免书架过大时单请求超时 */
const DETAIL_BATCH_SIZE = 20

/** 首屏先渲染的卡片数，其余滚动到底部时再追加 */
const PAGE_SIZE = 24

export interface TabDef {
    key: BookShelfTabKey
    label: string
}

export const TABS: TabDef[] = [
    { key: 'all', label: '全部' },
    { key: 'group', label: '分组' },
    { key: 'publish', label: '出版' }
]

export function useBookshelf() {
    const entries = ref<BookShelfEntry[]>([])
    const loading = ref(false)
    const detailLoading = ref(false)
    const error = ref<string | null>(null)

    /** 并发/重复加载时用于丢弃过期响应 */
    let loadToken = 0
    /** 已拿到的详情，跨 tab 切换复用，避免重复请求 */
    let detailCache = new Map<string, BookShelfBookInfo>()
    /** 正在请求中的 book_id，防止同一本书被并发拉两次 */
    let inflight = new Set<string>()

    function applyDetails(details: BookShelfBookInfo[]) {
        if (!details.length) return
        const byId = new Map(details.map(d => [d.book_id, d]))
        entries.value = entries.value.map(entry => {
            const detail = byId.get(entry.item.book_id)
            return detail ? { ...entry, detail } : entry
        })
    }

    /**
     * 按需拉取详情：只请求传入的、尚未加载且不在飞行中的书。
     * 由可见卡片驱动，滚动到哪拉到哪。
     */
    async function ensureDetails(items: BookShelfItem[]) {
        const token = loadToken
        const pending = items.filter(
            item => !detailCache.has(item.book_id) && !inflight.has(item.book_id)
        )
        if (!pending.length) return

        pending.forEach(item => inflight.add(item.book_id))
        detailLoading.value = true
        try {
            for (const batch of chunk(pending, DETAIL_BATCH_SIZE)) {
                if (token !== loadToken) return
                try {
                    const details = await multidetail(batch)
                    if (token !== loadToken) return
                    details.forEach(d => detailCache.set(d.book_id, d))
                    applyDetails(details)
                } catch (err) {
                    // 单批失败不影响其余批次，对应的卡片保持骨架态
                    console.error('[fqa:bookshelf] 加载书籍详情失败:', err)
                }
            }
        } finally {
            pending.forEach(item => inflight.delete(item.book_id))
            if (token === loadToken && inflight.size === 0) detailLoading.value = false
        }
    }

    async function load(force = false) {
        const token = ++loadToken
        inflight.clear()
        if (force) detailCache = new Map()
        loading.value = true
        error.value = null
        try {
            const items = await getBookshelf()
            if (token !== loadToken) return
            items.sort((a, b) => b.last_operate_time - a.last_operate_time)
            // 命中缓存的直接带上详情，其余留空由可见性驱动拉取
            entries.value = items.map(item => ({
                item,
                detail: detailCache.get(item.book_id) ?? null
            }))
            loading.value = false
        } catch (err) {
            if (token !== loadToken) return
            console.error('[fqa:bookshelf] 加载书架失败:', err)
            error.value = err instanceof Error ? err.message : String(err)
            loading.value = false
        }
    }

    const groups = computed<BookShelfGroup[]>(() => {
        const map = new Map<string, BookShelfGroup>()
        for (const entry of entries.value) {
            const name = entry.item.group_name
            if (!name) continue
            let group = map.get(name)
            if (!group) {
                group = { name, books: [], last_operate_time: 0 }
                map.set(name, group)
            }
            group.books.push(entry)
            group.last_operate_time = Math.max(group.last_operate_time, entry.item.last_operate_time)
        }
        return [...map.values()].sort((a, b) => b.last_operate_time - a.last_operate_time)
    })

    /** 全部 tab：散书与分组卡片按最近操作时间混排 */
    const allCells = computed<BookShelfCell[]>(() => {
        const sortable: Array<{ time: number; cell: BookShelfCell }> = []
        for (const entry of entries.value) {
            if (entry.item.group_name) continue
            sortable.push({
                time: entry.item.last_operate_time,
                cell: { kind: 'book', key: `book:${entry.item.book_id}`, entry }
            })
        }
        for (const group of groups.value) {
            sortable.push({
                time: group.last_operate_time,
                cell: { kind: 'group', key: `group:${group.name}`, group }
            })
        }
        return sortable.sort((a, b) => b.time - a.time).map(s => s.cell)
    })

    const groupCells = computed<BookShelfCell[]>(() =>
        groups.value.map(group => ({ kind: 'group', key: `group:${group.name}`, group }))
    )

    const publishCells = computed<BookShelfCell[]>(() =>
        entries.value
            .filter(entry => entry.item.is_publish)
            .map(entry => ({ kind: 'book', key: `book:${entry.item.book_id}`, entry }))
    )

    const counts = computed<Record<BookShelfTabKey, number>>(() => ({
        all: entries.value.length,
        group: groups.value.length,
        publish: entries.value.filter(entry => entry.item.is_publish).length
    }))

    function cellsOf(tab: BookShelfTabKey): BookShelfCell[] {
        if (tab === 'group') return groupCells.value
        if (tab === 'publish') return publishCells.value
        return allCells.value
    }

    function findGroup(name: string): BookShelfGroup | null {
        return groups.value.find(group => group.name === name) ?? null
    }

    return {
        entries,
        loading,
        detailLoading,
        error,
        groups,
        counts,
        load,
        ensureDetails,
        cellsOf,
        findGroup,
        PAGE_SIZE
    }
}
