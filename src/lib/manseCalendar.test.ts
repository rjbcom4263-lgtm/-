import { describe, expect, it } from 'vitest'
import { buildManseCalendarMonth } from './manseCalendar'

describe('buildManseCalendarMonth', () => {
  it('builds a six-week month grid with daily saju calendar data', () => {
    const calendar = buildManseCalendarMonth(2026, 7)
    const currentMonthDays = calendar.days.filter((day) => day.isCurrentMonth)

    expect(calendar.year).toBe(2026)
    expect(calendar.month).toBe(7)
    expect(calendar.days).toHaveLength(42)
    expect(currentMonthDays).toHaveLength(31)
    expect(currentMonthDays[0]).toMatchObject({
      date: '2026-07-01',
      day: 1,
      weekday: 3,
      isCurrentMonth: true,
    })
    expect(currentMonthDays.every((day) => day.dayGanji.length > 0)).toBe(true)
    expect(currentMonthDays.every((day) => day.lunarLabel.length > 0)).toBe(true)
  })

  it('keeps solar terms on Korean calendar dates', () => {
    const julyTerms = buildManseCalendarMonth(2026, 7).days
      .filter((day) => day.isCurrentMonth && day.solarTerm)
      .map((day) => ({ date: day.date, solarTerm: day.solarTerm }))
    const februaryTerms = buildManseCalendarMonth(2026, 2).days
      .filter((day) => day.isCurrentMonth && day.solarTerm)
      .map((day) => ({ date: day.date, solarTerm: day.solarTerm }))
    const decemberTerms = buildManseCalendarMonth(2026, 12).days
      .filter((day) => day.isCurrentMonth && day.solarTerm)
      .map((day) => ({ date: day.date, solarTerm: day.solarTerm }))

    expect(februaryTerms).toEqual([
      { date: '2026-02-04', solarTerm: '입춘' },
      { date: '2026-02-19', solarTerm: '우수' },
    ])
    expect(julyTerms).toEqual([
      { date: '2026-07-07', solarTerm: '소서' },
      { date: '2026-07-23', solarTerm: '대서' },
    ])
    expect(decemberTerms).toEqual([
      { date: '2026-12-07', solarTerm: '대설' },
      { date: '2026-12-22', solarTerm: '동지' },
    ])
  })
})
