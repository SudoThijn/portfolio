<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { t } from '@/i18n'
import SectionHead from './SectionHead.vue'

const EMAIL = 'thijn.douwma@outlook.com'

const emailLink = useTemplateRef<HTMLElement>('emailLink')
const copyState = ref<'copy' | 'copied' | 'selected'>('copy')
const done = ref(false)

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL)
    copyState.value = 'copied'
  } catch {
    // Clipboard access can be blocked, so select the address for a manual copy instead.
    const range = document.createRange()
    if (emailLink.value) range.selectNodeContents(emailLink.value)
    const selection = getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    copyState.value = 'selected'
  }
  done.value = true
  setTimeout(() => {
    copyState.value = 'copy'
    done.value = false
  }, 1800)
}
</script>

<template>
  <section class="section contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <SectionHead
        :tag="t('contact.tag')"
        :title="t('contact.title')"
        kana="コンタクト"
        title-id="contact-title"
      />

      <p class="contact__big" data-reveal>
        {{ t('contact.big') }} <span>{{ t('contact.bigAccent') }}</span>
      </p>

      <div class="channels">
        <div class="channel" data-reveal>
          <span class="channel__kind mono">{{ t('contact.email') }}</span>
          <a class="channel__value" ref="emailLink" :href="`mailto:${EMAIL}`">{{ EMAIL }}</a>
          <button
            class="btn btn--small"
            :class="{ 'is-done': done }"
            type="button"
            id="copy-email"
            @click="copyEmail"
          >
            <span>{{ t(`contact.${copyState}`) }}</span>
          </button>
        </div>
        <div class="channel" data-reveal>
          <span class="channel__kind mono">LinkedIn</span>
          <a
            class="channel__value"
            href="https://www.linkedin.com/in/thijn-douwma/"
            target="_blank"
            rel="noopener"
            >in/thijn-douwma</a
          >
          <a
            class="btn btn--small btn--ghost"
            href="https://www.linkedin.com/in/thijn-douwma/"
            target="_blank"
            rel="noopener"
            ><span>{{ t('contact.open') }}</span></a
          >
        </div>
        <div class="channel" data-reveal>
          <span class="channel__kind mono">GitHub</span>
          <a
            class="channel__value"
            href="https://github.com/SudoThijn"
            target="_blank"
            rel="noopener"
            >SudoThijn</a
          >
          <a
            class="btn btn--small btn--ghost"
            href="https://github.com/SudoThijn"
            target="_blank"
            rel="noopener"
            ><span>{{ t('contact.open') }}</span></a
          >
        </div>
      </div>
    </div>
  </section>
</template>
