<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { finePointer, reduceMotion } from '@/lib/env'
import { scramble } from '@/lib/scramble'
import TickerBand from './TickerBand.vue'

const name = useTemplateRef<HTMLElement>('name')
const emblem = useTemplateRef<HTMLElement>('emblem')

const nameLines = () => [...(name.value?.querySelectorAll<HTMLElement>('[data-scramble]') ?? [])]

const onTilt = (e: PointerEvent) => {
  const nx = e.clientX / innerWidth - 0.5
  const ny = e.clientY / innerHeight - 0.5
  emblem.value?.style.setProperty('--ry', `${nx * 22}deg`)
  emblem.value?.style.setProperty('--rx', `${ny * -22}deg`)
}

onMounted(() => {
  nameLines().forEach((el, i) => setTimeout(() => scramble(el, 700 + i * 250), 150 + i * 120))
  if (finePointer && !reduceMotion) addEventListener('pointermove', onTilt, { passive: true })
})
onBeforeUnmount(() => removeEventListener('pointermove', onTilt))

function rescramble() {
  nameLines().forEach((el, i) => scramble(el, 450 + i * 150))
}
</script>

<template>
  <section class="hero" aria-labelledby="hero-name">
    <div class="wrap hero__inner">
      <div class="hero__copy">
        <p class="mono hero__ident" data-intro="1">
          &gt; Ident confirmed <b>//</b> 52.52°N 5.72°E <b>//</b> Dronten, NL
        </p>
        <h1 class="hero__name" id="hero-name" ref="name" @pointerenter="rescramble">
          <span class="hero__line" data-scramble>Thijn</span>
          <span class="hero__line hero__line--outline" data-scramble>Douwma</span>
        </h1>
        <div class="hero__tags" data-intro="2">
          <span class="block block--yellow"><span>Frontend developer</span></span>
          <span class="block block--magenta"><span>LV.23</span></span>
          <span class="hero__kana-inline" aria-hidden="true">フロントエンド開発者</span>
        </div>
        <p class="hero__lede" data-intro="3">
          I build interfaces in Vue and React, and I lead the frontend of a password manager browser
          extension.
        </p>
        <div class="hero__actions" data-intro="4">
          <a class="btn btn--primary" href="#contact"><span>Get in touch</span></a>
          <a class="btn btn--ghost" href="#profile"><span>View profile</span></a>
        </div>
        <p class="status mono" data-intro="5">
          <span class="pulse"></span><span class="status__text">Available from January 2027</span>
        </p>
      </div>

      <div class="hero__emblem" aria-hidden="true">
        <div class="emblem" id="emblem" ref="emblem">
          <svg viewBox="0 0 400 400">
            <g class="spin spin--slow">
              <circle
                cx="200"
                cy="200"
                r="186"
                fill="none"
                stroke="var(--cyan)"
                stroke-width="1"
                stroke-dasharray="3 9"
                opacity=".7"
              />
            </g>
            <g class="spin spin--rev">
              <circle
                cx="200"
                cy="200"
                r="166"
                fill="none"
                stroke="var(--magenta)"
                stroke-width="6"
                stroke-dasharray="120 40 30 40 200 613"
                stroke-linecap="butt"
              />
            </g>
            <g class="spin">
              <circle
                cx="200"
                cy="200"
                r="146"
                fill="none"
                stroke="var(--line-bright)"
                stroke-width="1"
              />
              <circle
                cx="200"
                cy="200"
                r="146"
                fill="none"
                stroke="var(--yellow)"
                stroke-width="2"
                stroke-dasharray="40 877"
              />
              <rect x="196" y="50" width="8" height="8" fill="var(--yellow)" />
            </g>
            <polygon
              points="200,82 302,141 302,259 200,318 98,259 98,141"
              fill="var(--panel)"
              stroke="var(--line-bright)"
              stroke-width="1.5"
            />
            <polygon
              class="emblem__hex"
              points="200,100 286,150 286,250 200,300 114,250 114,150"
              fill="none"
              stroke="var(--yellow)"
              stroke-width="3"
            />
            <text x="200" y="232" text-anchor="middle" class="emblem__mono">TD</text>
            <text x="200" y="268" text-anchor="middle" class="emblem__sub">SUDOTHIJN</text>
          </svg>
          <span class="emblem__label emblem__label--a mono">Sync 100%</span>
          <span class="emblem__label emblem__label--b mono">Vue / React</span>
          <span class="emblem__label emblem__label--c mono">Ext. build</span>
        </div>
        <span class="hero__kana">テイン・ダウマ</span>
      </div>
    </div>

    <div class="ticker" aria-hidden="true">
      <TickerBand
        back
        text="Open source ◆ Browser extensions ◆ Interfaces ◆ Security ◆ Usability ◆&nbsp;"
      />
      <TickerBand
        text="Vue ◆ React ◆ JavaScript ◆ Browser extensions ◆ Open source ◆ AI-assisted ◆&nbsp;"
      />
    </div>
  </section>
</template>
