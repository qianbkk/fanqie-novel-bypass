<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SearchBook } from '../types'
import { mappingCreationStatus } from '../api/book'
import { fromNow } from '../utils/time'

const props = defineProps<{ book: SearchBook }>()

const emit = defineEmits<{
    (e: 'open', book: SearchBook): void
    (e: 'contextmenu', payload: { book: SearchBook; x: number; y: number }): void
}>()

/** 高亮片段已在 api 层清洗过，只剩 <em> */
const titleHtml = computed(() => props.book.highlight_title ?? null)

const statusText = computed(() => mappingCreationStatus(props.book.status))

const wordText = computed(() => {
    const n = props.book.word_count
    // 有声书之类没有字数，接口给 0
    if (!n) return ''
    if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}万字`
    return `${n}字`
})

const metaParts = computed(() =>
    [statusText.value, wordText.value, props.book.category].filter(Boolean)
)

/** sub_info 是接口现成的展示文案，没有再退回自己格式化在读人数 */
const readText = computed(() => {
    if (props.book.sub_info) return props.book.sub_info
    const n = props.book.read_count
    if (!n) return ''
    return n >= 10_000 ? `${(n / 10_000).toFixed(1).replace(/\.0$/, '')}万人在读` : `${n}人在读`
})

const updateText = computed(() => {
    const t = props.book.last_publish_time
    return t ? `${fromNow(t)}更新` : ''
})

const imgLoaded = ref(false)
watch(
    () => props.book.cover_url,
    () => {
        imgLoaded.value = false
    }
)

function onContextMenu(event: MouseEvent) {
    event.preventDefault()
    emit('contextmenu', { book: props.book, x: event.clientX, y: event.clientY })
}
</script>

<template>
    <div
        class="fqa-sr-card"
        role="link"
        tabindex="0"
        :aria-label="book.title"
        @click="emit('open', book)"
        @keydown.enter.prevent="emit('open', book)"
        @contextmenu="onContextMenu"
    >
        <div class="fqa-sr-cover">
            <img
                class="fqa-sr-cover-img"
                :class="{ 'fqa-sr-cover-loading': !imgLoaded }"
                crossorigin="anonymous"
                loading="lazy"
                referrerpolicy="no-referrer"
                :src="book.cover_url"
                :alt="book.title"
                @load="imgLoaded = true"
                @error="imgLoaded = true"
            />
            <span v-if="book.in_bookshelf" class="fqa-sr-badge">在书架</span>
        </div>

        <div class="fqa-sr-body">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <h3 v-if="titleHtml" class="fqa-sr-title" v-html="titleHtml"></h3>
            <h3 v-else class="fqa-sr-title">{{ book.title }}</h3>

            <div class="fqa-sr-author">
                <span>{{ book.author }}</span>
                <span class="fqa-sr-score" :class="{ 'fqa-sr-score-none': !book.score }">
                    {{ book.score ? `${book.score}分` : '暂无评分' }}
                </span>
            </div>

            <p v-if="book.summary" class="fqa-sr-summary">{{ book.summary }}</p>

            <div class="fqa-sr-meta">
                <span v-for="part in metaParts" :key="part" class="fqa-sr-tag">{{ part }}</span>
                <span v-if="readText" class="fqa-sr-read">{{ readText }}</span>
            </div>

            <div v-if="updateText || book.last_chapter_title" class="fqa-sr-update">
                <span v-if="book.last_chapter_title" class="fqa-sr-chapter">
                    {{ book.last_chapter_title }}
                </span>
                <span v-if="updateText" class="fqa-sr-time">{{ updateText }}</span>
            </div>
        </div>
    </div>
</template>
