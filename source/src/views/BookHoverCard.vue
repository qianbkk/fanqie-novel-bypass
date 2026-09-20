<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BookShelfEntry } from '../types'
import { fromNow, formatDateTime } from '../utils/time'

const props = defineProps<{
    entry: BookShelfEntry | null
    /** 视口坐标，由父组件按封面位置算好 */
    x: number
    y: number
    /** 与封面等高；0 表示尚未测量，退回自适应高度 */
    height: number
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'panel-enter'): void
    (e: 'panel-leave'): void
}>()

const detail = computed(() => props.entry?.detail ?? null)
const item = computed(() => props.entry?.item ?? null)

const readAt = computed(() => fromNow(item.value?.last_read_timestamp))
const addedAt = computed(() => fromNow(item.value?.add_shelf_time))
const updatedAt = computed(() => fromNow(detail.value?.last_chapter_update_time))
const updatedAtFull = computed(() => formatDateTime(detail.value?.last_chapter_update_time))

/** 悬停“最新章”时改显更新时间 */
const showUpdateTime = ref(false)

const latestChapter = computed(() => {
    const d = detail.value
    if (!d) return '—'
    return d.total_chapter_count ? `${d.total_chapter_count}章` : '—'
})

/* ------------------------------ 梗概 / 简介 ------------------------------ */

type AbstractTab = 'chapter' | 'book'

/** null 表示未手动切换过，跟随默认规则 */
const pickedTab = ref<AbstractTab | null>(null)

const chapterText = computed(() => detail.value?.current_chapter_summary?.trim() ?? '')
const bookText = computed(() => detail.value?.summary?.trim() ?? '')

/** 默认梗概；没有梗概时落到简介 */
const activeTab = computed<AbstractTab>(() => {
    if (pickedTab.value) return pickedTab.value
    return chapterText.value ? 'chapter' : 'book'
})

/** 用户主动切到空的一栏时，如实显示暂无数据 */
const abstractText = computed(() => {
    const text = activeTab.value === 'chapter' ? chapterText.value : bookText.value
    return text || '暂无数据'
})

// 换书时重置为默认栏，避免上一本的选择粘住
watch(
    () => props.entry?.item.book_id,
    () => {
        pickedTab.value = null
        showUpdateTime.value = false
    }
)

const root = ref<HTMLElement | null>(null)
const supportsPopover =
    typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function'

/**
 * 进入/退出浏览器顶层。顶层元素永远绘制在普通内容之上，
 * 相邻卡片和原站的层叠上下文都盖不住它。
 */
watch(
    () => props.visible && !!detail.value,
    show => {
        const el = root.value
        if (!el || !supportsPopover) return
        try {
            if (show) el.showPopover()
            else el.hidePopover()
        } catch {
            // 反复切换时可能重复调用，忽略即可
        }
    }
)
</script>

<template>
    <div
        id="fqa-bookshelf-hover"
        ref="root"
        popover="manual"
        :class="{ 'fqa-visible': visible && !!detail }"
        :style="{ left: x + 'px', top: y + 'px' }"
        @mouseenter="emit('panel-enter')"
        @mouseleave="emit('panel-leave')"
    >
        <div
            v-if="detail"
            class="fqa-hover-inner"
            :style="height ? { height: height + 'px' } : undefined"
        >
            <div class="fqa-hover-title" :title="detail.title">{{ detail.title }}</div>
            <div v-if="detail.author" class="fqa-hover-author">{{ detail.author }}</div>

            <div class="fqa-hover-stats">
                <div
                    class="fqa-hover-stat"
                    @mouseenter="showUpdateTime = true"
                    @mouseleave="showUpdateTime = false"
                >
                    <div class="fqa-hover-stat-v" :title="updatedAtFull">
                        {{ showUpdateTime ? updatedAt : latestChapter }}
                    </div>
                    <div class="fqa-hover-stat-k">{{ showUpdateTime ? '更新于' : '最新章' }}</div>
                </div>
                <div class="fqa-hover-stat">
                    <div class="fqa-hover-stat-v">{{ readAt }}</div>
                    <div class="fqa-hover-stat-k">阅读过</div>
                </div>
                <div class="fqa-hover-stat">
                    <div class="fqa-hover-stat-v">{{ addedAt }}</div>
                    <div class="fqa-hover-stat-k">已加入书架</div>
                </div>
            </div>

            <div class="fqa-hover-seg">
                <button
                    class="fqa-hover-seg-btn"
                    :class="{ 'fqa-hover-seg-active': activeTab === 'chapter' }"
                    @click="pickedTab = 'chapter'"
                >
                    本章梗概
                </button>
                <button
                    class="fqa-hover-seg-btn"
                    :class="{ 'fqa-hover-seg-active': activeTab === 'book' }"
                    @click="pickedTab = 'book'"
                >
                    全书简介
                </button>
            </div>

            <div class="fqa-hover-abstract">
                <span
                    v-if="activeTab === 'chapter' && detail.current_chapter_title"
                    class="fqa-hover-chapter"
                >
                    {{ detail.current_chapter_title }}
                </span>
                {{ abstractText }}
            </div>
        </div>
    </div>
</template>
