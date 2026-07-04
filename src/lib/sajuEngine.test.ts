import { describe, expect, it } from 'vitest'
import {
  calculateSajuChart,
  getHiddenStemReadings,
  getSpecialStarNames,
  getTwelveGodStar,
  getTwelveLifeStage,
} from './sajuEngine'

describe('calculateSajuChart', () => {
  it('normalizes the stage 2 saju chart contract', () => {
    const chart = calculateSajuChart({
      year: 2001,
      month: 8,
      day: 3,
      hour: 13,
      minute: 30,
      gender: 'male',
    })

    expect(chart.summary).toBe('신사연주, 을미월주, 무술일주, 기미시주')
    expect(chart.pillars.map((pillar) => pillar.korean)).toEqual(['신사', '을미', '무술', '기미'])
    expect(chart.pillars.map((pillar) => pillar.stemTenGod)).toEqual([
      '상관',
      '정관',
      '일간',
      '겁재',
    ])
    expect(chart.pillars.map((pillar) => pillar.hiddenStems.map((hidden) => hidden.stem))).toEqual([
      ['무', '경', '병'],
      ['정', '을', '기'],
      ['신', '정', '무'],
      ['정', '을', '기'],
    ])
    expect(chart.pillars.map((pillar) => pillar.twelveLifeStage)).toEqual([
      '건록',
      '쇠',
      '묘',
      '쇠',
    ])
    expect(chart.pillars.map((pillar) => pillar.twelveGodStar)).toEqual([
      '지살',
      '월살',
      '반안살',
      '월살',
    ])
    expect(chart.voidBranches).toEqual(['진', '사'])
    expect(chart.elementSummary).toEqual([
      { element: '목', count: 1, percentage: 12.5, status: '적정' },
      { element: '화', count: 1, percentage: 12.5, status: '적정' },
      { element: '토', count: 5, percentage: 62.5, status: '과다' },
      { element: '금', count: 1, percentage: 12.5, status: '적정' },
      { element: '수', count: 0, percentage: 0, status: '부족' },
    ])
    expect(chart.relations.map((relation) => relation.label)).toEqual(
      expect.arrayContaining(['을신 천간충', '술미 지지파', '사술 원진']),
    )
    expect(chart.specialStars.map((star) => star.name)).toEqual(
      expect.arrayContaining([
        '현침살',
        '정록',
        '천을귀인',
        '금여성',
        '태극귀인',
        '화개살',
        '괴강살',
        '천문성',
      ]),
    )
    expect(chart.coreSpecialStars.map((star) => star.name)).toEqual(
      expect.arrayContaining(['천을귀인', '화개살', '괴강살']),
    )
    expect(chart.referenceSpecialStars.map((star) => star.name)).toEqual(
      expect.arrayContaining(['현침살', '정록', '금여성', '태극귀인', '천문성']),
    )
    expect(chart.summaryRelations.map((relation) => relation.label)).toEqual(
      expect.arrayContaining(['을신 천간충', '사술 원진']),
    )
    expect(chart.detailRelations.map((relation) => relation.label)).toEqual(
      expect.arrayContaining(['술미 지지파']),
    )
    expect(chart.advanced.dayStrength.strength).toBeDefined()
    expect(chart.advanced.geukguk).toBeDefined()
    expect(Array.isArray(chart.advanced.yongsin)).toBe(true)
    expect(chart.beginnerReadings.map((reading) => reading.title)).toEqual([
      '나의 기본 기질',
      '강한 기운과 보완점',
      '사주의 힘',
      '운의 흐름 보기',
    ])
    expect(chart.topicReadings.map((reading) => reading.topic)).toEqual([
      '성격',
      '일/직업',
      '재물',
      '관계',
      '건강/생활',
    ])
    expect(chart.yearlyFortunes.length).toBeGreaterThan(0)
    expect(chart.monthlyFortunes).toHaveLength(12)
    expect(chart.luck.direction).toBe('역행')
    expect(chart.luck.startAge).toBe(9)
    expect(chart.luck.basis).toMatchObject({
      referenceTermName: '소서',
      referenceTermTime: '2001. 07. 07. 10:07',
      birthTime: '2001. 08. 03. 13:30',
      timeDifference: '27일 3시간 23분',
      preciseStart: '9년 0개월 17일',
    })
    expect(chart.luck.pillars.slice(0, 3).map((pillar) => pillar.korean)).toEqual([
      '갑오',
      '계사',
      '임진',
    ])
  })

  it('explains luck start age around a solar-term boundary', () => {
    const beforeTerm = calculateSajuChart({
      year: 2026,
      month: 7,
      day: 7,
      hour: 9,
      minute: 0,
      gender: 'male',
    })
    const afterTerm = calculateSajuChart({
      year: 2026,
      month: 7,
      day: 7,
      hour: 11,
      minute: 0,
      gender: 'male',
    })

    expect(beforeTerm.pillars[1].korean).toBe('갑오')
    expect(beforeTerm.luck.startAge).toBe(1)
    expect(beforeTerm.luck.basis).toMatchObject({
      referenceTermName: '소서',
      referenceTermTime: '2026. 07. 07. 10:57',
      birthTime: '2026. 07. 07. 09:00',
      timeDifference: '0일 1시간 57분',
      preciseStart: '0년 0개월 10일',
    })

    expect(afterTerm.pillars[1].korean).toBe('을미')
    expect(afterTerm.luck.startAge).toBe(10)
    expect(afterTerm.luck.basis).toMatchObject({
      referenceTermName: '입추',
      referenceTermTime: '2026. 08. 07. 20:43',
      birthTime: '2026. 07. 07. 11:00',
      timeDifference: '31일 9시간 43분',
      preciseStart: '10년 5개월 19일',
    })
  })

  it('applies the selected day boundary rule for late-night births', () => {
    const baseInput = {
      year: 2024,
      month: 2,
      day: 29,
      hour: 23,
      minute: 30,
      gender: 'female' as const,
    }

    expect(calculateSajuChart({ ...baseInput, dayBoundary: 'midnight' }).pillars.map((pillar) => pillar.korean)).toEqual([
      '갑진',
      '병인',
      '계해',
      '임자',
    ])
    expect(calculateSajuChart({ ...baseInput, dayBoundary: 'jasi' }).pillars.map((pillar) => pillar.korean)).toEqual([
      '갑진',
      '병인',
      '갑자',
      '갑자',
    ])
    expect(calculateSajuChart({ ...baseInput, dayBoundary: 'splitJasi' }).pillars.map((pillar) => pillar.korean)).toEqual([
      '갑진',
      '병인',
      '계해',
      '갑자',
    ])
  })

  it('keeps representative chart outputs stable across common edge cases', () => {
    const cases = [
      {
        input: { year: 2001, month: 8, day: 3, hour: 13, minute: 30, gender: 'male' as const },
        pillars: [
          ['신사', '상관', '편인', '건록', '지살'],
          ['을미', '정관', '겁재', '쇠', '월살'],
          ['무술', '일간', '비견', '묘', '반안살'],
          ['기미', '겁재', '겁재', '쇠', '월살'],
        ],
        voidBranches: ['진', '사'],
        specialStars: [
          '공망',
          '과숙살',
          '괴강살',
          '귀문관살',
          '금여성',
          '정록',
          '천문성',
          '천을귀인',
          '태극귀인',
          '현침살',
          '화개살',
        ],
        relations: ['사술 원진', '술미 지지파', '을신 천간충'],
        luck: {
          direction: '역행',
          startAge: 9,
          pillars: [
            ['갑오', '편관', '정인'],
            ['계사', '정재', '편인'],
            ['임진', '편재', '비견'],
          ],
        },
      },
      {
        input: { year: 1992, month: 2, day: 14, hour: 6, minute: 10, gender: 'female' as const },
        pillars: [
          ['임신', '식신', '비견', '건록', '지살'],
          ['임인', '식신', '편재', '절', '역마살'],
          ['경신', '일간', '비견', '건록', '지살'],
          ['기묘', '정인', '정재', '태', '육해살'],
        ],
        voidBranches: ['자', '축'],
        specialStars: ['고신살', '귀문관살', '역마살', '정록', '천문성', '태극귀인', '현침살'],
        relations: ['묘신 원진', '인신 지지충'],
        luck: {
          direction: '역행',
          startAge: 3,
          pillars: [
            ['신축', '겁재', '정인'],
            ['경자', '비견', '상관'],
            ['기해', '정인', '식신'],
          ],
        },
      },
      {
        input: { year: 2024, month: 2, day: 29, hour: 23, minute: 30, gender: 'female' as const },
        pillars: [
          ['갑진', '상관', '정관', '양', '화개살'],
          ['병인', '정재', '상관', '목욕', '역마살'],
          ['계해', '일간', '겁재', '제왕', '망신살'],
          ['임자', '겁재', '비견', '건록', '장성살'],
        ],
        voidBranches: ['자', '축'],
        specialStars: [
          '고신살',
          '공망',
          '과숙살',
          '귀문관살',
          '금여성',
          '도화살',
          '역마살',
          '정록',
          '천문성',
          '현침살',
          '화개살',
        ],
        relations: ['병임 천간충', '인해 지지육합', '인해 지지파', '진해 원진'],
        luck: {
          direction: '역행',
          startAge: 8,
          pillars: [
            ['을축', '식신', '편관'],
            ['갑자', '상관', '비견'],
            ['계해', '비견', '겁재'],
          ],
        },
      },
    ]

    cases.forEach(({ input, pillars, voidBranches, specialStars, relations, luck }) => {
      const chart = calculateSajuChart(input)

      expect(
        chart.pillars.map((pillar) => [
          pillar.korean,
          pillar.stemTenGod,
          pillar.branchTenGod,
          pillar.twelveLifeStage,
          pillar.twelveGodStar,
        ]),
      ).toEqual(pillars)
      expect(chart.voidBranches).toEqual(voidBranches)
      expect([...new Set(chart.specialStars.map((star) => star.name))].sort()).toEqual(specialStars)
      expect(chart.relations.map((relation) => relation.label).sort()).toEqual(relations)
      expect(chart.luck.direction).toBe(luck.direction)
      expect(chart.luck.startAge).toBe(luck.startAge)
      expect(
        chart.luck.pillars.slice(0, 3).map((pillar) => [
          pillar.korean,
          pillar.stemTenGod,
          pillar.branchTenGod,
        ]),
      ).toEqual(luck.pillars)
    })
  })
})

