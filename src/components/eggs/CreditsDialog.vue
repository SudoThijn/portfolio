<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { CREDITS, creditsOpen } from '@/lib/credits'
import { playPopup } from '@/lib/sound'

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => {
  dialog.value?.showModal()
  void playPopup(true)
})

const close = () => dialog.value?.close()
const onClosed = () => {
  creditsOpen.value = false
  void playPopup(false)
}
</script>

<template>
  <dialog
    class="credits"
    ref="dialog"
    aria-labelledby="credits-title"
    @click.self="close"
    @close="onClosed"
  >
    <div class="credits__bar">
      <h2 class="credits__title" id="credits-title">Sound credits</h2>
      <button class="credits__close mono" type="button" @click="close">Close</button>
    </div>
    <ul class="credits__list">
      <li v-for="credit in CREDITS" :key="credit.work">
        <span>
          <a :href="credit.url" target="_blank" rel="noopener">{{ credit.work }}</a>
          <template v-if="'by' in credit"> by {{ credit.by }}</template>
        </span>
        <span class="credits__meta mono">
          {{ credit.use }} ·
          <a :href="credit.licenceUrl" target="_blank" rel="noopener">{{ credit.licence }}</a>
        </span>
      </li>
    </ul>
    <p class="credits__note mono">
      Sounds were converted to OGG, and some were trimmed or changed in volume.
    </p>
  </dialog>
</template>
