<script setup lang="ts">
// /search 落地页。原站这个路径是 404，这里放 APP 的搜索中间页内容。
import { onMounted, ref } from 'vue'
import { getSearchLanding } from '../api/search'
import type { SearchLandingSection } from '../types'

const emit = defineEmits<{
    (e: 'word', word: string): void
}>()

const sections = ref<SearchLandingSection[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function load() {
    loading.value = true
    error.value = null
    try {
        sections.value = await getSearchLanding()
    } catch (err) {
        console.error('[fqa:search] 推荐加载失败:', err)
        error.value = err instanceof Error ? err.message : String(err)
    } finally {
        loading.value = false
    }
}

function openBook(bookId: string) {
    unsafeWindow.location.href = `https://fanqienovel.com/page/${bookId}`
}

onMounted(load)
</script>

<template>
    <div class="fqa-s-landing">
        <div v-if="loading" class="fqa-s-landing-sk">
            <div v-for="n in 12" :key="n" class="fqa-sk-chip fqa-sk-anim"></div>
        </div>

        <!-- 推荐失败不影响搜索本身，给个轻提示就够了 -->
        <div v-else-if="error" class="fqa-s-status">
            <div class="fqa-s-status-title">推荐内容加载失败</div>
            <div>直接在上方输入关键词也可以搜索</div>
            <button class="fqa-s-submit" @click="load">重试</button>
        </div>

        <div v-else-if="!sections.length" class="fqa-s-status">
            <div class="fqa-s-status-title">输入关键词开始搜索</div>
        </div>

        <template v-else>
            <section v-for="(section, i) in sections" :key="`${section.title}-${i}`" class="fqa-s-sec">
                <h3 class="fqa-s-sec-title">{{ section.title }}</h3>

                <div v-if="section.words.length" class="fqa-s-words">
                    <button
                        v-for="(w, wi) in section.words"
                        :key="`${w.word}-${wi}`"
                        class="fqa-s-word"
                        @click="emit('word', w.word)"
                    >
                        <span v-if="w.label" class="fqa-s-word-label">{{ w.label }}</span>
                        {{ w.word }}
                        <span v-if="w.tag" class="fqa-s-word-tag">{{ w.tag }}</span>
                    </button>
                </div>

                <div v-if="section.books.length" class="fqa-s-sugs">
                    <div
                        v-for="b in section.books"
                        :key="b.book_id"
                        class="fqa-s-sug"
                        role="link"
                        tabindex="0"
                        @click="openBook(b.book_id)"
                        @keydown.enter.prevent="openBook(b.book_id)"
                    >
                        <img
                            class="fqa-s-sug-cover"
                            crossorigin="anonymous"
                            loading="lazy"
                            referrerpolicy="no-referrer"
                            :src="b.cover_url"
                            :alt="b.title"
                        />
                        <div class="fqa-s-sug-title" :title="b.title">{{ b.title }}</div>
                        <div v-if="b.desc || b.author" class="fqa-s-sug-sub">
                            {{ b.desc || b.author }}
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </div>
</template>
