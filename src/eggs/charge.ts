import { reactive, ref } from 'vue'
import { dialogOpen } from '@/lib/dom'
import { reduceMotion } from '@/lib/env'
import { field } from '@/lib/field'
import { reticleState } from '@/lib/reticle'
import { startCharge, type Charge } from '@/lib/sound'
import { unlock } from './secrets'

const CHARGE_MS = 900
const NOT_EMPTY = 'a, button, input, textarea, select, label, dialog, .stat, .lab'

export const ring = reactive({ x: 0, y: 0, level: 0, on: false, full: false })
export const bursts = ref<{ key: number; x: number; y: number }[]>([])

let charging = false
let chargeSound: Charge | undefined
let chargeStart = 0
let chargeFrame = 0
let burstKey = 0

function tick() {
  const elapsed = performance.now() - chargeStart
  const level = Math.min(elapsed / CHARGE_MS, 1)
  reticleState.charge = level
  ring.level = level
  // A quick click shouldn't flash the ring, so it only shows once a hold is clearly happening.
  ring.on = elapsed > 140
  ring.full = level >= 1
  if (ring.on && !chargeSound) chargeSound = startCharge()
  if (charging) chargeFrame = requestAnimationFrame(tick)
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
  sound?.fire()
  field.shockwave(ring.x, ring.y)
  if (!reduceMotion) {
    const burst = { key: burstKey++, x: ring.x, y: ring.y }
    bursts.value.push(burst)
    setTimeout(() => {
      bursts.value = bursts.value.filter((b) => b !== burst)
    }, 700)
  }
  unlock('charge')
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
