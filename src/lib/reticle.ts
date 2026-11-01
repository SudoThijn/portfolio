import { finePointer, pointer, reduceMotion } from './env'
import { playLockOn } from './sound'

export const CLIP_SIZE = 3

// Set by the charge-shot egg: charge is 0 when idle and 1 when fully charged. In overdrive the
// clip holds a few shots, and the cooldown runs from 0 after a shot to 1 when the clip is full.
export const reticleState = { charge: 0, ammo: CLIP_SIZE, cooldown: 1 }

const LOCKABLE = 'a, button, input, .stat, .block--chip'
const IDLE = 28

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function mountReticle(reticle: HTMLElement): () => void {
  if (!finePointer || reduceMotion) return () => {}

  const box = { x: -100, y: -100, w: IDLE, h: IDLE }
  let lockTarget: Element | null = null
  let frame = 0
  let shownAmmo = -1

  const onOver = (e: Event) => {
    const target = (e.target as Element).closest(LOCKABLE)
    if (target && target !== lockTarget && !reticleState.charge) void playLockOn()
    lockTarget = target
    reticle.classList.toggle('is-locked', !!lockTarget)
  }
  const onLeave = () => reticle.classList.remove('is-on')
  const onMove = () => reticle.classList.add('is-on')

  function follow() {
    const size = IDLE * (1 - reticleState.charge * 0.5)
    let tx = pointer.x - size / 2
    let ty = pointer.y - size / 2
    let tw = size
    let th = size
    if (lockTarget && !reticleState.charge) {
      const r = lockTarget.getBoundingClientRect()
      tx = r.left - 6
      ty = r.top - 6
      tw = r.width + 12
      th = r.height + 12
    }
    box.x = lerp(box.x, tx, 0.25)
    box.y = lerp(box.y, ty, 0.25)
    box.w = lerp(box.w, tw, 0.25)
    box.h = lerp(box.h, th, 0.25)
    reticle.style.transform = `translate(${box.x}px, ${box.y}px)`
    reticle.style.width = `${box.w}px`
    reticle.style.height = `${box.h}px`
    reticle.style.setProperty('--charge', String(reticleState.charge))
    reticle.classList.toggle('is-charging', reticleState.charge > 0.1)
    reticle.classList.toggle('is-full', reticleState.charge >= 1)
    reticle.style.setProperty('--cool', String(reticleState.cooldown))
    if (reticleState.ammo !== shownAmmo) {
      shownAmmo = reticleState.ammo
      reticle.dataset.ammo = String(shownAmmo)
      reticle.classList.toggle('is-overheated', shownAmmo <= 0)
    }
    frame = requestAnimationFrame(follow)
  }

  document.addEventListener('pointerover', onOver)
  document.addEventListener('pointerleave', onLeave)
  addEventListener('pointermove', onMove, { passive: true })
  frame = requestAnimationFrame(follow)

  return () => {
    cancelAnimationFrame(frame)
    document.removeEventListener('pointerover', onOver)
    document.removeEventListener('pointerleave', onLeave)
    removeEventListener('pointermove', onMove)
  }
}
