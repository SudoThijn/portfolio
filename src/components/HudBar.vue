<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { clockFormat } from '@/lib/env'
import { found, SECRETS } from '@/eggs/secrets'
import { clockPressed } from '@/eggs/modes'

const NAV = [
  { href: '#profile', label: 'Profile' },
  { href: '#quests', label: 'Quests' },
  { href: '#builds', label: 'Builds' },
  { href: '#contact', label: 'Contact' },
]

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
    <a class="hud__logo" href="#top" aria-label="Back to top"><span>TD</span></a>
    <nav class="hud__nav" aria-label="Sections">
      <a
        v-for="item in NAV"
        :key="item.href"
        :href="item.href"
        :aria-current="current === null ? undefined : current === item.href"
        ><span>{{ item.label }}</span></a
      >
    </nav>
    <p class="hud__meta mono">
      <span class="hud__secrets" :hidden="found.size === 0"
        >◆ Secrets <b>{{ found.size }}/{{ SECRETS.length }}</b></span
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
