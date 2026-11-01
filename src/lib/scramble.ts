import { reduceMotion } from './env'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>=+'
const frames = new WeakMap<HTMLElement, number>()

// Stops a running scramble and shows the target text straight away.
export function settle(el: HTMLElement) {
  cancelAnimationFrame(frames.get(el) ?? 0)
  el.textContent = el.dataset.text ?? el.textContent ?? ''
}

export function scramble(el: HTMLElement, duration = 900) {
  const target = el.dataset.text ?? el.textContent ?? ''
  el.dataset.text = target
  if (reduceMotion) return
  const start = performance.now()
  cancelAnimationFrame(frames.get(el) ?? 0)
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const settled = Math.floor(progress * target.length)
    let out = target.slice(0, settled)
    for (let i = settled; i < target.length; i++) {
      out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
    }
    el.textContent = out
    if (progress < 1) frames.set(el, requestAnimationFrame(tick))
  }
  frames.set(el, requestAnimationFrame(tick))
}
