import { reactive, ref, watch } from 'vue'
import { dialogOpen } from '@/lib/dom'
import { finePointer, reduceMotion } from '@/lib/env'
import { field } from '@/lib/field'
import { CLIP_SIZE, reticleState } from '@/lib/reticle'
import { startCharge, type Charge } from '@/lib/sound'
import { isLeet, overdrive } from './modes'
import { unlock } from './secrets'

const CHARGE_MS = 900
// A quick click shouldn't flash the ring, so it only shows once a hold is clearly happening.
const RING_DELAY_MS = 140
// Overdrive charges fast and holds a clip of shots. The clip refills in full this long after the
// last shot, and an empty clip means waiting for that.
const OVERDRIVE_CHARGE_MS = 260
const OVERDRIVE_RING_DELAY_MS = 60
const COOLDOWN_MS = 1000
const SECOND_WAVE_MS = 110
const RECOIL_MS = 220
const NOT_EMPTY = 'a, button, input, textarea, select, label, dialog, .stat, .lab'
// The reticle is only mounted with a fine pointer and motion, so the others get a denial mark.
const reticleShown = finePointer && !reduceMotion

interface Blast {
  key: number
  x: number
  y: number
  overdrive: boolean
  last: boolean
}

export const ring = reactive({ x: 0, y: 0, level: 0, on: false, full: false })
export const bursts = ref<Blast[]>([])
export const denials = ref<{ key: number; x: number; y: number }[]>([])

const root = document.documentElement

let charging = false
let chargeSound: Charge | undefined
let chargeStart = 0
let chargeFrame = 0
let burstKey = 0
let lastShot = 0
let cooldownFrame = 0

function tick() {
  const fast = overdrive.value
  const elapsed = performance.now() - chargeStart
  const level = Math.min(elapsed / (fast ? OVERDRIVE_CHARGE_MS : CHARGE_MS), 1)
  reticleState.charge = level
  ring.level = level
  ring.on = elapsed > (fast ? OVERDRIVE_RING_DELAY_MS : RING_DELAY_MS)
  ring.full = level >= 1
  if (ring.on && !chargeSound) chargeSound = startCharge()
  if (charging) chargeFrame = requestAnimationFrame(tick)
}

function cooldownTick() {
  const progress = Math.min((performance.now() - lastShot) / COOLDOWN_MS, 1)
  reticleState.cooldown = progress
  if (progress >= 1) {
    reticleState.ammo = CLIP_SIZE
    return
  }
  cooldownFrame = requestAnimationFrame(cooldownTick)
}

function spendShot() {
  reticleState.ammo--
  reticleState.cooldown = 0
  lastShot = performance.now()
  cancelAnimationFrame(cooldownFrame)
  cooldownFrame = requestAnimationFrame(cooldownTick)
}

function refillClip() {
  cancelAnimationFrame(cooldownFrame)
  reticleState.ammo = CLIP_SIZE
  reticleState.cooldown = 1
}

// Leaving overdrive hands back a full clip, so the next visit starts loaded.
watch(overdrive, refillClip)

// The page kicks back, harder on the last shot of the clip. Removing the class and reading a
// layout value first lets the animation restart when shots follow each other quickly.
function recoil(heavy: boolean) {
  root.classList.remove('od-recoil', 'od-recoil--heavy')
  void root.offsetWidth
  root.classList.add('od-recoil')
  root.classList.toggle('od-recoil--heavy', heavy)
  setTimeout(() => root.classList.remove('od-recoil', 'od-recoil--heavy'), RECOIL_MS)
}

function addTransient<T extends { key: number }>(list: { value: T[] }, item: T, ms: number) {
  list.value.push(item)
  setTimeout(() => {
    list.value = list.value.filter((entry) => entry.key !== item.key)
  }, ms)
}

function release(fire: boolean) {
  if (!charging) return
  charging = false
  cancelAnimationFrame(chargeFrame)
  const full = reticleState.charge >= 1
  reticleState.charge = 0
  ring.on = false
  ring.full = false
  const sound = chargeSound
  chargeSound = undefined
  if (!fire || !full) {
    sound?.cancel()
    return
  }
  const { x, y } = ring
  const fast = overdrive.value
  sound?.fire()
  field.shockwave(x, y)
  if (fast) {
    spendShot()
    setTimeout(() => field.shockwave(x, y), SECOND_WAVE_MS)
  }
  const last = fast && reticleState.ammo <= 0
  if (!reduceMotion) {
    addTransient(bursts, { key: burstKey++, x, y, overdrive: fast, last }, last ? 1000 : 800)
    if (fast) recoil(last)
  }
  unlock('charge')
}

function deny(x: number, y: number) {
  if (!reduceMotion) addTransient(denials, { key: burstKey++, x, y }, 450)
}

export function initCharge() {
  addEventListener('pointerdown', (e) => {
    const target = e.target
    if (
      e.button !== 0 ||
      !(target instanceof Element) ||
      target.closest(NOT_EMPTY) ||
      dialogOpen()
    ) {
      return
    }
    if (overdrive.value && reticleState.ammo <= 0) {
      deny(e.clientX, e.clientY)
      return
    }
    // LEET mode: the weapon is dead, and pressing is how the visitor finds out.
    if (isLeet()) {
      reticleState.failedAt = performance.now()
      if (!reticleShown) deny(e.clientX, e.clientY)
      return
    }
    charging = true
    chargeStart = performance.now()
    ring.x = e.clientX
    ring.y = e.clientY
    tick()
  })
  addEventListener(
    'pointermove',
    (e) => {
      if (!charging) return
      ring.x = e.clientX
      ring.y = e.clientY
    },
    { passive: true },
  )
  addEventListener('pointerup', () => release(true))
  addEventListener('pointercancel', () => release(false))
}
