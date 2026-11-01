<script setup lang="ts">
import { bursts, denials, ring } from '@/eggs/charge'
import { cutinPlaying, cutinRun, overdrive, setOverdrive } from '@/eggs/modes'
import { saveBox } from '@/eggs/savepoint'
import { SECRETS, secretField, toasts } from '@/eggs/secrets'
import { t } from '@/i18n'
import { finePointer } from '@/lib/env'

const SHARDS = 10
const shardCount = (last: boolean) => (last ? SHARDS * 2 : SHARDS)

// Shards fan out evenly, with every other one nudged and their reach varying in three steps.
const shardStyle = (n: number, count: number) => ({
  '--a': `${(360 / count) * n + (n % 2) * 7}deg`,
  '--d': `${110 + (n % 3) * 55}px`,
})

// Only mention the Esc key where there is likely a keyboard.
const escHint = finePointer ? ' · Esc' : ''
</script>

<template>
  <div class="toasts" role="status" aria-live="polite">
    <div v-for="toast in toasts" :key="toast.key" class="toast" :class="{ 'is-out': toast.out }">
      <span class="toast__kicker">{{ t('egg.toast') }}</span>
      <span class="toast__title">{{ secretField(toast.id, 'title') }}</span>
      <span class="toast__text">{{ secretField(toast.id, 'text') }}</span>
      <span class="toast__count">{{ toast.count }}/{{ SECRETS.length }}</span>
    </div>
  </div>

  <!-- A new key remounts the band, which restarts its animation. -->
  <div class="cutin" :key="cutinRun" :class="{ 'is-playing': cutinPlaying }" aria-hidden="true">
    <div class="cutin__flash"></div>
    <div class="cutin__band">
      <div class="cutin__lines"></div>
      <div class="cutin__content">
        <span class="cutin__kana">オーバードライブ</span>
        <span class="cutin__title">Overdrive</span>
        <span class="cutin__sub">{{ t('egg.cutinSub') }}</span>
      </div>
    </div>
  </div>

  <button
    class="btn btn--small btn--primary od-exit"
    type="button"
    :hidden="!overdrive"
    @click="setOverdrive(false)"
  >
    <span>{{ t('egg.exitOverdrive') }}{{ escHint }}</span>
  </button>

  <div
    class="charge"
    aria-hidden="true"
    :class="{ 'is-on': ring.on, 'is-full': ring.full }"
    :style="{ left: `${ring.x}px`, top: `${ring.y}px`, '--charge': ring.level }"
  ></div>
  <div
    v-for="burst in bursts"
    :key="burst.key"
    class="blast"
    :class="{ 'blast--overdrive': burst.overdrive, 'blast--last': burst.last }"
    :style="{ left: `${burst.x}px`, top: `${burst.y}px` }"
    aria-hidden="true"
  >
    <div class="burst"></div>
    <template v-if="burst.overdrive">
      <div class="burst burst--late"></div>
      <div class="blast__flash"></div>
      <i
        v-for="n in shardCount(burst.last)"
        :key="n"
        class="blast__shard"
        :style="shardStyle(n, shardCount(burst.last))"
      ></i>
    </template>
  </div>
  <div
    v-for="denial in denials"
    :key="denial.key"
    class="deny"
    aria-hidden="true"
    :style="{ left: `${denial.x}px`, top: `${denial.y}px` }"
  ></div>

  <div
    v-if="saveBox"
    :key="saveBox.key"
    class="savepoint"
    role="status"
    :class="{ 'is-out': saveBox.out }"
  >
    <span class="savepoint__crystal" aria-hidden="true"></span>
    <span class="savepoint__body">
      <span class="savepoint__text">
        <b v-if="saveBox.saved">{{ t('egg.saved') }}</b>
        <template v-else>{{ t('egg.saving') }}</template>
      </span>
      <span class="savepoint__meta">{{
        saveBox.saved
          ? t('egg.saveMeta', { found: saveBox.found, total: SECRETS.length, time: saveBox.time })
          : ''
      }}</span>
    </span>
  </div>
</template>
