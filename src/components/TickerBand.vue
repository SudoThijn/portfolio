<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

const props = defineProps<{ text: string; back?: boolean }>()

const track = useTemplateRef<HTMLElement>('track')
const copies = ref(1)
// Doubled so the -50% keyframe lands exactly on a repeat.
const content = computed(() => props.text.repeat(copies.value * 2))

// Adds copies until the track is twice as wide as the band. A newer run replaces an older one.
let run = 0
async function fill() {
  const el = track.value
  const band = el?.parentElement
  if (!el || !band) return
  const id = ++run
  copies.value = 1
  await nextTick()
  while (id === run && el.scrollWidth < band.clientWidth * 2 && copies.value < 20) {
    copies.value++
    await nextTick()
  }
}

onMounted(fill)
// A different text has a different width, so the number of copies has to be worked out again.
watch(() => props.text, fill)
</script>

<template>
  <div class="ticker__band" :class="{ 'ticker__band--back': back }">
    <div class="ticker__track" ref="track">{{ content }}</div>
  </div>
</template>
