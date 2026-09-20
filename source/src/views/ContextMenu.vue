<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MenuItem } from '../types'

const props = defineProps<{
    visible: boolean
    x: number
    y: number
    items: MenuItem[]
}>()

const emit = defineEmits<{
    (e: 'select', key: string): void
    (e: 'close'): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const subRef = ref<HTMLElement | null>(null)
/** 当前展开子菜单的项 key */
const openKey = ref<string | null>(null)

const pos = ref({ x: 0, y: 0 })
const subPos = ref({ x: 0, y: 0 })

const MARGIN = 8

/** 菜单可能超出视口，翻转/夹取到可见区域内 */
async function place() {
    pos.value = { x: props.x, y: props.y }
    await nextTick()
    const el = rootRef.value
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    let x = props.x
    let y = props.y
    if (x + width > window.innerWidth - MARGIN) x = props.x - width
    if (y + height > window.innerHeight - MARGIN) y = window.innerHeight - height - MARGIN
    pos.value = {
        x: Math.max(MARGIN, x),
        y: Math.max(MARGIN, y),
    }
}

watch(
    () => [props.visible, props.x, props.y],
    () => {
        openKey.value = null
        if (props.visible) void place()
    }
)

async function openSub(item: MenuItem, event: MouseEvent) {
    if (!item.children?.length) {
        openKey.value = null
        return
    }
    openKey.value = item.key
    const row = event.currentTarget as HTMLElement
    const rect = row.getBoundingClientRect()
    subPos.value = { x: rect.right - 2, y: rect.top }
    await nextTick()
    const el = subRef.value
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    let x = rect.right - 2
    let y = rect.top
    if (x + width > window.innerWidth - MARGIN) x = rect.left - width + 2
    if (y + height > window.innerHeight - MARGIN) y = window.innerHeight - height - MARGIN
    subPos.value = { x: Math.max(MARGIN, x), y: Math.max(MARGIN, y) }
}

function choose(item: MenuItem) {
    if (item.disabled || item.children?.length) return
    emit('select', item.key)
    emit('close')
}

function onDocPointer(e: Event) {
    const t = e.target as Node
    if (rootRef.value?.contains(t) || subRef.value?.contains(t)) return
    emit('close')
}

function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') emit('close')
}

onMounted(() => {
    document.addEventListener('pointerdown', onDocPointer, true)
    document.addEventListener('keydown', onKey)
    // 滚动时直接收起，避免菜单和卡片脱节
    window.addEventListener('scroll', () => emit('close'), true)
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocPointer, true)
    document.removeEventListener('keydown', onKey)
})

const style = computed(() => ({ left: `${pos.value.x}px`, top: `${pos.value.y}px` }))
const subStyle = computed(() => ({ left: `${subPos.value.x}px`, top: `${subPos.value.y}px` }))
const activeChildren = computed(
    () => props.items.find(i => i.key === openKey.value)?.children ?? []
)
</script>

<template>
    <div v-if="visible" ref="rootRef" class="fqa-menu" :style="style" role="menu">
        <div
            v-for="item in items"
            :key="item.key"
            class="fqa-menu-row"
            :class="{
                'fqa-menu-danger': item.danger,
                'fqa-menu-disabled': item.disabled,
                'fqa-menu-open': openKey === item.key
            }"
            role="menuitem"
            :aria-disabled="item.disabled"
            @mouseenter="openSub(item, $event)"
            @click="choose(item)"
        >
            <span>{{ item.label }}</span>
            <span v-if="item.children?.length" class="fqa-menu-arrow">›</span>
        </div>
    </div>

    <div
        v-if="visible && activeChildren.length"
        ref="subRef"
        class="fqa-menu fqa-menu-sub"
        :style="subStyle"
        role="menu"
    >
        <div
            v-for="child in activeChildren"
            :key="child.key"
            class="fqa-menu-row"
            :class="{ 'fqa-menu-disabled': child.disabled }"
            role="menuitem"
            @click="choose(child)"
        >
            <span>{{ child.label }}</span>
        </div>
    </div>
</template>
