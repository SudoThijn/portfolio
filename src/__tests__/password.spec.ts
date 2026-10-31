import { describe, expect, it } from 'vitest'
import {
  CHARSET,
  METER_SEGMENTS,
  formatTime,
  inspectPassword,
  randomPassword,
} from '../lib/password'

describe('inspectPassword', () => {
  it('calls a known leaked password leaked, whatever its length says', () => {
    const result = inspectPassword('hunter2')
    expect(result.label).toBe('Leaked')
    expect(result.rank).toBe('critical')
    expect(result.time).toBe('instantly')
    expect(result.bits).toBe(4)
  })

  it('matches leaked passwords case-insensitively', () => {
    expect(inspectPassword('PassWord').label).toBe('Leaked')
  })

  it('caps a single repeated character like a leaked one', () => {
    expect(inspectPassword('aaaaaaaaaaaaaaaa').bits).toBe(4)
  })

  it('counts the character pool per class', () => {
    expect(inspectPassword('abc').pool).toBe(26)
    expect(inspectPassword('aB').pool).toBe(52)
    expect(inspectPassword('aB3').pool).toBe(62)
    expect(inspectPassword('aB3!').pool).toBe(95)
  })

  it('scores an empty password as nothing', () => {
    const result = inspectPassword('')
    expect(result).toMatchObject({ length: 0, pool: 0, bits: 0, filled: 0 })
  })

  it('moves up the ranks as entropy grows', () => {
    expect(inspectPassword('xK9#mQ2$vL7!pR4&').rank).toBe('strong')
    expect(inspectPassword('xK9#mQ2$vL7!pR4&wZ8@nB5%cT3^').rank).toBe('overkill')
  })

  it('fills the meter in steps of ten bits, up to its length', () => {
    expect(inspectPassword('xK9#mQ2$vL7!pR4&wZ8@nB5%cT3^').filled).toBe(METER_SEGMENTS)
  })
})

describe('formatTime', () => {
  it('is instant below a second', () => {
    expect(formatTime(0.4)).toBe('instantly')
  })

  it('picks the largest fitting unit and pluralises', () => {
    expect(formatTime(1)).toBe('in 1 second')
    expect(formatTime(90)).toBe('in 2 minutes')
    expect(formatTime(3600)).toBe('in 1 hour')
    expect(formatTime(86400 * 3)).toBe('in 3 days')
  })

  it('switches to millions of years, then to the end of the universe', () => {
    expect(formatTime(31557600 * 5e6)).toBe('in 5 million years')
    expect(formatTime(31557600 * 2e10)).toBe('after the universe ends')
  })
})

describe('randomPassword', () => {
  it('has the requested length and only uses the charset', () => {
    for (const length of [1, 20, 64]) {
      const pw = randomPassword(length)
      expect(pw).toHaveLength(length)
      expect([...pw].every((c) => CHARSET.includes(c))).toBe(true)
    }
  })

  it('does not repeat itself', () => {
    expect(randomPassword()).not.toBe(randomPassword())
  })
})
