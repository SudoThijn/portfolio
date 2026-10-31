<script setup lang="ts">
import { creditsOpen } from '@/lib/credits'
</script>

<template>
  <footer class="footer">
    <div class="wrap footer__inner mono">
      <span>© 2026 Thijn Douwma</span>
      <span>Hand-built in Dronten, no templates</span>
      <button class="footer__link" type="button" @click="creditsOpen = true">Sound credits</button>
      <a href="#top">Back to top ↑</a>
    </div>
  </footer>
</template>
