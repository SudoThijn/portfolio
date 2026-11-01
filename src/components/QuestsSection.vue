<script setup lang="ts">
import { label, list, t, type Label, type MessageKey } from '@/i18n'
import SectionHead from './SectionHead.vue'

// The titles and places are names, shown as they are, apart from the one place that has a Dutch name.
interface Quest {
  active: boolean
  tone: string
  kind: MessageKey
  when: MessageKey
  state: MessageKey
  title: string
  where: Label
  objectives: MessageKey
}

const quests: Quest[] = [
  {
    active: true,
    tone: 'yellow',
    kind: 'quests.kind.main',
    when: 'quests.work.when',
    state: 'quests.state.active',
    title: 'Frontend developer',
    where: 'Conduction B.V.',
    objectives: 'quests.work.objectives',
  },
  {
    active: false,
    tone: 'magenta',
    kind: 'quests.kind.side',
    when: 'quests.hbo.when',
    state: 'quests.state.ended',
    title: 'HBO Software Engineering',
    where: { key: 'quests.hbo.where' },
    objectives: 'quests.hbo.objectives',
  },
  {
    active: false,
    tone: 'cyan',
    kind: 'quests.kind.origin',
    when: 'quests.mbo.when',
    state: 'quests.state.completed',
    title: 'MBO 4 Software Development',
    where: 'ROC van Flevoland',
    objectives: 'quests.mbo.objectives',
  },
]
</script>

<template>
  <section class="section" id="quests" aria-labelledby="quests-title">
    <div class="wrap">
      <SectionHead
        :tag="t('quests.tag')"
        :title="t('quests.title')"
        kana="クエストログ"
        title-id="quests-title"
      />

      <ol class="quests">
        <li
          v-for="quest in quests"
          :key="quest.tone"
          class="quest"
          :class="{ 'quest--active': quest.active }"
          data-reveal
        >
          <div class="quest__card">
            <div class="quest__meta">
              <span class="block block--sm" :class="`block--${quest.tone}`"
                ><span>{{ t(quest.kind) }}</span></span
              >
              <span class="mono quest__when">{{ t(quest.when) }}</span>
              <span class="mono quest__state"
                ><span v-if="quest.active" class="pulse"></span>{{ t(quest.state) }}</span
              >
            </div>
            <h3 class="quest__title">{{ quest.title }}</h3>
            <p class="quest__where">{{ label(quest.where) }}</p>
            <ul class="objectives">
              <li v-for="objective in list(quest.objectives)" :key="objective">{{ objective }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
