import { describe, expect, it } from 'vitest'
import { buildSajuReportSections } from './sajuReport'
import { calculateSajuChart } from './sajuEngine'

describe('buildSajuReportSections', () => {
  it('builds the requested twelve-step consultation report structure', () => {
    const chart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })
    const sections = buildSajuReportSections(chart)

    expect(sections).toHaveLength(12)
    expect(sections.map((section) => section.title)).toEqual([
      '원국 핵심 구조',
      '직업운',
      '금전운',
      '연애운',
      '결혼운',
      '인간관계/가족운',
      '건강운',
      '대운 상세 해석',
      '평생 총운',
      '세운 핵심 해석',
      '만세력 판독 요약',
      '현실 조언 및 총평',
    ])
    expect(sections.every((section) => section.summary.length > 0)).toBe(true)
    expect(sections.every((section) => section.points.length > 0)).toBe(true)
    expect(sections.every((section) => section.plainTitle.length > 0)).toBe(true)
    expect(sections.every((section) => section.expertSummary.length > 0)).toBe(true)
    expect(sections.every((section) => section.conclusion.length > 0)).toBe(true)
    expect(sections.every((section) => section.advice.length > 0)).toBe(true)
    expect(sections.every((section) => section.points.every((point) => point.plain && point.expert && point.life))).toBe(true)
  })

  it('changes report wording when the birth chart changes', () => {
    const firstChart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })
    const secondChart = calculateSajuChart({
      year: 1992,
      month: 2,
      day: 14,
      hour: 6,
      minute: 10,
      gender: 'female',
    })
    const firstSections = buildSajuReportSections(firstChart)
    const secondSections = buildSajuReportSections(secondChart)

    expect(firstSections[0].summary).not.toBe(secondSections[0].summary)
    expect(firstSections.find((section) => section.title === '금전운')?.expertSummary).not.toBe(
      secondSections.find((section) => section.title === '금전운')?.expertSummary,
    )
    expect(firstSections.find((section) => section.title === '직업운')?.expertSummary).not.toBe(
      secondSections.find((section) => section.title === '직업운')?.expertSummary,
    )
  })

  it('uses interpretation packs for day master, elements, ten gods, relations, and fortune cycles', () => {
    const chart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })
    const sections = buildSajuReportSections(chart)
    const fullText = JSON.stringify(sections)

    expect(fullText).toContain('큰 산처럼 묵직하게')
    expect(fullText).toContain('주요 십성')
    expect(fullText).toContain('돈이 들어오는')
    expect(fullText).toContain('관계입니다')
    expect(fullText).toContain('대운은')
    expect(fullText).toContain('12운성')
    expect(fullText).toContain('겉으로 드러나는 선택은')
    expect(fullText).toContain('그해 겉으로 드러나는 선택')
    expect(fullText).toContain('조합')
  })

  it('uses conditional advice packs for career, money, relationship, and health guidance', () => {
    const chart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })
    const sections = buildSajuReportSections(chart)
    const fullText = JSON.stringify({ sections, topics: chart.topicReadings })

    expect(fullText).toContain('경쟁이 있는 일에서 추진력이 살아날 수 있습니다.')
    expect(fullText).toContain('돈을 크게 움직이고 싶은 마음이 생길 수 있습니다.')
    expect(fullText).toContain('사람을 끌어모으는 힘이 있지만 주도권 다툼도 생길 수 있습니다.')
    expect(fullText).toContain('활동량과 경쟁심이 커지면 몸이 쉽게 긴장할 수 있습니다.')
  })
})
