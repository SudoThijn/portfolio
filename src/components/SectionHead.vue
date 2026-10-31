<script setup lang="ts">
defineProps<{ tag: string; title: string; kana: string; titleId: string }>()
</script>

<template>
  <header class="sec-head" data-reveal>
    <span class="sec-head__tag mono">{{ tag }}</span>
    <h2 class="sec-head__title" :id="titleId">{{ title }}</h2>
    <span class="sec-head__kana" aria-hidden="true" :data-kana="kana"></span>
  </header>
</template>
