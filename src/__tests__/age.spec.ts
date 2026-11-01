import { describe, expect, it } from 'vitest'
import { ageOn } from '../lib/age'

describe('ageOn', () => {
  it('goes up on the birthday itself, not before', () => {
    expect(ageOn({ year: 2026, month: 10, day: 6 })).toBe(22)
    expect(ageOn({ year: 2026, month: 10, day: 7 })).toBe(23)
    expect(ageOn({ year: 2027, month: 10, day: 6 })).toBe(23)
    expect(ageOn({ year: 2027, month: 10, day: 7 })).toBe(24)
  })

  it('stays the same through the rest of the year', () => {
    expect(ageOn({ year: 2026, month: 11, day: 1 })).toBe(23)
    expect(ageOn({ year: 2026, month: 12, day: 31 })).toBe(23)
    expect(ageOn({ year: 2027, month: 1, day: 1 })).toBe(23)
  })
})
