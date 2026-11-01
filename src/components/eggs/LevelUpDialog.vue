<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { SECRETS, levelUpOpen } from '@/eggs/secrets'
import { t } from '@/i18n'
import { playLevelUp } from '@/lib/sound'

const dialog = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => {
  dialog.value?.showModal()
  void playLevelUp()
})

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
      <p class="levelup__kicker">{{ t('egg.levelUpKicker', { total: SECRETS.length }) }}</p>
      <h2 class="levelup__title" id="levelup-title">{{ t('egg.levelUpTitle') }}</h2>
      <p class="levelup__text">{{ t('egg.levelUpText') }}</p>
      <div class="levelup__actions">
        <a class="btn btn--primary" href="#contact" @click="close"
          ><span>{{ t('common.contact') }}</span></a
        >
        <button class="btn btn--ghost" type="button" @click="close">
          <span>{{ t('common.close') }}</span>
        </button>
      </div>
    </div>
  </dialog>
</template>
