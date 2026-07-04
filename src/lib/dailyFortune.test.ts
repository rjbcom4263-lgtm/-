import { describe, expect, it } from 'vitest'
import { buildDailyFortuneReading, buildPeriodFortuneReading } from './dailyFortune'
import { buildManseCalendarMonth } from './manseCalendar'
import { calculateSajuChart } from './sajuEngine'

describe('buildDailyFortuneReading', () => {
  it('summarizes the selected daily fortune from the natal chart and calendar day', () => {
    const chart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })
    const calendar = buildManseCalendarMonth(2026, 7)
    const day = calendar.days.find((item) => item.date === '2026-07-02')

    expect(day).toBeDefined()

    const reading = buildDailyFortuneReading(chart, day!)

    expect(reading.date).toBe('2026-07-02')
    expect(reading.title).toContain(day!.dayGanji)
    expect(reading.tenGod.length).toBeGreaterThan(0)
    expect(reading.branchTenGod.length).toBeGreaterThan(0)
    expect(reading.averageScore).toBeGreaterThan(0)
    expect(reading.topPercent).toBeGreaterThanOrEqual(5)
    expect(reading.rankText).toContain('상위')
    expect(reading.narrative).toContain('상위')
    expect(reading.narrative.length).toBeGreaterThan(120)
    expect(Object.keys(reading.toneVariants).sort()).toEqual(['expert', 'practical', 'soft'])
    expect(reading.toneVariants.practical).toBe(reading.narrative)
    expect(reading.toneVariants.expert).toContain('일간 기준')
    expect(reading.categoryReadings.map((item) => item.category)).toEqual(['일운', '재물운', '관계운', '건강운'])
    expect(reading.categoryReadings.every((item) => item.score >= 35 && item.score <= 95)).toBe(true)
    expect(reading.actionTips.length).toBeGreaterThanOrEqual(3)
    expect(reading.basis).toContain(day!.dayGanji)
    expect(Array.isArray(reading.relationHighlights)).toBe(true)
  })
})

describe('buildPeriodFortuneReading', () => {
  it('aggregates weekly and monthly category scores from daily fortunes', () => {
    const chart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })
    const calendar = buildManseCalendarMonth(2026, 7)
    const week = buildPeriodFortuneReading(chart, calendar.days.slice(0, 7), 'week')
    const month = buildPeriodFortuneReading(chart, calendar.days.filter((day) => day.isCurrentMonth), 'month')

    expect(week.period).toBe('week')
    expect(month.period).toBe('month')
    expect(week.categoryScores).toHaveLength(4)
    expect(month.categoryScores).toHaveLength(4)
    expect(week.focus.length).toBeGreaterThan(0)
    expect(month.advice.length).toBeGreaterThan(0)
    expect(week.rankText).toContain('상위')
    expect(month.topPercent).toBeGreaterThanOrEqual(5)
    expect(week.narrative.length).toBeGreaterThan(160)
    expect(month.narrative).toContain('중요한 일정')
    expect(Object.keys(week.toneVariants).sort()).toEqual(['expert', 'practical', 'soft'])
    expect(week.toneVariants.soft).toContain('이번 주')
    expect(month.toneVariants.expert).toContain('주요 십성')
    expect(week.opportunity.length).toBeGreaterThan(0)
    expect(week.caution.length).toBeGreaterThan(0)
    expect(month.rhythm.length).toBeGreaterThan(0)
    expect(week.dominantTenGods.length).toBeGreaterThan(0)
    expect(month.dominantElements.length).toBeGreaterThan(0)
    expect(week.highlightDays).toHaveLength(3)
    expect(month.cautionDays).toHaveLength(3)
    expect(month.averageScore).toBeGreaterThan(0)
  })
})
