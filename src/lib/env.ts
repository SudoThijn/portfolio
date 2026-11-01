import { LOCALES, locale, type Locale } from '@/i18n'

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
