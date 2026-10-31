<script setup lang="ts">
import { computed, ref } from 'vue'
import { reduceMotion } from '@/lib/env'
import { CHARSET, METER_SEGMENTS, inspectPassword, randomPassword } from '@/lib/password'

// What the analysis reads, versus what the input shows while a generated password scrambles in.
const password = ref('hunter2')
const shown = ref(password.value)
const result = computed(() => inspectPassword(password.value))

function onInput(e: Event) {
  shown.value = password.value = (e.target as HTMLInputElement).value
}

function generate() {
  const target = randomPassword()
  if (reduceMotion) {
    shown.value = password.value = target
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / 600, 1)
    const settled = Math.floor(p * target.length)
    let text = target.slice(0, settled)
    for (let i = settled; i < target.length; i++)
      text += CHARSET[(Math.random() * CHARSET.length) | 0]
    shown.value = text
    if (p < 1) requestAnimationFrame(tick)
    else password.value = target
  }
  requestAnimationFrame(tick)
}
</script>

<template>
  <div class="lab" id="lab" :data-rank="result.rank">
    <div class="lab__head mono">
      <span>Password lab</span><span aria-hidden="true">パスワード</span>
    </div>
    <label class="lab__label mono" for="pw">Test a password. It never leaves this page.</label>
    <div class="lab__row">
      <input
        class="lab__input"
        id="pw"
        type="text"
        :value="shown"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        @input="onInput"
      />
      <button class="btn btn--small" id="pw-gen" type="button" @click="generate">
        <span>Generate</span>
      </button>
    </div>
    <div class="meter" id="meter" aria-hidden="true">
      <i
        v-for="n in METER_SEGMENTS"
        :key="n"
        :class="{ on: n <= result.filled }"
        :style="{ '--i': n - 1 }"
      ></i>
    </div>
    <div class="lab__verdict">
      <span class="block block--verdict" id="pw-rank"
        ><span>{{ result.label }}</span></span
      >
      <span class="mono lab__crack"
        >Cracked <b id="pw-time">{{ result.time }}</b></span
      >
    </div>
    <dl class="lab__stats mono">
      <div>
        <dt>Length</dt>
        <dd id="pw-len">{{ result.length }}</dd>
      </div>
      <div>
        <dt>Char pool</dt>
        <dd id="pw-pool">{{ result.pool }}</dd>
      </div>
      <div>
        <dt>Entropy</dt>
        <dd id="pw-bits">{{ result.bits }} bits</dd>
      </div>
      <div>
        <dt>Attack</dt>
        <dd>10B guesses/s</dd>
      </div>
    </dl>
  </div>
</template>
