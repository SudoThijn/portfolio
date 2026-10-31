<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { SECRETS, levelUpOpen } from '@/eggs/secrets'

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => dialog.value?.showModal())

const close = () => dialog.value?.close()
const onClosed = () => {
  levelUpOpen.value = false
}
</script>

<template>
  <dialog
    class="levelup"
    ref="dialog"
    aria-labelledby="levelup-title"
    @click.self="close"
    @close="onClosed"
  >
    <div class="levelup__lines" aria-hidden="true"></div>
    <div class="levelup__card">
      <p class="levelup__kicker">◆ All secrets found {{ SECRETS.length }}/{{ SECRETS.length }}</p>
      <h2 class="levelup__title" id="levelup-title">Level up!</h2>
      <p class="levelup__text">
        You kept digging until you found everything hidden here. That's how I work too.
      </p>
      <div class="levelup__actions">
        <a class="btn btn--primary" href="#contact" @click="close"><span>Get in touch</span></a>
        <button class="btn btn--ghost" type="button" @click="close"><span>Close</span></button>
      </div>
    </div>
  </dialog>
</template>
