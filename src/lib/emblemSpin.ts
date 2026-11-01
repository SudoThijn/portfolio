import { reduceMotion } from './env'

const OVERDRIVE_PERIOD = 4
// Time constant of the speed change, so a ring is most of the way to its new speed after about 1.5 s.
const EASE = 0.5
// A long gap, such as a hidden tab, must not turn into one big step.
const MAX_STEP = 0.1

interface Ring {
  el: SVGGElement
  // Seconds per turn, negative for anticlockwise.
  period: number
  angle: number
  speed: number
}

const speedFor = (period: number, fast: boolean) =>
  360 / (fast ? Math.sign(period) * OVERDRIVE_PERIOD : period)

// The rings turn at a speed that eases towards its target. A CSS animation cannot do this: changing
// its duration keeps the progress through the turn, so the ring jumps to another angle.
export function mountEmblemSpin(rings: SVGGElement[], fast: () => boolean): () => void {
  if (reduceMotion || !rings.length) return () => {}

  const state: Ring[] = rings.map((el) => {
    const period = Number(el.dataset.period)
    return { el, period, angle: 0, speed: speedFor(period, false) }
  })
  let visible = true
  let last = performance.now()
  let frame = 0

  function tick(now: number) {
    const dt = Math.min((now - last) / 1000, MAX_STEP)
    last = now
    if (visible) {
      const blend = 1 - Math.exp(-dt / EASE)
      const target = fast()
      for (const ring of state) {
        ring.speed += (speedFor(ring.period, target) - ring.speed) * blend
        ring.angle = (ring.angle + ring.speed * dt) % 360
        ring.el.style.transform = `rotate(${ring.angle}deg)`
      }
    }
    frame = requestAnimationFrame(tick)
  }

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
  })
  const svg = rings[0]?.ownerSVGElement
  if (svg) observer.observe(svg)
  frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
  }
}
