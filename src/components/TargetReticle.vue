<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { mountReticle } from '@/lib/reticle'

const reticle = useTemplateRef<HTMLElement>('reticle')
let unmount = () => {}

onMounted(() => {
  if (reticle.value) unmount = mountReticle(reticle.value)
})
onBeforeUnmount(() => unmount())
</script>

<template>
  <div class="reticle" ref="reticle" aria-hidden="true">
    <i></i><i></i><i></i><i></i>
    <span class="reticle__ammo"><b></b><b></b><b></b><s></s></span>
  </div>
</template>
