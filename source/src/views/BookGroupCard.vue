<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { BookShelfEntry, BookShelfGroup } from '../types'

const props = defineProps<{ group: BookShelfGroup }>()

const emit = defineEmits<{
    (e: 'open', group: BookShelfGroup): void
    (e: 'visible', entries: BookShelfEntry[]): void
}>()

/** 封面只用前四本，没必要为整组拉详情 */
const previewBooks = computed(() => props.group.books.slice(0, 4))

const covers = computed(() =>
    previewBooks.value
        .map(entry => entry.detail)
        .filter((detail): detail is NonNullable<typeof detail> => !!detail)
)

/*
 * 分组卡片同样要驱动详情加载：封面取自成员书的 detail，
 * 而成员书本身不在网格里渲染，没有 BookCard 替它请求。
 */
const cardRef = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

function request() {
    const pending = previewBooks.value.filter(entry => !entry.detail)
    if (pending.length) emit('visible', pending)
}

onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') {
        request()
        return
    }
    io = new IntersectionObserver(
        entries => {
            if (entries.some(e => e.isIntersecting)) request()
        },
        { rootMargin: '200px' }
    )
    if (cardRef.value) io.observe(cardRef.value)
})

onBeforeUnmount(() => {
    io?.disconnect()
    io = null
})
</script>

<template>
    <div
        ref="cardRef"
        class="fqa-card"
        role="button"
        tabindex="0"
        :aria-label="`分组 ${group.name}`"
        @click="emit('open', group)"
        @keydown.enter.prevent="emit('open', group)"
        @keydown.space.prevent="emit('open', group)"
    >
        <div class="fqa-group-cover">
            <div class="fqa-group-grid">
                <div v-for="detail in covers" :key="detail.book_id" class="fqa-group-cell">
                    <img
                        crossorigin="anonymous"
                        loading="lazy"
                        referrerpolicy="no-referrer"
                        :src="detail.cover_url"
                        :alt="detail.title"
                    />
                </div>
            </div>
        </div>
        <div class="fqa-card-title" :title="group.name">{{ group.name }}</div>
        <div class="fqa-card-sub">共{{ group.books.length }}本书</div>
    </div>
</template>
