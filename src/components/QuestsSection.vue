<script setup lang="ts">
import SectionHead from './SectionHead.vue'

const quests = [
  {
    active: true,
    tone: 'yellow',
    kind: 'Main quest',
    when: '2024 → Jan 2027 · 2.5 yrs',
    state: 'Active',
    title: 'Frontend developer',
    where: 'Conduction B.V.',
    objectives: [
      'Built user interfaces with Vue and React as an experienced developer in the team.',
      'Led the development of a password manager browser extension, where security and usability meet.',
      'Learned to use AI tools effectively in day-to-day development.',
    ],
  },
  {
    active: false,
    tone: 'magenta',
    kind: 'Side quest',
    when: '2023 → 2024 · 1 yr',
    state: 'Ended',
    title: 'HBO Software Engineering',
    where: 'Windesheim University of Applied Sciences, Almere',
    objectives: [
      'Found out that I do my best work by building, not by studying theory.',
      'Learned what makes me happy at work, and went to do it.',
    ],
  },
  {
    active: false,
    tone: 'cyan',
    kind: 'Origin story',
    when: '2020 → 2023 · 3 yrs',
    state: 'Completed',
    title: 'MBO 4 Software Development',
    where: 'ROC van Flevoland',
    objectives: [
      'Built and tested software, and experimented with design and layout in HTML and CSS.',
      'Worked across frontend and backend, including PHP and databases.',
      'Worked in project teams using agile methods.',
    ],
  },
]
</script>

<template>
  <section class="section" id="quests" aria-labelledby="quests-title">
    <div class="wrap">
      <SectionHead
        tag="Sec.Quest_log"
        title="Quest log"
        kana="クエストログ"
        title-id="quests-title"
      />

      <ol class="quests">
        <li
          v-for="quest in quests"
          :key="quest.title"
          class="quest"
          :class="{ 'quest--active': quest.active }"
          data-reveal
        >
          <div class="quest__card">
            <div class="quest__meta">
              <span class="block block--sm" :class="`block--${quest.tone}`"
                ><span>{{ quest.kind }}</span></span
              >
              <span class="mono quest__when">{{ quest.when }}</span>
              <span class="mono quest__state"
                ><span v-if="quest.active" class="pulse"></span>{{ quest.state }}</span
              >
            </div>
            <h3 class="quest__title">{{ quest.title }}</h3>
            <p class="quest__where">{{ quest.where }}</p>
            <ul class="objectives">
              <li v-for="objective in quest.objectives" :key="objective">{{ objective }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
