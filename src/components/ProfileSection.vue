<script setup lang="ts">
import { computed, ref } from 'vue'
import { openTerminal } from '@/eggs/terminal'
import { currentAge } from '@/lib/env'
import { label, t, type Label, type MessageKey } from '@/i18n'
import SectionHead from './SectionHead.vue'

const STAT_SEGMENTS = 10

interface Stat {
  name: Label
  rank: 'experienced' | 'basic'
  level: number
  info: MessageKey
}

const stats: Stat[] = [
  { name: 'JavaScript', rank: 'experienced', level: 8, info: 'profile.stat.javascript' },
  { name: 'React', rank: 'experienced', level: 8, info: 'profile.stat.react' },
  { name: 'Vue', rank: 'experienced', level: 8, info: 'profile.stat.vue' },
  {
    name: { key: 'profile.stat.extensions' },
    rank: 'experienced',
    level: 8,
    info: 'profile.stat.extensionsInfo',
  },
  { name: 'PHP / backend', rank: 'basic', level: 3, info: 'profile.stat.php' },
]
const perks = [
  'profile.perk.learner',
  'profile.perk.initiative',
  'profile.perk.team',
  'profile.perk.ai',
  'profile.perk.openSource',
] as const

const active = ref(-1)
const info = computed(() => {
  const stat = stats[active.value]
  return stat ? `${label(stat.name)}: ${t(stat.info)}` : t('profile.statsHint')
})
</script>

<template>
  <section class="section" id="profile" aria-labelledby="profile-title">
    <div class="wrap">
      <SectionHead
        :tag="t('profile.tag')"
        :title="t('profile.title')"
        kana="プロフィール"
        title-id="profile-title"
      />

      <div class="sheet">
        <aside class="card idcard" data-reveal>
          <div class="idcard__strip mono">
            <span>{{ t('profile.card') }}</span
            ><button class="idcard__id" type="button" id="open-terminal" @click="openTerminal">
              ID//SudoThijn
            </button>
          </div>
          <div class="idcard__top">
            <div class="level">
              <span class="level__lv mono">LV</span>
              <span class="level__num">{{ currentAge() }}</span>
            </div>
            <div class="idcard__who">
              <p class="idcard__name">Thijn Douwma</p>
              <p class="idcard__class">{{ t('hero.role') }}</p>
              <p class="idcard__kana" aria-hidden="true" data-kana="フロントエンド開発者"></p>
            </div>
          </div>

          <div class="xp">
            <div class="xp__head mono">
              <span>{{ t('profile.xp') }}</span
              ><span>{{ t('profile.xpYears') }}</span>
            </div>
            <div class="xp__bar" role="img" :aria-label="t('profile.xpLabel')">
              <span class="xp__fill"></span>
            </div>
            <ul class="xp__legend mono">
              <li><i class="sw sw--cyan"></i>{{ t('profile.xpHobby') }}</li>
              <li><i class="sw sw--magenta"></i>{{ t('profile.xpPro') }}</li>
            </ul>
          </div>

          <dl class="idcard__facts">
            <div>
              <dt class="mono">{{ t('profile.origin') }}</dt>
              <dd>Dronten, NL</dd>
            </div>
            <div>
              <dt class="mono">{{ t('profile.guild') }}</dt>
              <dd>Conduction B.V.</dd>
            </div>
            <div>
              <dt class="mono">{{ t('profile.languages') }}</dt>
              <dd>{{ t('profile.languagesValue') }}</dd>
            </div>
            <div>
              <dt class="mono">{{ t('profile.status') }}</dt>
              <dd class="hl">{{ t('profile.statusValue') }}</dd>
            </div>
          </dl>
        </aside>

        <div class="sheet__main">
          <p class="bio" data-reveal>
            {{ t('profile.bio') }}
          </p>

          <div class="panel-block" data-reveal>
            <h3 class="mini mono">{{ t('profile.stats') }}</h3>
            <ul class="stats" id="stats">
              <li
                v-for="(stat, i) in stats"
                :key="stat.info"
                class="stat"
                :class="{ 'is-active': active === i }"
                tabindex="0"
                @pointerenter="active = i"
                @focus="active = i"
              >
                <span class="stat__name">{{ label(stat.name) }}</span
                ><span class="stat__rank mono">{{ t(`profile.rank.${stat.rank}`) }}</span
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
            <h3 class="mini mono">{{ t('profile.perks') }}</h3>
            <ul class="perks">
              <li v-for="perk in perks" :key="perk" class="block block--chip">
                <span>{{ t(perk) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
