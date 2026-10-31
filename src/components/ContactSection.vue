<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import SectionHead from './SectionHead.vue'

const EMAIL = 'thijn.douwma@outlook.com'

const emailLink = useTemplateRef<HTMLElement>('emailLink')
const label = ref('Copy')
const done = ref(false)

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL)
    label.value = 'Copied'
  } catch {
    // Clipboard access can be blocked, so select the address for a manual copy instead.
    const range = document.createRange()
    if (emailLink.value) range.selectNodeContents(emailLink.value)
    const selection = getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    label.value = 'Selected'
  }
  done.value = true
  setTimeout(() => {
    label.value = 'Copy'
    done.value = false
  }, 1800)
}
</script>

<template>
  <section class="section contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <SectionHead tag="Sec.Comms" title="Contact" kana="コンタクト" title-id="contact-title" />

      <p class="contact__big" data-reveal>
        Hiring a frontend developer for 2027? <span>Let's talk.</span>
      </p>

      <div class="channels">
        <div class="channel" data-reveal>
          <span class="channel__kind mono">Email</span>
          <a class="channel__value" ref="emailLink" :href="`mailto:${EMAIL}`">{{ EMAIL }}</a>
          <button
            class="btn btn--small"
            :class="{ 'is-done': done }"
            type="button"
            id="copy-email"
            @click="copyEmail"
          >
            <span>{{ label }}</span>
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
            ><span>Open</span></a
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
            ><span>Open</span></a
          >
        </div>
      </div>
    </div>
  </section>
</template>
