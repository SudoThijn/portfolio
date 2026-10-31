<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'

const props = defineProps<{ text: string; back?: boolean }>()

const track = useTemplateRef<HTMLElement>('track')
const copies = ref(1)
// Doubled so the -50% keyframe lands exactly on a repeat.
const content = computed(() => props.text.repeat(copies.value * 2))

onMounted(async () => {
  const el = track.value
  const band = el?.parentElement
  if (!el || !band) return
  while (el.scrollWidth < band.clientWidth * 2 && copies.value < 20) {
    copies.value++
    await nextTick()
  }
})
</script>

<template>
  <div class="ticker__band" :class="{ 'ticker__band--back': back }">
    <div class="ticker__track" ref="track">{{ content }}</div>
  </div>
</template>
