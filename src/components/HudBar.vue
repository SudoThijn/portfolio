<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { t } from '@/i18n'
import { clockFormat } from '@/lib/env'
import LangSwitch from './LangSwitch.vue'
import { found, SECRETS } from '@/eggs/secrets'
import { clockPressed } from '@/eggs/modes'
import { soundOn, soundPlaying, toggleSound } from '@/lib/sound'

const NAV = [
  { href: '#profile', label: 'nav.profile' },
  { href: '#quests', label: 'nav.quests' },
  { href: '#builds', label: 'nav.builds' },
  { href: '#contact', label: 'nav.contact' },
] as const

const clock = ref(clockFormat.format(new Date()))
const progress = ref(0)
const current = ref<string | null>(null)

const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight
  progress.value = max > 0 ? scrollY / max : 0
}

let tick = 0
let spy: IntersectionObserver | undefined

onMounted(() => {
  tick = window.setInterval(() => {
    clock.value = clockFormat.format(new Date())
  }, 1000)

  updateProgress()
  addEventListener('scroll', updateProgress, { passive: true })

  spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // The hero has no id, so reaching it clears the active tab.
        if (entry.isIntersecting) current.value = entry.target.id ? `#${entry.target.id}` : ''
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  document.querySelectorAll('main > section').forEach((section) => spy?.observe(section))
})

onBeforeUnmount(() => {
  clearInterval(tick)
  removeEventListener('scroll', updateProgress)
  spy?.disconnect()
})
</script>

<template>
  <header class="hud">
    <a class="hud__logo" href="#top" :aria-label="t('hud.top')"><span>TD</span></a>
    <nav class="hud__nav" :aria-label="t('hud.sections')">
      <a
        v-for="item in NAV"
        :key="item.href"
        :href="item.href"
        :aria-current="current === null ? undefined : current === item.href"
        ><span>{{ t(item.label) }}</span></a
      >
    </nav>
    <button
      class="hud__sound mono"
      type="button"
      :data-on="soundOn"
      :data-playing="soundPlaying"
      @click="toggleSound"
    >
      <span class="hud__bars" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="hud__sound-label">{{ t(soundOn ? 'hud.soundOn' : 'hud.soundOff') }}</span>
    </button>
    <LangSwitch />
    <p class="hud__meta mono">
      <span class="hud__secrets" :hidden="found.size === 0"
        >◆ {{ t('hud.secrets') }} <b>{{ found.size }}/{{ SECRETS.length }}</b></span
      >
      <span class="pulse"></span>
      <span id="clock" @click="clockPressed">{{ clock }}</span>
      <span class="hud__place">Dronten</span>
    </p>
    <div class="hud__progress" aria-hidden="true">
      <span id="progress" :style="{ transform: `scaleX(${progress})` }"></span>
    </div>
  </header>
</template>
