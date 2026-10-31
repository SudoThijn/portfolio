import { pointer, reduceMotion } from './env'

export type FieldMode = 'normal' | 'overdrive' | 'leet'

interface Palette {
  base: string
  far: string
  mid: string
  hot: string
  scan: string
  wave: string
  scanPeriod: number
  rain?: boolean
}

const PALETTES: Record<FieldMode, Palette> = {
  normal: {
    base: '#2a2542',
    far: '#4a4370',
    mid: '#2de2ff',
    hot: '#ff2d7a',
    scan: '#5b5320',
    wave: '#fcee0a',
    scanPeriod: 7000,
  },
  overdrive: {
    base: '#3a1a24',
    far: '#6b2a3a',
    mid: '#ffb800',
    hot: '#ff2a3d',
    scan: '#7a1f2c',
    wave: '#ffb800',
    scanPeriod: 1800,
  },
  leet: {
    base: '#123a20',
    far: '#1f6b3a',
    mid: '#3dff7a',
    hot: '#b6ffcf',
    scan: '#1f8a45',
    wave: '#3dff7a',
    scanPeriod: 2500,
    rain: true,
  },
}

const GAP = 30
const RADIUS = 170
const WAVE_MS = 900
const RAIN_GLYPHS = '0123456789ABCDEF1337#$%&<>'
const RAIN_SIZE = 16
const RAIN_TRAIL = 14

interface Dot {
  x: number
  y: number
}
interface Wave extends Dot {
  start: number
}
interface RainColumn {
  x: number
  y: number
  speed: number
  seed: number
}

// The eggs drive the field from outside the component tree, so they talk to this handle.
// It does nothing until a canvas is mounted.
let active: { setMode(mode: FieldMode): void; shockwave(x: number, y: number): void } | null = null

export const field = {
  setMode: (mode: FieldMode) => active?.setMode(mode),
  shockwave: (x: number, y: number) => active?.shockwave(x, y),
}

export function mountField(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  let width = 0
  let height = 0
  let dots: Dot[] = []
  let columns: RainColumn[] = []
  let palette = PALETTES.normal
  let lastTime = 0
  let frame = 0
  const waves: Wave[] = []

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    width = innerWidth
    height = innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    dots = []
    for (let y = GAP / 2; y < height; y += GAP) {
      for (let x = GAP / 2; x < width; x += GAP) dots.push({ x, y })
    }
    columns = []
    for (let x = RAIN_SIZE; x < width; x += RAIN_SIZE * 1.5) {
      columns.push({
        x,
        y: Math.random() * height,
        speed: 90 + Math.random() * 170,
        seed: Math.floor(Math.random() * 97),
      })
    }
  }

  // Digital rain for LEET mode: each column is a bright head glyph with a fading trail.
  function drawRain(dt: number) {
    const c2d = ctx!
    c2d.font = `600 ${RAIN_SIZE - 3}px "JetBrains Mono", monospace`
    c2d.textAlign = 'center'
    for (const c of columns) {
      c.y += c.speed * dt
      if (c.y - RAIN_TRAIL * RAIN_SIZE > height) {
        c.y = -Math.random() * height * 0.4
        c.speed = 90 + Math.random() * 170
      }
      for (let k = 0; k < RAIN_TRAIL; k++) {
        const y = c.y - k * RAIN_SIZE
        if (y < -RAIN_SIZE || y > height + RAIN_SIZE) continue
        const row = Math.floor(y / RAIN_SIZE)
        const glyph =
          RAIN_GLYPHS[
            (((c.seed + row * 31) % RAIN_GLYPHS.length) + RAIN_GLYPHS.length) % RAIN_GLYPHS.length
          ]
        c2d.globalAlpha = k === 0 ? 0.95 : (1 - k / RAIN_TRAIL) * 0.45
        c2d.fillStyle = k === 0 ? palette.hot : palette.mid
        c2d.fillText(glyph ?? '', c.x, y)
      }
    }
    c2d.globalAlpha = 1
  }

  function draw(time: number) {
    const c2d = ctx!
    c2d.clearRect(0, 0, width, height)
    // A slow scan line sweeps down the screen, lighting the dots it passes.
    const scanY = ((time / palette.scanPeriod) % 1.3) * height * 1.3 - height * 0.15
    while (waves.length && time - waves[0]!.start > WAVE_MS) waves.shift()
    const waveReach = Math.hypot(width, height)
    for (const d of dots) {
      const dx = d.x - pointer.x
      const dy = d.y - pointer.y
      const dist = Math.hypot(dx, dy)
      let x = d.x
      let y = d.y
      let size = 1.2
      let color = palette.base
      if (dist < RADIUS) {
        const f = 1 - dist / RADIUS
        const push = f * f * 16
        x += (dx / (dist || 1)) * push
        y += (dy / (dist || 1)) * push
        size = 1.2 + f * 1.8
        color = f > 0.72 ? palette.hot : f > 0.3 ? palette.mid : palette.far
      } else if (Math.abs(d.y - scanY) < GAP * 0.6) {
        color = palette.scan
        size = 1.6
      }
      for (const w of waves) {
        const age = (time - w.start) / WAVE_MS
        const wx = d.x - w.x
        const wy = d.y - w.y
        const wd = Math.hypot(wx, wy) || 1
        const off = Math.abs(wd - age * waveReach * 0.6)
        if (off < 60) {
          const f = (1 - off / 60) * (1 - age)
          x += (wx / wd) * f * 28
          y += (wy / wd) * f * 28
          size += f * 2.4
          if (f > 0.15) color = palette.wave
        }
      }
      c2d.fillStyle = color
      c2d.fillRect(x - size / 2, y - size / 2, size, size)
    }
    const dt = Math.max(0, Math.min((time - lastTime) / 1000, 0.1))
    lastTime = time
    if (palette.rain) drawRain(dt)
  }

  function loop(time: number) {
    draw(time)
    frame = requestAnimationFrame(loop)
  }

  const onResize = () => {
    resize()
    if (reduceMotion) draw(0)
  }
  const onVisibility = () => {
    cancelAnimationFrame(frame)
    if (!document.hidden) frame = requestAnimationFrame(loop)
  }

  active = {
    setMode(mode) {
      palette = PALETTES[mode]
      if (reduceMotion) draw(0)
    },
    shockwave(x, y) {
      waves.push({ x, y, start: performance.now() })
    },
  }

  resize()
  addEventListener('resize', onResize)
  if (reduceMotion) {
    draw(0)
  } else {
    frame = requestAnimationFrame(loop)
    document.addEventListener('visibilitychange', onVisibility)
  }

  return () => {
    cancelAnimationFrame(frame)
    removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
    active = null
  }
}
