<script setup lang="ts">
import { t } from '@/i18n'
import { creditsOpen } from '@/lib/credits'
</script>

<template>
  <footer class="footer">
    <div class="wrap footer__inner mono">
      <span>© 2026 Thijn Douwma</span>
      <span>{{ t('footer.built') }}</span>
      <button class="footer__link" type="button" @click="creditsOpen = true">
        {{ t('footer.credits') }}
      </button>
      <a href="#top">{{ t('footer.top') }}</a>
    </div>
  </footer>
</template>
