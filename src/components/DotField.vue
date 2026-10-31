<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { mountField } from '@/lib/field'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
let unmount = () => {}

onMounted(() => {
  if (canvas.value) unmount = mountField(canvas.value)
})
onBeforeUnmount(() => unmount())
</script>

<template>
  <canvas id="field" ref="canvas" aria-hidden="true"></canvas>
</template>
