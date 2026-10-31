import { ref } from 'vue'
import bedUrl from '@/assets/audio/bed-hum.ogg'
import chargeFireUrl from '@/assets/audio/charge-fire.ogg'
import chargeLoopUrl from '@/assets/audio/charge-loop.ogg'
import chargeStartUrl from '@/assets/audio/charge-start.ogg'
import levelUpUrl from '@/assets/audio/level-up.ogg'
import overdriveUrl from '@/assets/audio/overdrive-music.ogg'
import popupCloseUrl from '@/assets/audio/popup-close.ogg'
import popupOpenUrl from '@/assets/audio/popup-open.ogg'
import warpUrl from '@/assets/audio/warp.ogg'

// Levels were picked by ear on a sound board, so they are relative to each other.
const MASTER = 0.6
const BED = 0.18
const FADE = 0.4
const CHARGE_OVERLAP = 0.5
const CHARGE_FIZZLE = 0.15
const STORE_KEY = 'td-sound'

function readPreference() {
  try {
    return localStorage.getItem(STORE_KEY) === 'on'
  } catch {
    return false
  }
}

function writePreference(on: boolean) {
  try {
    localStorage.setItem(STORE_KEY, on ? 'on' : 'off')
  } catch {
    // Storage can be unavailable, in which case the choice only lasts for this visit.
  }
}

export const soundOn = ref(readPreference())

interface Engine {
  ctx: AudioContext
  out: GainNode
}

let engine: Engine | undefined
// Browsers only start audio after a gesture, so a saved "on" waits for the first one.
let unlocked = false
let overdriveWanted = false

const enabled = () => soundOn.value && unlocked

// Nothing is created, fetched or decoded until sound has been switched on.
function getEngine(): Engine {
  if (!engine) {
    const ctx = new AudioContext()
    const out = ctx.createGain()
    out.gain.value = MASTER
    out.connect(ctx.destination)
    engine = { ctx, out }
  }
  return engine
}

const buffers = new Map<string, Promise<AudioBuffer>>()

function load(url: string) {
  let buffer = buffers.get(url)
  if (!buffer) {
    const { ctx } = getEngine()
    buffer = fetch(url)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .catch((error: unknown) => {
        buffers.delete(url)
        throw error
      })
    buffers.set(url, buffer)
  }
  return buffer
}

function gainInto(level: number) {
  const { ctx, out } = getEngine()
  const gain = ctx.createGain()
  gain.gain.value = level
  gain.connect(out)
  return gain
}

// Both clocks are the audio clock, which is what keeps a start sample and its loop gapless.
function play(buffer: AudioBuffer, destination: AudioNode, when: number, loop = false) {
  const source = getEngine().ctx.createBufferSource()
  source.buffer = buffer
  source.loop = loop
  source.connect(destination)
  source.start(when)
  return source
}

function fadeOut(gain: GainNode, sources: AudioBufferSourceNode[], seconds: number) {
  const now = getEngine().ctx.currentTime
  gain.gain.cancelScheduledValues(now)
  gain.gain.setValueAtTime(gain.gain.value, now)
  gain.gain.linearRampToValueAtTime(0, now + seconds)
  for (const source of sources) source.stop(now + seconds + 0.05)
}

// A looping sound that follows a condition: it fades in when wanted and out when not.
function createLoop(url: string, level: number, wanted: () => boolean) {
  let running: { gain: GainNode; source: AudioBufferSourceNode } | undefined
  let loading = false

  return async function sync() {
    if (!wanted()) {
      if (running) {
        fadeOut(running.gain, [running.source], FADE)
        running = undefined
      }
      return
    }
    if (running || loading) return
    loading = true
    let buffer: AudioBuffer
    try {
      buffer = await load(url)
    } catch {
      return
    } finally {
      loading = false
    }
    if (!wanted() || running) return
    const { ctx } = getEngine()
    const gain = gainInto(0)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(level, ctx.currentTime + FADE)
    running = { gain, source: play(buffer, gain, ctx.currentTime, true) }
  }
}

const syncBed = createLoop(bedUrl, BED, enabled)
const syncMusic = createLoop(overdriveUrl, 1, () => enabled() && overdriveWanted)

function syncAll() {
  void syncBed()
  void syncMusic()
}

function unlock() {
  unlocked = true
  void getEngine().ctx.resume()
  syncAll()
}

export function toggleSound() {
  soundOn.value = !soundOn.value
  writePreference(soundOn.value)
  if (soundOn.value) {
    unlock()
    return
  }
  syncAll()
  setTimeout(
    () => {
      if (!soundOn.value) void engine?.ctx.suspend()
    },
    FADE * 1000 + 100,
  )
}

export function overdriveMusic(on: boolean) {
  overdriveWanted = on
  void syncMusic()
}

async function playOnce(url: string) {
  if (!enabled()) return
  try {
    const buffer = await load(url)
    if (enabled()) play(buffer, gainInto(1), getEngine().ctx.currentTime)
  } catch {
    // A sound that fails to load is skipped.
  }
}

export const playLevelUp = () => playOnce(levelUpUrl)
export const playWarp = () => playOnce(warpUrl)
export const playPopup = (open: boolean) => playOnce(open ? popupOpenUrl : popupCloseUrl)

export interface Charge {
  fire(): void
  cancel(): void
}

const silentCharge: Charge = { fire() {}, cancel() {} }

// Hold: the start sample leads into the loop. Release: the shot fires while the charge fades out
// underneath it. A release without a shot lets the charge die away quickly.
export function startCharge(): Charge {
  if (!enabled()) return silentCharge
  const ready = Promise.all([load(chargeStartUrl), load(chargeLoopUrl), load(chargeFireUrl)])
  let running: { gain: GainNode; sources: AudioBufferSourceNode[] } | undefined
  let released = false

  ready
    .then(([start, loop]) => {
      if (released) return
      const gain = gainInto(1)
      const at = getEngine().ctx.currentTime + 0.03
      running = {
        gain,
        sources: [play(start, gain, at), play(loop, gain, at + start.duration, true)],
      }
    })
    .catch(() => {})

  const stop = (seconds: number) => {
    released = true
    if (running) fadeOut(running.gain, running.sources, seconds)
  }

  return {
    fire() {
      stop(CHARGE_OVERLAP)
      ready
        .then(([, , shot]) => {
          if (enabled()) play(shot, gainInto(1), getEngine().ctx.currentTime)
        })
        .catch(() => {})
    },
    cancel() {
      stop(CHARGE_FIZZLE)
    },
  }
}

export function initSound() {
  if (soundOn.value) {
    const arm = () => {
      removeEventListener('pointerup', arm)
      removeEventListener('keydown', arm)
      unlock()
    }
    addEventListener('pointerup', arm)
    addEventListener('keydown', arm)
  }
  document.addEventListener('visibilitychange', () => {
    if (!engine) return
    if (document.hidden) void engine.ctx.suspend()
    else if (enabled()) void engine.ctx.resume()
  })
}
