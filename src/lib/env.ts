import { LOCALES, locale, type Locale } from '@/i18n'
import { ageOn } from './age'

export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches

export const pointer = { x: -9999, y: -9999 }

export function trackPointer() {
  addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
    },
    { passive: true },
  )
  document.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = -9999
  })
}

const timeZone = 'Europe/Amsterdam'

export const clockFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
export const minuteFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone,
  hour: '2-digit',
  minute: '2-digit',
})
const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

// The age on today's date in Dronten, like the clock in the HUD.
export function currentAge(now = new Date()) {
  const [year = 0, month = 0, day = 0] = dayFormat
    .formatToParts(now)
    .filter((part) => part.type !== 'literal')
    .map((part) => Number(part.value))
  return ageOn({ year, month, day })
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone,
  dateStyle: 'full',
  timeStyle: 'medium',
}
const DATE_LANGUAGES: Record<Locale, string> = { en: 'en-GB', nl: 'nl-NL' }
const dateFormats = Object.fromEntries(
  LOCALES.map((code) => [code, new Intl.DateTimeFormat(DATE_LANGUAGES[code], DATE_OPTIONS)]),
) as Record<Locale, Intl.DateTimeFormat>

export const formatDate = (date: Date) => dateFormats[locale.value].format(date)
