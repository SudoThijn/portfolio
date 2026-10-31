import { ref } from 'vue'
import { finePointer, minuteFormat, reduceMotion } from '@/lib/env'
import { field } from '@/lib/field'
import { scramble } from '@/lib/scramble'
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

let levelLabel: HTMLElement | null = null
let statusLabel: HTMLElement | null = null
const originals = { level: '', status: '' }

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
  if (statusLabel) {
    statusLabel.textContent = on
      ? `Overdrive active${finePointer ? ' · Esc to exit' : ''}`
      : originals.status
  }
  if (levelLabel) {
    levelLabel.textContent = on ? 'LV.99' : originals.level
    delete levelLabel.dataset.text
    scramble(levelLabel, 700)
  }
}

function enterOverdrive() {
  if (overdrive.value) return
  if (leet) exitLeet()
  if (reduceMotion) {
    setOverdrive(true)
    unlock('overdrive')
    return
  }
  cutinRun.value++
  cutinPlaying.value = true
  root.classList.add('od-shake')
  // The palette swaps while the band covers the screen, so the change lands as a reveal.
  setTimeout(() => setOverdrive(true), 520)
  setTimeout(() => root.classList.remove('od-shake'), 650)
  setTimeout(() => {
    cutinPlaying.value = false
    unlock('overdrive')
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

type TextEntry = [Text, string]

let nameLines: HTMLElement[] = []
let leet = false
let leetNodes: TextEntry[] = []
let leetTimer = 0
// Pending sweep steps, and the values an unfinished exit sweep still has to put back.
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

// Applies each change with a delay based on its height on screen, so it reads as a scan wave moving down.
function sweep(entries: TextEntry[]) {
  for (const [node, value] of entries) {
    const top = node.parentElement?.getBoundingClientRect().top ?? 0
    const delay = reduceMotion ? 0 : Math.max(0, Math.min(1, top / innerHeight)) * LEET_SWEEP_MS
    if (delay === 0) node.nodeValue = value
    else sweepTimers.push(window.setTimeout(() => (node.nodeValue = value), delay))
  }
}

function flushSweep() {
  sweepTimers.forEach(clearTimeout)
  sweepTimers = []
  for (const [node, value] of restoreList) node.nodeValue = value
  restoreList = []
}

export function enterLeet() {
  if (leet) return
  if (overdrive.value) setOverdrive(false)
  flushSweep()
  leet = true
  leetNodes = textNodes().map((node): TextEntry => [node, node.nodeValue ?? ''])
  sweep(leetNodes.map(([node, value]): TextEntry => [node, toLeet(value)]))
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

export function exitLeet() {
  if (!leet) return
  leet = false
  clearTimeout(leetTimer)
  sweepTimers.forEach(clearTimeout)
  sweepTimers = []
  restoreList = leetNodes
  leetNodes = []
  sweep(restoreList)
  sweepTimers.push(window.setTimeout(flushSweep, LEET_SWEEP_MS + 50))
  nameLines.forEach((el, i) => {
    el.dataset.text = el.dataset.original
    scramble(el, 500 + i * 150)
  })
  root.classList.remove('leet')
  field.setMode('normal')
}

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
  levelLabel = document.querySelector<HTMLElement>('.hero__tags .block--magenta > span')
  statusLabel = document.querySelector<HTMLElement>('.status__text')
  originals.level = levelLabel?.textContent ?? ''
  originals.status = statusLabel?.textContent ?? ''
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
    if (isLeetMinute && !leetMinuteFired) enterLeet()
    leetMinuteFired = isLeetMinute
  }, 1000)
}
