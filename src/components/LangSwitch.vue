<script setup lang="ts">
import { LOCALES, locale, setLocale, t } from '@/i18n'

const NAMES = { en: 'English', nl: 'Nederlands' } as const
</script>

<template>
  <div class="hud__lang" role="group" :aria-label="t('hud.language')" :data-locale="locale">
    <button
      v-for="code in LOCALES"
      :key="code"
      type="button"
      :lang="code"
      :title="NAMES[code]"
      :aria-label="`${code.toUpperCase()}, ${NAMES[code]}`"
      :aria-pressed="locale === code"
      @click="setLocale(code)"
    >
      <span>{{ code.toUpperCase() }}</span>
    </button>
  </div>
</template>
