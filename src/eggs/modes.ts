import { nextTick, ref, watch } from 'vue'
import { locale } from '@/i18n'
import { minuteFormat, reduceMotion } from '@/lib/env'
import { field } from '@/lib/field'
import { scramble, settle } from '@/lib/scramble'
import { overdriveMusic, playWarp } from '@/lib/sound'
import { unlock } from './secrets'

const root = document.documentElement

/* ---------- Konami code: OVERDRIVE ---------- */

const KONAMI = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
]
let konamiPos = 0

export const overdrive = ref(false)
export const cutinRun = ref(0)
export const cutinPlaying = ref(false)

export function feedKonami(key: string) {
  if (key === KONAMI[konamiPos]) konamiPos++
  // A third "up" keeps the sequence alive instead of resetting it.
  else konamiPos = key === 'arrowup' ? (konamiPos === 2 ? 2 : 1) : 0
  if (konamiPos === KONAMI.length) {
    konamiPos = 0
    enterOverdrive()
  }
}

export function setOverdrive(on: boolean) {
  overdrive.value = on
  root.classList.toggle('overdrive', on)
  field.setMode(on ? 'overdrive' : 'normal')
  overdriveMusic(on)
}

function enterOverdrive() {
  if (overdrive.value) return
  if (leet) exitLeet()
  if (reduceMotion) {
    setOverdrive(true)
    unlock('overdrive')
    return
  }
  // The song starts with the code, while the palette swap below waits for the band.
  overdriveMusic(true)
  cutinRun.value++
  cutinPlaying.value = true
  root.classList.add('od-shake')
  // The palette swaps while the band covers the screen, so the change lands as a reveal.
  setTimeout(() => setOverdrive(true), 520)
  setTimeout(() => root.classList.remove('od-shake'), 650)
  setTimeout(() => {
    cutinPlaying.value = false
    unlock('overdrive')
    if (leetQueued) {
      leetQueued = false
      enterLeet()
    }
  }, 1900)
}

/* ---------- LEET mode: 13:37 in Dronten, five clicks on the clock, or "1337" in the terminal ---------- */

const LEET_MAP: Record<string, string> = {
  a: '4',
  e: '3',
  i: '1',
  o: '0',
  t: '7',
  s: '5',
  g: '6',
  b: '8',
  r: '2',
}
const LEET_MS = 13370
const LEET_ROOTS = '.hud__nav, .hud__place, main, .footer'
const LEET_SWEEP_MS = 700
const toLeet = (text: string) =>
  text.replace(/[aeiotsgbr]/gi, (c) => LEET_MAP[c.toLowerCase()] ?? c)

interface TextEntry {
  node: Text
  plain: string
  leet: string
}

let nameLines: HTMLElement[] = []
let leet = false
let leetQueued = false
let leetNodes: TextEntry[] = []
let leetTimer = 0
// Pending sweep steps, and the nodes an unfinished exit sweep still has to put back.
let sweepTimers: number[] = []
let restoreList: TextEntry[] = []

export const isLeet = () => leet

function textNodes() {
  const nodes: Text[] = []
  for (const section of document.querySelectorAll(LEET_ROOTS)) {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        !node.nodeValue?.trim() || node.parentElement?.closest('[data-scramble], script, style')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    })
    while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  }
  return nodes
}

// A node is only rewritten while it still holds the text LEET last gave it.
// Vue renders reactive text into these same nodes, and whatever it wrote since must stay.
function rewrite({ node, plain, leet: leeted }: TextEntry, toLeetspeak: boolean) {
  const [from, to] = toLeetspeak ? [plain, leeted] : [leeted, plain]
  if (node.nodeValue === from) node.nodeValue = to
}

// Applies each change with a delay based on its height on screen, so it reads as a scan wave moving down.
function sweep(entries: TextEntry[], toLeetspeak: boolean) {
  for (const entry of entries) {
    const top = entry.node.parentElement?.getBoundingClientRect().top ?? 0
    const delay = reduceMotion ? 0 : Math.max(0, Math.min(1, top / innerHeight)) * LEET_SWEEP_MS
    if (delay === 0) rewrite(entry, toLeetspeak)
    else sweepTimers.push(window.setTimeout(() => rewrite(entry, toLeetspeak), delay))
  }
}

