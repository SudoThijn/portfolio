import { ref } from 'vue'
import { en } from './en'
import { nl } from './nl'

export type Locale = 'en' | 'nl'
export type MessageKey = keyof typeof en
type Params = Record<string, string | number>

export const LOCALES: readonly Locale[] = ['en', 'nl']

const STORE_KEY = 'td-lang'
const messages: Record<Locale, Record<MessageKey, string | readonly string[]>> = { en, nl }
const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)

// A ?lang= link wins over the saved choice, so a Dutch link can be shared. English is the default.
function initialLocale(): Locale {
  try {
    const fromUrl = new URLSearchParams(location.search).get('lang')
    if (isLocale(fromUrl)) return fromUrl
    const stored = localStorage.getItem(STORE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // Storage can be unavailable, in which case the default applies.
  }
  return 'en'
}

export const locale = ref<Locale>(initialLocale())

export function t(key: MessageKey, params?: Params): string {
  const message = messages[locale.value][key]
  const text = typeof message === 'string' ? message : message.join('\n')
  return params ? text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? '')) : text
}

export function list(key: MessageKey): string[] {
  const message = messages[locale.value][key]
  return typeof message === 'string' ? [message] : [...message]
}

// Text that is either shown as it is, like a name, or looked up in the dictionary.
export type Label = string | { key: MessageKey }
export const label = (value: Label) => (typeof value === 'string' ? value : t(value.key))

export const formatNumber = (n: number) => n.toLocaleString(locale.value)

function applyToDocument() {
  document.documentElement.lang = locale.value
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'))
}

// Picking a language is a deliberate choice, so it is saved even when it is already the active one,
// and it replaces a ?lang= link, which would otherwise win again on the next reload.
export function setLocale(next: Locale) {
  if (next !== locale.value) {
    locale.value = next
    applyToDocument()
  }
  // Blocked storage must not leave the ?lang= link in place, so the link goes first and on its own.
  try {
    const url = new URL(location.href)
    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang')
      history.replaceState(history.state, '', url)
    }
  } catch {
    // The link then stays in the address bar.
  }
  try {
    localStorage.setItem(STORE_KEY, next)
  } catch {
    // The choice then only lasts for this visit.
  }
}

applyToDocument()