describe('getHiddenStemReadings', () => {
  it('calculates hidden stems and ten gods from the day master', () => {
    expect(getHiddenStemReadings('술', '무')).toEqual([
      { stem: '신', tenGod: '상관' },
      { stem: '정', tenGod: '정인' },
      { stem: '무', tenGod: '비견' },
    ])
  })
})

describe('getTwelveLifeStage', () => {
  it('calculates the twelve life stage from the day master and branch', () => {
    expect(getTwelveLifeStage('무', '술')).toBe('묘')
    expect(getTwelveLifeStage('갑', '해')).toBe('장생')
    expect(getTwelveLifeStage('계', '자')).toBe('건록')
  })
})

describe('getTwelveGodStar', () => {
  it('calculates the twelve god star from the year branch group', () => {
    expect(getTwelveGodStar('사', '미')).toBe('월살')
    expect(getTwelveGodStar('사', '술')).toBe('반안살')
    expect(getTwelveGodStar('인', '신')).toBe('역마살')
  })
})

describe('getSpecialStarNames', () => {
  it('detects representative special stars for a pillar', () => {
    expect(
      getSpecialStarNames({
        dayMaster: '무',
        dayGanzhi: '무술',
        yearBranch: '사',
        dayBranch: '술',
        allBranches: ['술'],
        voidBranches: [],
        pillarKey: 'day',
        ganzhi: '무술',
        stem: '무',
        branch: '술',
        twelveGodStar: '반안살',
      }),
    ).toEqual(expect.arrayContaining(['태극귀인', '화개살', '괴강살', '천문성']))
  })

  it('detects added special star rules from the imported rule pack', () => {
    const detect = (branch: Parameters<typeof getSpecialStarNames>[0]['branch'], overrides = {}) =>
      getSpecialStarNames({
        dayMaster: '갑',
        dayGanzhi: '갑자',
        yearBranch: '인',
        dayBranch: '인',
        allBranches: [branch],
        voidBranches: [],
        pillarKey: 'day',
        ganzhi: `갑${branch}`,
        stem: '갑',
        branch,
        twelveGodStar: '지살',
        ...overrides,
      })

    expect(detect('사')).toContain('문창귀인')
    expect(detect('유', { yearBranch: '신', dayBranch: '신' })).toContain('도화살')
    expect(detect('오')).toContain('홍염살')
    expect(detect('해', { voidBranches: ['해'] })).toContain('공망')
    expect(detect('묘')).toContain('양인살')
    expect(detect('진', { allBranches: ['진', '해'] })).toContain('귀문관살')
    expect(detect('진', { allBranches: ['진', '사'] })).toContain('천라지망')
    expect(detect('신')).toContain('고신살')
    expect(detect('미')).toContain('과숙살')
    expect(detect('신')).toContain('역마살')
    expect(detect('술')).toContain('화개살')
    expect(detect('자')).not.toContain('역마살')
    expect(detect('진')).not.toContain('화개살')
  })
})