function flushSweep() {
  sweepTimers.forEach(clearTimeout)
  sweepTimers = []
  for (const entry of restoreList) rewrite(entry, false)
  restoreList = []
}

export function enterLeet() {
  if (leet) return
  // The OVERDRIVE band owns the screen until it is done, so LEET waits for it and then replaces it.
  if (cutinPlaying.value) {
    leetQueued = true
    return
  }
  leet = true
  const wasOverdrive = overdrive.value
  if (wasOverdrive) setOverdrive(false)
  // Leaving overdrive changes the status line on Vue's next render, and LEET has to read that text.
  if (wasOverdrive) void nextTick(beginLeet)
  else beginLeet()
}

function beginLeet() {
  if (!leet) return
  flushSweep()
  leetNodes = textNodes().map((node) => {
    const plain = node.nodeValue ?? ''
    return { node, plain, leet: toLeet(plain) }
  })
  sweep(leetNodes, true)
  nameLines.forEach((el, i) => {
    el.dataset.original ??= el.dataset.text ?? el.textContent ?? ''
    el.dataset.text = toLeet(el.dataset.original)
    scramble(el, 500 + i * 150)
  })
  root.classList.add('leet')
  if (!reduceMotion) {
    root.classList.add('leet-glitch')
    setTimeout(() => root.classList.remove('leet-glitch'), 500)
  }
  field.setMode('leet')
  void playWarp()
  unlock('leet')
  leetTimer = window.setTimeout(exitLeet, LEET_MS)
}

// With `immediate` the text is put back at once instead of through the scan wave.
export function exitLeet({ immediate = false } = {}) {
  if (!leet) {
    if (immediate) flushSweep()
    return
  }
  leet = false
  clearTimeout(leetTimer)
  sweepTimers.forEach(clearTimeout)
  sweepTimers = []
  restoreList = leetNodes
  leetNodes = []
  if (immediate) {
    flushSweep()
  } else {
    sweep(restoreList, false)
    sweepTimers.push(window.setTimeout(flushSweep, LEET_SWEEP_MS + 50))
  }
  nameLines.forEach((el, i) => {
    // Without a saved original, LEET ended before it began and there is nothing to put back.
    if (el.dataset.original === undefined) return
    el.dataset.text = el.dataset.original
    if (immediate) settle(el)
    else scramble(el, 500 + i * 150)
  })
  root.classList.remove('leet')
  field.setMode('normal')
}

// A language change ends LEET on the spot, so no leetspeak is left on text that is about to change.
watch(locale, () => exitLeet({ immediate: true }), { flush: 'sync' })

let clockClicks: number[] = []

export function clockPressed() {
  const now = Date.now()
  clockClicks = clockClicks.filter((t) => now - t < 2000).concat(now)
  if (clockClicks.length >= 5) {
    clockClicks = []
    enterLeet()
  }
}

/* ---------- Setup ---------- */

export function initModes() {
  nameLines = [...document.querySelectorAll<HTMLElement>('[data-scramble]')]

  // On touch screens the code is swipes for the arrows, then two taps for B and A.
  let touchStart: { x: number; y: number } | null = null
  addEventListener(
    'touchstart',
    (e) => {
      const touch = e.touches[0]
      if (touch) touchStart = { x: touch.clientX, y: touch.clientY }
    },
    { passive: true },
  )
  addEventListener(
    'touchend',
    (e) => {
      const touch = e.changedTouches[0]
      if (!touchStart || !touch) return
      const dx = touch.clientX - touchStart.x
      const dy = touch.clientY - touchStart.y
      touchStart = null
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 12)
        feedKonami(konamiPos >= 8 ? (KONAMI[konamiPos] ?? 'tap') : 'tap')
      else if (Math.abs(dx) > Math.abs(dy)) feedKonami(dx > 0 ? 'arrowright' : 'arrowleft')
      else feedKonami(dy > 0 ? 'arrowdown' : 'arrowup')
    },
    { passive: true },
  )

  let leetMinuteFired = false
  setInterval(() => {
    const isLeetMinute = minuteFormat.format(new Date()) === '13:37'
    // A hidden tab has throttled timers and a suspended audio engine, so LEET would only surface later.
    if (isLeetMinute && !leetMinuteFired && !document.hidden) enterLeet()
    leetMinuteFired = isLeetMinute
  }, 1000)
}
