import { describe, expect, it } from 'vitest'
import { getMaxDayOfMonth, normalizeBirthInput } from './birthInput'

describe('normalizeBirthInput', () => {
  const baseInput = {
    year: 2026,
    month: 7,
    day: 3,
    hour: 13,
    minute: 30,
    gender: 'male' as const,
    isLunar: false,
    isLeapMonth: false,
  }

  it('accepts real solar dates including leap day', () => {
    expect(normalizeBirthInput({ ...baseInput, year: 2024, month: 2, day: 29 })).toMatchObject({
      year: 2024,
      month: 2,
      day: 29,
    })
  })

  it('rejects impossible solar dates and invalid time values', () => {
    expect(normalizeBirthInput({ ...baseInput, year: 2023, month: 2, day: 29 })).toBeNull()
    expect(normalizeBirthInput({ ...baseInput, month: 4, day: 31 })).toBeNull()
    expect(normalizeBirthInput({ ...baseInput, month: 13 })).toBeNull()
    expect(normalizeBirthInput({ ...baseInput, hour: 24 })).toBeNull()
    expect(normalizeBirthInput({ ...baseInput, minute: 60 })).toBeNull()
  })

  it('limits lunar dates to the broad 30-day range before engine-level validation', () => {
    expect(normalizeBirthInput({ ...baseInput, isLunar: true, day: 30 })).toMatchObject({
      isLunar: true,
      day: 30,
    })
    expect(normalizeBirthInput({ ...baseInput, isLunar: true, day: 31 })).toBeNull()
  })

  it('normalizes day boundary settings for advanced time rules', () => {
    expect(normalizeBirthInput({ ...baseInput, dayBoundary: 'jasi' })).toMatchObject({
      dayBoundary: 'jasi',
    })
    expect(normalizeBirthInput({ ...baseInput, dayBoundary: 'splitJasi' })).toMatchObject({
      dayBoundary: 'splitJasi',
    })
    expect(normalizeBirthInput({ ...baseInput, dayBoundary: 'unknown' as never })).toMatchObject({
      dayBoundary: 'midnight',
    })
  })
})

describe('getMaxDayOfMonth', () => {
  it('uses real solar month lengths', () => {
    expect(getMaxDayOfMonth(2024, 2, false)).toBe(29)
    expect(getMaxDayOfMonth(2023, 2, false)).toBe(28)
    expect(getMaxDayOfMonth(2026, 4, false)).toBe(30)
  })
})
