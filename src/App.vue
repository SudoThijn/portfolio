<script setup lang="ts">
import BuildsSection from './components/BuildsSection.vue'
import ContactSection from './components/ContactSection.vue'
import DotField from './components/DotField.vue'
import HeroSection from './components/HeroSection.vue'
import HudBar from './components/HudBar.vue'
import ProfileSection from './components/ProfileSection.vue'
import QuestsSection from './components/QuestsSection.vue'
import SiteFooter from './components/SiteFooter.vue'
import TargetReticle from './components/TargetReticle.vue'
import EggOverlays from './components/eggs/EggOverlays.vue'
import CreditsDialog from './components/eggs/CreditsDialog.vue'
import LevelUpDialog from './components/eggs/LevelUpDialog.vue'
import TerminalDialog from './components/eggs/TerminalDialog.vue'
import { levelUpOpen } from './eggs/secrets'
import { creditsOpen } from './lib/credits'
</script>

<template>
  <DotField />
  <div class="scanlines" aria-hidden="true"></div>
  <TargetReticle />

  <HudBar />

  <main id="top">
    <HeroSection />
    <ProfileSection />
    <QuestsSection />
    <BuildsSection />
    <ContactSection />
  </main>

  <SiteFooter />

  <EggOverlays />
  <TerminalDialog />
  <LevelUpDialog v-if="levelUpOpen" />
  <CreditsDialog v-if="creditsOpen" />
</template>
