import { afterEach, describe, expect, it, vi } from 'vitest'
import { en } from '../i18n/en'
import { formatTime, inspectPassword } from '../lib/password'
import { list, locale, setLocale, t } from '../i18n'
import { nl } from '../i18n/nl'

type Key = keyof typeof en
const keys = Object.keys(en) as Key[]

const placeholders = (message: string | readonly string[]) =>
  [
    ...new Set(
      [message].flat().flatMap((text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1])),
    ),
  ]
    .sort()
    .join()

// A text, or a list and its length, so a missing or extra line shows up as a mismatch.
const shape = (message: string | readonly string[]) =>
  typeof message === 'string' ? 'text' : `list of ${message.length}`

afterEach(() => {
  setLocale('en')
  localStorage.clear()
  history.replaceState(null, '', '/')
})

describe('the dictionaries', () => {
  it('define the same keys in both languages', () => {
    expect(Object.keys(nl).sort()).toEqual([...keys].sort())
  })

  it('use the same placeholders in both languages', () => {
    expect(keys.filter((key) => placeholders(nl[key]) !== placeholders(en[key]))).toEqual([])
  })

  it('keep every text a text and every list the same length', () => {
    expect(keys.filter((key) => shape(nl[key]) !== shape(en[key]))).toEqual([])
  })

  it('leave no message empty', () => {
    const empty = [en, nl].flatMap((dictionary) =>
      Object.entries(dictionary).filter(([, message]) => message.length === 0),
    )
    expect(empty).toEqual([])
  })
})

describe('switching language', () => {
  it('starts in English', () => {
    expect(locale.value).toBe('en')
    expect(t('nav.profile')).toBe('Profile')
  })

  it('translates, sets the html lang and remembers the choice', () => {
    setLocale('nl')
    expect(t('nav.profile')).toBe('Profiel')
    expect(document.documentElement.lang).toBe('nl')
    expect(localStorage.getItem('td-lang')).toBe('nl')
  })

  it('saves a choice even when that language is already active', () => {
    setLocale('en')
    expect(localStorage.getItem('td-lang')).toBe('en')
  })

  it('replaces a ?lang= link with the visitor’s own choice', () => {
    history.replaceState(null, '', '/?lang=nl&utm=x')
    setLocale('en')
    expect(location.search).toBe('?utm=x')
    expect(localStorage.getItem('td-lang')).toBe('en')
  })

  it('still drops a ?lang= link when storage is blocked', () => {
    history.replaceState(null, '', '/?lang=nl')
    const blocked = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    setLocale('en')
    blocked.mockRestore()
    expect(location.search).toBe('')
    expect(locale.value).toBe('en')
  })

  it('updates the meta description', () => {
    const meta = document.head.appendChild(document.createElement('meta'))
    meta.name = 'description'
    setLocale('nl')
    expect(meta.content).toBe(nl['meta.description'])
    setLocale('en')
    expect(meta.content).toBe(en['meta.description'])
    meta.remove()
  })

  it('fills placeholders and returns lists', () => {
    setLocale('nl')
    expect(t('lab.bits', { n: 42 })).toBe('42 bits')
    expect(list('term.whoami')).toHaveLength(2)
  })

  it('translates the password verdict and the crack time', () => {
    setLocale('nl')
    expect(inspectPassword('hunter2').label).toBe('Gelekt')
    expect(inspectPassword('hunter2').time).toBe('direct')
    expect(formatTime(1)).toBe('in 1 seconde')
    expect(formatTime(3600 * 5)).toBe('in 5 uur')
  })
})
