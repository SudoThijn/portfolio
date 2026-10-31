<script setup lang="ts">
import { computed, ref } from 'vue'
import { openTerminal } from '@/eggs/terminal'
import SectionHead from './SectionHead.vue'

const STAT_SEGMENTS = 10

const stats = [
  {
    name: 'JavaScript',
    rank: 'Experienced',
    level: 8,
    info: 'Eight-plus years of it, from hobby projects to production code.',
  },
  { name: 'React', rank: 'Experienced', level: 8, info: 'Production interfaces at Conduction.' },
  {
    name: 'Vue',
    rank: 'Experienced',
    level: 8,
    info: 'Production interfaces at Conduction, day to day.',
  },
  {
    name: 'Browser extensions',
    rank: 'Experienced',
    level: 8,
    info: 'Lead frontend developer on a password manager extension.',
  },
  {
    name: 'PHP / backend',
    rank: 'Basic',
    level: 3,
    info: 'The basics from MBO: PHP and databases.',
  },
]
const perks = [
  'Fast learner',
  'Takes initiative',
  'Team player',
  'AI-assisted workflow',
  'Open source',
]

const active = ref(-1)
const info = computed(() => {
  const stat = stats[active.value]
  return stat ? `${stat.name}: ${stat.info}` : 'Hover or focus a stat to inspect it.'
})
</script>

<template>
  <section class="section" id="profile" aria-labelledby="profile-title">
    <div class="wrap">
      <SectionHead
        tag="Sec.Profile"
        title="Character profile"
        kana="プロフィール"
        title-id="profile-title"
      />

      <div class="sheet">
        <aside class="card idcard" data-reveal>
          <div class="idcard__strip mono">
            <span>Player card</span
            ><button class="idcard__id" type="button" id="open-terminal" @click="openTerminal">
              ID//SudoThijn
            </button>
          </div>
          <div class="idcard__top">
            <div class="level">
              <span class="level__lv mono">LV</span>
              <span class="level__num">23</span>
            </div>
            <div class="idcard__who">
              <p class="idcard__name">Thijn Douwma</p>
              <p class="idcard__class">Frontend developer</p>
              <p class="idcard__kana" aria-hidden="true" data-kana="フロントエンド開発者"></p>
            </div>
          </div>

          <div class="xp">
            <div class="xp__head mono"><span>Coding XP</span><span>8 yrs</span></div>
            <div
              class="xp__bar"
              role="img"
              aria-label="8 years of coding, 2.5 of them professional"
            >
              <span class="xp__fill"></span>
            </div>
            <ul class="xp__legend mono">
              <li><i class="sw sw--cyan"></i>Hobby &amp; school 5.5</li>
              <li><i class="sw sw--magenta"></i>Professional 2.5</li>
            </ul>
          </div>

          <dl class="idcard__facts">
            <div>
              <dt class="mono">Origin</dt>
              <dd>Dronten, NL</dd>
            </div>
            <div>
              <dt class="mono">Guild</dt>
              <dd>Conduction B.V.</dd>
            </div>
            <div>
              <dt class="mono">Languages</dt>
              <dd>Dutch (native), English (fluent)</dd>
            </div>
            <div>
              <dt class="mono">Status</dt>
              <dd class="hl">Free agent from Jan 2027</dd>
            </div>
          </dl>
        </aside>

        <div class="sheet__main">
          <p class="bio" data-reveal>
            Frontend developer with more than eight years of programming behind me, two and a half
            of them professional. Coding isn't just my job; I've been building things since I was a
            kid and I share my work as open source. I learn fast, take initiative, like working in a
            team, and use AI tools deliberately to ship faster and better.
          </p>

          <div class="panel-block" data-reveal>
            <h3 class="mini mono">Stats</h3>
            <ul class="stats" id="stats">
              <li
                v-for="(stat, i) in stats"
                :key="stat.name"
                class="stat"
                :class="{ 'is-active': active === i }"
                tabindex="0"
                @pointerenter="active = i"
                @focus="active = i"
              >
                <span class="stat__name">{{ stat.name }}</span
                ><span class="stat__rank mono">{{ stat.rank }}</span
                ><span class="segs"
                  ><i
                    v-for="n in STAT_SEGMENTS"
                    :key="n"
                    :class="{ on: n <= stat.level }"
                    :style="{ '--i': n - 1 }"
                  ></i
                ></span>
              </li>
            </ul>
            <p class="stats__info mono" id="stat-info" aria-live="polite">
              <span>&gt;</span> <span id="stat-info-text">{{ info }}</span>
            </p>
          </div>

          <div class="panel-block" data-reveal>
            <h3 class="mini mono">Perks</h3>
            <ul class="perks">
              <li v-for="perk in perks" :key="perk" class="block block--chip">
                <span>{{ perk }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
