import { getBranchTenGod, getTenGod, type EarthlyBranch, type FiveElement } from 'manseryeok'
import type { CalendarDay } from './manseCalendar'
import type { PillarReading, SajuChart } from './sajuEngine'

export type DailyRelation = {
  type: string
  label: string
  pillarLabel: string
  tone: 'support' | 'tension' | 'neutral'
}

export type DailyCategoryReading = {
  category: '일운' | '재물운' | '관계운' | '건강운'
  score: number
  summary: string
  advice: string
  basis: string
}

export type FortuneTone = 'soft' | 'practical' | 'expert'

export type DailyFortuneReading = {
  date: string
  title: string
  headline: string
  narrative: string
  toneVariants: Record<FortuneTone, string>
  averageScore: number
  topPercent: number
  rankText: string
  tenGod: string
  branchTenGod: string
  elementTone: string
  relationHighlights: DailyRelation[]
  categoryReadings: DailyCategoryReading[]
  actionTips: string[]
  timeTips: Array<{
    label: '오전' | '오후' | '저녁'
    text: string
  }>
  caution: string
  basis: string
}

export type PeriodFortuneReading = {
  period: 'week' | 'month'
  title: string
  headline: string
  narrative: string
  toneVariants: Record<FortuneTone, string>
  focus: string
  advice: string
  opportunity: string
  caution: string
  rhythm: string
  averageScore: number
  topPercent: number
  rankText: string
  dominantTenGods: string[]
  dominantElements: FiveElement[]
  categoryScores: Array<{
    category: DailyCategoryReading['category']
    score: number
  }>
  highlightDays: Array<{
    date: string
    dayGanji: string
    score: number
  }>
  cautionDays: Array<{
    date: string
    dayGanji: string
    score: number
  }>
  basis: string
}

const elementThemes: Record<FiveElement, string> = {
  목: '기획, 성장, 배움, 사람을 여는 흐름',
  화: '표현, 노출, 추진력, 빠른 반응',
  토: '정리, 책임, 현실 판단, 균형',
  금: '판단, 기준, 계약, 마무리',
  수: '정보, 이동, 대화, 회복',
}

const tenGodThemes: Record<string, { headline: string; tips: string[]; caution: string }> = {
  비견: {
    headline: '자기 기준이 선명해지는 날입니다.',
    tips: ['혼자 결정해야 하는 일을 정리하기 좋습니다.', '주도권이 필요한 일에 힘을 실어보세요.'],
    caution: '고집이나 정면 대립은 피하는 편이 좋습니다.',
  },
  겁재: {
    headline: '경쟁심과 추진력이 같이 올라오는 날입니다.',
    tips: ['협상이나 비교가 필요한 일을 점검해보세요.', '돈이 새는 지점을 한번 확인해두면 좋습니다.'],
    caution: '충동 지출과 감정적인 승부욕을 조심하세요.',
  },
  식신: {
    headline: '꾸준히 만들고 표현하는 힘이 살아나는 날입니다.',
    tips: ['콘텐츠, 작업물, 루틴을 쌓기에 좋습니다.', '먹고 쉬는 리듬을 안정시키면 운용이 편합니다.'],
    caution: '느슨함이 지나치면 중요한 마감이 밀릴 수 있습니다.',
  },
  상관: {
    headline: '표현력은 강하지만 말의 각도도 날카로워질 수 있습니다.',
    tips: ['아이디어 발표나 개선 제안에 힘을 써보세요.', '답답했던 규칙을 새 방식으로 풀어보기 좋습니다.'],
    caution: '윗사람, 고객, 파트너와의 말투는 한 번 더 다듬으세요.',
  },
  편재: {
    headline: '기회, 사람, 돈의 움직임이 넓어지는 날입니다.',
    tips: ['영업, 제안, 외부 미팅에 유리합니다.', '작은 수익화 실험을 해보기 좋습니다.'],
    caution: '범위를 너무 넓히면 실속이 약해질 수 있습니다.',
  },
  정재: {
    headline: '현실적인 관리와 안정감이 중요한 날입니다.',
    tips: ['예산, 일정, 계약 조건을 정리해보세요.', '반복 수익이나 고정 업무를 다듬기 좋습니다.'],
    caution: '너무 보수적으로 보면 좋은 기회를 놓칠 수 있습니다.',
  },
  편관: {
    headline: '압박은 있지만 돌파력도 같이 들어오는 날입니다.',
    tips: ['미뤄둔 문제를 정면으로 처리하기 좋습니다.', '규칙과 책임이 필요한 일에 집중해보세요.'],
    caution: '무리한 일정과 과한 긴장감은 줄여야 합니다.',
  },
  정관: {
    headline: '신뢰, 질서, 공식적인 판단이 잘 맞는 날입니다.',
    tips: ['문서, 면접, 보고, 약속을 정리하기 좋습니다.', '평판 관리와 기본기를 챙기세요.'],
    caution: '체면 때문에 속마음을 너무 누르지 않게 보세요.',
  },
  편인: {
    headline: '감각과 직관이 예민하게 움직이는 날입니다.',
    tips: ['공부, 리서치, 기획의 방향 전환에 좋습니다.', '혼자 생각할 시간을 확보해보세요.'],
    caution: '생각이 많아져 실행이 늦어질 수 있습니다.',
  },
  정인: {
    headline: '보호, 학습, 회복의 기운이 들어오는 날입니다.',
    tips: ['자료 정리와 공부에 안정적인 흐름입니다.', '도움을 요청하거나 조언을 듣기 좋습니다.'],
    caution: '편안함에 기대어 결정을 미루지 않게 주의하세요.',
  },
  일간: {
    headline: '나의 중심을 다시 확인하는 날입니다.',
    tips: ['현재 상태를 점검하고 기준을 세워보세요.', '무리한 확장보다 자기 페이스 회복이 좋습니다.'],
    caution: '혼자 판단하기 어려운 일은 한 번 더 확인하세요.',
  },
}

const categoryProfiles: Record<
  DailyCategoryReading['category'],
  {
    boostTenGods: string[]
    dragTenGods: string[]
    element: FiveElement
    support: string
    caution: string
  }
> = {
  일운: {
    boostTenGods: ['정관', '편관', '식신', '상관'],
    dragTenGods: ['겁재', '편인'],
    element: '화',
    support: '집중해서 처리할 일과 드러내야 할 일을 앞쪽에 배치하세요.',
    caution: '우선순위 없이 움직이면 바쁜데 성과가 흐려질 수 있습니다.',
  },
  재물운: {
    boostTenGods: ['정재', '편재', '식신'],
    dragTenGods: ['겁재', '상관'],
    element: '금',
    support: '수입, 지출, 제안 조건처럼 숫자로 확인되는 일을 챙기기 좋습니다.',
    caution: '즉흥적인 지출이나 분위기에 휩쓸린 약속은 줄이세요.',
  },
  관계운: {
    boostTenGods: ['정인', '정관', '비견', '식신'],
    dragTenGods: ['상관', '겁재', '편관'],
    element: '목',
    support: '먼저 설명하고 맞춰가는 방식이 관계 흐름을 부드럽게 만듭니다.',
    caution: '맞고 틀림을 급히 가르면 대화가 딱딱해질 수 있습니다.',
  },
  건강운: {
    boostTenGods: ['정인', '식신', '비견'],
    dragTenGods: ['편관', '상관', '겁재'],
    element: '수',
    support: '수면, 식사, 물 섭취처럼 기본 리듬을 회복하는 데 초점을 두세요.',
    caution: '컨디션을 밀어붙이기보다 피로 신호를 먼저 확인하세요.',
  },
}

const branchRelations: Array<{
  type: string
  tone: DailyRelation['tone']
  pairs: ReadonlyArray<readonly [EarthlyBranch, EarthlyBranch]>
}> = [
  {
    type: '육합',
    tone: 'support',
    pairs: [
      ['자', '축'],
      ['인', '해'],
      ['묘', '술'],
      ['진', '유'],
      ['사', '신'],
      ['오', '미'],
    ],
  },
  {
    type: '충',
    tone: 'tension',
    pairs: [
      ['자', '오'],
      ['축', '미'],
      ['인', '신'],
      ['묘', '유'],
      ['진', '술'],
      ['사', '해'],
    ],
  },
  {
    type: '해',
    tone: 'tension',
    pairs: [
      ['자', '미'],
      ['축', '오'],
      ['인', '사'],
      ['묘', '진'],
      ['신', '해'],
      ['유', '술'],
    ],
  },
  {
    type: '파',
    tone: 'neutral',
    pairs: [
      ['자', '유'],
      ['축', '진'],
      ['인', '해'],
      ['묘', '오'],
      ['사', '신'],
      ['미', '술'],
    ],
  },
]

export function buildDailyFortuneReading(chart: SajuChart, day: CalendarDay): DailyFortuneReading {
  const dayMaster = chart.pillars.find((pillar) => pillar.key === 'day')?.stem
  const tenGod = dayMaster ? getTenGod(dayMaster, day.dayStem) : '일간'
  const branchTenGod = dayMaster ? getBranchTenGod(dayMaster, day.dayBranch) : '-'
  const theme = tenGodThemes[tenGod] ?? tenGodThemes.일간
  const relationHighlights = findDailyRelations(chart.pillars, day.dayBranch)
  const elementTone = describeElementTone(chart, day.dayStemElement)
  const categoryReadings = buildCategoryReadings(chart, day, tenGod, branchTenGod, relationHighlights)
  const averageScore = adjustDailyAverageScore(
    average(categoryReadings.map((category) => category.score)),
    categoryReadings,
    relationHighlights,
    tenGod,
  )
  const topPercent = scoreToTopPercent(averageScore)
  const strongestCategory = [...categoryReadings].sort((a, b) => b.score - a.score)[0]
  const weakestCategory = [...categoryReadings].sort((a, b) => a.score - b.score)[0]
  const caution = relationHighlights.some((relation) => relation.tone === 'tension')
    ? `${theme.caution} 특히 원국 지지와 긴장 관계가 있으니 일정과 말의 속도를 낮춰보세요.`
    : theme.caution
  const headline = buildPersonalizedDailyHeadline({
    baseHeadline: theme.headline,
    tenGod,
    branchTenGod,
    averageScore,
    strongestCategory,
    weakestCategory,
    relationHighlights,
    elementTone,
  })
  const narrative = buildDailyNarrative({
    title: `${day.date} ${day.dayGanji}일`,
    headline,
    averageScore,
    topPercent,
    tenGod,
    branchTenGod,
    elementTone,
    strongestCategory,
    weakestCategory,
    relationHighlights,
    caution,
  })

  return {
    date: day.date,
    title: `${day.date} ${day.dayGanji}일`,
    headline,
    narrative,
    toneVariants: buildDailyToneVariants({
      narrative,
      title: `${day.date} ${day.dayGanji}일`,
      averageScore,
      topPercent,
      tenGod,
      branchTenGod,
      strongestCategory,
      weakestCategory,
    }),
    averageScore,
    topPercent,
    rankText: buildRankText('today', averageScore, topPercent),
    tenGod,
    branchTenGod,
    elementTone,
    relationHighlights,
    categoryReadings,
    actionTips: [
      ...theme.tips,
      `${day.dayStemElement} 기운은 ${elementThemes[day.dayStemElement]}에 초점을 맞추면 쓰기 쉽습니다.`,
    ],
    timeTips: buildDailyTimeTips(strongestCategory, weakestCategory, tenGod, branchTenGod),
    caution,
    basis: `일진 ${day.dayGanji}, 일간 기준 천간 십성 ${tenGod}, 지지 십성 ${branchTenGod}, 일진 오행 ${day.dayStemElement}/${day.dayBranchElement}`,
  }
}

function adjustDailyAverageScore(
  baseScore: number,
  categoryReadings: DailyCategoryReading[],
  relationHighlights: DailyRelation[],
  tenGod: string,
) {
  const scores = categoryReadings.map((category) => category.score)
  const spread = Math.max(...scores) - Math.min(...scores)
  const relationDelta = relationHighlights.some((relation) => relation.tone === 'support')
    ? 3
    : relationHighlights.some((relation) => relation.tone === 'tension')
      ? -4
      : 0
  const tenGodDelta: Record<string, number> = {
    식신: 3,
    편재: 3,
    정관: 2,
    정인: 1,
    비견: 0,
    정재: 0,
    상관: -1,
    겁재: -2,
    편인: -2,
    편관: -3,
  }
  const spreadDelta = spread >= 22 ? 2 : spread <= 10 ? -2 : 0

  return clampScore(Math.round(baseScore + relationDelta + (tenGodDelta[tenGod] ?? 0) + spreadDelta))
}

function buildDailyTimeTips(
  strongestCategory: DailyCategoryReading,
  weakestCategory: DailyCategoryReading,
  tenGod: string,
  branchTenGod: string,
): DailyFortuneReading['timeTips'] {
  return [
    {
      label: '오전',
      text: `${strongestCategory.category}과 관련된 중요한 일부터 먼저 배치하세요.`,
    },
    {
      label: '오후',
      text: `${tenGod}/${branchTenGod} 기운이 드러나기 쉬우니 말과 선택의 기준을 분명히 잡으세요.`,
    },
    {
      label: '저녁',
      text: `${weakestCategory.category}은 무리해서 끌고 가지 말고 정리와 회복 쪽으로 마무리하세요.`,
    },
  ]
}

function buildPersonalizedDailyHeadline({
  baseHeadline,
  tenGod,
  branchTenGod,
  averageScore,
  strongestCategory,
  weakestCategory,
  relationHighlights,
  elementTone,
}: {
  baseHeadline: string
  tenGod: string
  branchTenGod: string
  averageScore: number
  strongestCategory: DailyCategoryReading
  weakestCategory: DailyCategoryReading
  relationHighlights: DailyRelation[]
  elementTone: string
}) {
  const scoreLead =
    averageScore >= 70
      ? '오늘은 흐름이 비교적 열려 있습니다.'
      : averageScore >= 62
        ? '오늘은 선택과 집중이 잘 맞는 날입니다.'
        : averageScore >= 55
          ? '오늘은 무리보다 정리가 먼저입니다.'
          : '오늘은 속도를 낮추고 안정감을 챙기는 편이 좋습니다.'
  const relationLead = relationHighlights.some((relation) => relation.tone === 'tension')
    ? '관계나 일정의 마찰은 미리 줄여두세요.'
    : relationHighlights.some((relation) => relation.tone === 'support')
      ? '사람과 약속에서 도움 받을 여지가 있습니다.'
      : ''
  const categoryLead = `${strongestCategory.category}은 살리고 ${weakestCategory.category}은 점검하세요.`
  const elementLead = elementTone.includes('이미 강한')
    ? '기운을 더 밀기보다 균형을 잡는 쪽이 좋습니다.'
    : elementTone.includes('무난하게')
      ? '큰 변동보다 기본기를 쓰기 좋은 흐름입니다.'
      : ''
  const branchLead = branchTenGod !== '-' ? `${tenGod}/${branchTenGod} 흐름이 하루의 결을 만듭니다.` : baseHeadline

  return [scoreLead, categoryLead, relationLead || elementLead || branchLead].filter(Boolean).join(' ')
}

export function buildPeriodFortuneReading(
  chart: SajuChart,
  days: CalendarDay[],
  period: PeriodFortuneReading['period'],
): PeriodFortuneReading {
  const readings = days.map((day) => ({
    day,
    reading: buildDailyFortuneReading(chart, day),
  }))
  const dominantTenGods = topKeys(countValues(readings.map(({ reading }) => reading.tenGod)), 2)
  const dominantElements = topKeys(countValues(days.map((day) => day.dayStemElement)), 2) as FiveElement[]
  const categoryScores = (Object.keys(categoryProfiles) as DailyCategoryReading['category'][]).map((category) => ({
    category,
    score: average(
      readings.map(({ reading }) => reading.categoryReadings.find((item) => item.category === category)?.score ?? 0),
    ),
  }))
  const scoredDays = readings
    .map(({ day, reading }) => ({
      date: day.date,
      dayGanji: day.dayGanji,
      score: average(reading.categoryReadings.map((item) => item.score)),
    }))
    .sort((a, b) => b.score - a.score)
  const averageScore = average(scoredDays.map((day) => day.score))
  const topPercent = scoreToTopPercent(averageScore)
  const title = period === 'week' ? '주간 운세' : '월간 운세'
  const periodInsights = buildPeriodInsights(period, averageScore, categoryScores, scoredDays, dominantTenGods, dominantElements)
  const narrative = buildPeriodNarrative({
    title,
    averageScore,
    topPercent,
    opportunity: periodInsights.opportunity,
    caution: periodInsights.caution,
    rhythm: periodInsights.rhythm,
    highlightDays: scoredDays.slice(0, 3),
    cautionDays: [...scoredDays].reverse().slice(0, 3),
  })

  return {
    period,
    title,
    headline: buildPeriodHeadline(title, averageScore, dominantTenGods, dominantElements, categoryScores),
    narrative,
    toneVariants: buildPeriodToneVariants({
      narrative,
      title,
      period,
      averageScore,
      topPercent,
      categoryScores,
      dominantTenGods,
      dominantElements,
      highlightDays: scoredDays.slice(0, 3),
      cautionDays: [...scoredDays].reverse().slice(0, 3),
    }),
    focus: buildPeriodFocus(period, dominantTenGods, dominantElements),
    advice: buildPeriodAdvice(period, categoryScores, scoredDays),
    opportunity: periodInsights.opportunity,
    caution: periodInsights.caution,
    rhythm: periodInsights.rhythm,
    averageScore,
    topPercent,
    rankText: buildRankText(period, averageScore, topPercent),
    dominantTenGods,
    dominantElements,
    categoryScores,
    highlightDays: scoredDays.slice(0, 3),
    cautionDays: [...scoredDays].reverse().slice(0, 3),
    basis: `${days[0]?.date ?? '-'} ~ ${days[days.length - 1]?.date ?? '-'} 기간의 일진 카테고리 점수 평균`,
  }
}

function buildDailyNarrative({
  title,
  headline,
  averageScore,
  topPercent,
  tenGod,
  branchTenGod,
  elementTone,
  strongestCategory,
  weakestCategory,
  relationHighlights,
  caution,
}: {
  title: string
  headline: string
  averageScore: number
  topPercent: number
  tenGod: string
  branchTenGod: string
  elementTone: string
  strongestCategory: DailyCategoryReading
  weakestCategory: DailyCategoryReading
  relationHighlights: DailyRelation[]
  caution: string
}) {
  const relationText = relationHighlights.length
    ? `원국과는 ${relationHighlights.map((relation) => `${relation.pillarLabel} ${relation.type}`).slice(0, 3).join(', ')} 관계가 잡히므로 사람, 약속, 일정의 반응을 조금 더 세심하게 보는 편이 좋습니다.`
    : '원국과 강한 충돌 관계가 적어 무리한 변수보다는 스스로의 선택과 컨디션 관리가 더 중요합니다.'

  return `${title}의 흐름은 ${headline} 전체 점수는 ${averageScore}점, 체감 운 흐름은 상위 ${topPercent}% 안쪽으로 볼 수 있습니다. 천간에서는 ${tenGod}, 지지에서는 ${branchTenGod} 기운이 들어와 하루의 겉모습과 생활 바닥을 함께 움직입니다. ${elementTone} 오늘은 ${strongestCategory.category}을 조금 더 밀어보고, ${weakestCategory.category}은 욕심을 줄여 안정적으로 관리하는 편이 좋습니다. ${relationText} ${caution}`
}

function buildPeriodNarrative({
  title,
  averageScore,
  topPercent,
  opportunity,
  caution,
  rhythm,
  highlightDays,
  cautionDays,
}: {
  title: string
  averageScore: number
  topPercent: number
  opportunity: string
  caution: string
  rhythm: string
  highlightDays: PeriodFortuneReading['highlightDays']
  cautionDays: PeriodFortuneReading['cautionDays']
}) {
  const goodDays = formatDayList(highlightDays)
  const carefulDays = formatDayList(cautionDays)

  return [
    `${title}의 평균 흐름은 ${averageScore}점이며, 체감상 상위 ${topPercent}% 안쪽입니다.`,
    opportunity,
    caution,
    rhythm,
    `중요한 일정은 ${goodDays || '점수가 높은 날'} 전후로 배치하고, 조심할 일은 ${carefulDays || '점수가 낮은 날'}에 무리해서 결정하지 않는 편이 좋습니다.`,
  ].join(' ')
}

function buildPeriodInsights(
  period: PeriodFortuneReading['period'],
  averageScore: number,
  categoryScores: PeriodFortuneReading['categoryScores'],
  scoredDays: Array<{ date: string; dayGanji: string; score: number }>,
  tenGods: string[],
  elements: FiveElement[],
) {
  const strongest = [...categoryScores].sort((a, b) => b.score - a.score)[0]
  const weakest = [...categoryScores].sort((a, b) => a.score - b.score)[0]
  const lowDay = [...scoredDays].sort((a, b) => a.score - b.score)[0]
  const periodLabel = period === 'week' ? '이번 주' : '이번 달'
  const periodSubject = period === 'week' ? '이번 주는' : '이번 달은'
  const scoreTone =
    averageScore >= 76 ? '강하게 밀어도 되는 구간' : averageScore >= 62 ? '선택과 집중이 중요한 구간' : '속도를 낮추고 정리해야 하는 구간'

  return {
    opportunity: `${periodLabel}의 기회는 ${strongest?.category ?? '일운'}에서 먼저 열립니다. ${describeTenGodFlow(tenGods)} 좋은 날에 중요한 선택을 몰아두면 흐름을 쓰기 쉽습니다.`,
    caution: `${weakest?.category ?? '건강운'}은 무리하지 않는 편이 좋습니다. ${formatShortDate(lowDay?.date)} 전후에는 약속, 지출, 감정 표현을 한 번 더 점검하세요.`,
    rhythm: `${periodSubject} ${describeElementFlow(elements)} ${scoreTone}입니다. 매일 다 잘하려고 하기보다 좋은 날에 힘을 싣고 낮은 날에는 관리로 넘어가는 전략이 맞습니다.`,
  }
}

function buildPeriodHeadline(
  title: string,
  averageScore: number,
  dominantTenGods: string[],
  dominantElements: FiveElement[],
  categoryScores: PeriodFortuneReading['categoryScores'],
) {
  return `${title}는 평균 ${averageScore}점 흐름입니다. ${getStrongestCategory(categoryScores)}이 가장 살아나고, ${describeTenGodFlow(dominantTenGods)} ${describeElementFlow(dominantElements)}`
}

function buildPeriodFocus(period: PeriodFortuneReading['period'], tenGods: string[], elements: FiveElement[]) {
  const periodLabel = period === 'week' ? '이번 주' : '이번 달'

  return `${periodLabel}는 ${describeTenGodFlow(tenGods)} ${describeElementFlow(elements)} 무리하게 새 판을 벌리기보다 강하게 들어오는 기운을 어디에 쓸지 정하는 것이 좋습니다.`
}

function buildPeriodAdvice(
  period: PeriodFortuneReading['period'],
  categoryScores: PeriodFortuneReading['categoryScores'],
  scoredDays: Array<{ date: string; dayGanji: string; score: number }>,
) {
  const strongest = [...categoryScores].sort((a, b) => b.score - a.score)[0]
  const weakest = [...categoryScores].sort((a, b) => a.score - b.score)[0]
  const bestDay = scoredDays[0]
  const periodLabel = period === 'week' ? '주간 계획' : '월간 계획'

  return `${periodLabel}은 ${strongest?.category ?? '일운'}을 앞에 두고, ${weakest?.category ?? '건강운'}은 보수적으로 관리하세요. 중요한 일은 ${formatShortDate(bestDay?.date)} 전후로 배치하면 리듬을 잡기 쉽습니다.`
}

function buildDailyToneVariants({
  narrative,
  title,
  averageScore,
  topPercent,
  tenGod,
  branchTenGod,
  strongestCategory,
  weakestCategory,
}: {
  narrative: string
  title: string
  averageScore: number
  topPercent: number
  tenGod: string
  branchTenGod: string
  strongestCategory: DailyCategoryReading
  weakestCategory: DailyCategoryReading
}): Record<FortuneTone, string> {
  return {
    soft: `${title}은 크게 무리하지 않아도 흐름을 잡을 수 있는 날입니다. 전체 운은 ${averageScore}점, 체감상 상위 ${topPercent}% 안쪽입니다. 오늘은 ${strongestCategory.category}을 조금 더 믿고 움직이되, ${weakestCategory.category}은 서두르지 않는 편이 좋습니다. 마음이 급해질수록 작은 일정부터 정리하면 하루가 편해집니다.`,
    practical: narrative,
    expert: `${title}은 일간 기준 천간 ${tenGod}, 지지 ${branchTenGod} 흐름입니다. 평균 ${averageScore}점, 상위 ${topPercent}%권으로 산정되며, 강점 영역은 ${strongestCategory.category}, 관리 영역은 ${weakestCategory.category}입니다. 해석은 십성 배치, 일진 오행, 원국 지지 관계를 함께 본 참고값입니다.`,
  }
}

function buildPeriodToneVariants({
  narrative,
  title,
  period,
  averageScore,
  topPercent,
  categoryScores,
  dominantTenGods,
  dominantElements,
  highlightDays,
  cautionDays,
}: {
  narrative: string
  title: string
  period: PeriodFortuneReading['period']
  averageScore: number
  topPercent: number
  categoryScores: PeriodFortuneReading['categoryScores']
  dominantTenGods: string[]
  dominantElements: FiveElement[]
  highlightDays: PeriodFortuneReading['highlightDays']
  cautionDays: PeriodFortuneReading['cautionDays']
}): Record<FortuneTone, string> {
  const periodLabel = period === 'week' ? '이번 주' : '이번 달'
  const strongest = [...categoryScores].sort((a, b) => b.score - a.score)[0]
  const weakest = [...categoryScores].sort((a, b) => a.score - b.score)[0]

  return {
    soft: `${periodLabel}은 너무 앞서가기보다 흐름을 보며 조절하면 좋은 시기입니다. 평균 ${averageScore}점, 체감상 상위 ${topPercent}% 안쪽으로 무난한 힘이 있습니다. ${strongest?.category ?? '일운'}은 조금 더 기대해도 좋고, ${weakest?.category ?? '건강운'}은 차분히 관리하면 전체 리듬이 좋아집니다.`,
    practical: narrative,
    expert: `${title}는 평균 ${averageScore}점, 상위 ${topPercent}%권입니다. 우세 카테고리는 ${strongest?.category ?? '-'}, 약한 카테고리는 ${weakest?.category ?? '-'}입니다. 주요 십성은 ${joinKoreanList(dominantTenGods) || '-'}, 주요 오행은 ${joinKoreanList(dominantElements) || '-'}입니다. 활용일은 ${formatDayList(highlightDays) || '-'}, 주의일은 ${formatDayList(cautionDays) || '-'}로 분류됩니다.`,
  }
}

function describeTenGodFlow(tenGods: string[]) {
  if (!tenGods.length) {
    return '기본 흐름이 안정적으로 깔려 있습니다.'
  }

  const names = joinKoreanList(tenGods)
  const meanings = tenGods.map(getTenGodPlainMeaning).filter(Boolean)

  return `${names} 흐름이 들어와 ${joinKoreanList(meanings)} 쪽이 강조됩니다.`
}

function getTenGodPlainMeaning(tenGod: string) {
  const meanings: Record<string, string> = {
    비견: '자기 주도성',
    겁재: '경쟁과 선택',
    식신: '생산성과 꾸준함',
    상관: '표현과 개선',
    편재: '외부 기회와 돈의 움직임',
    정재: '현실적인 관리',
    편관: '책임과 돌파력',
    정관: '신뢰와 질서',
    편인: '직감과 방향 전환',
    정인: '학습과 회복',
    일간: '자기 점검',
  }

  return meanings[tenGod] ?? ''
}

function describeElementFlow(elements: FiveElement[]) {
  if (!elements.length) {
    return '오행은 한쪽으로 치우치기보다 균형을 잡는 쪽이 좋습니다.'
  }

  return `${joinKoreanList(elements)} 기운이 ${elements.map((element) => elementThemes[element].split(', ')[0]).join('과 ')} 쪽을 밀어줍니다.`
}

function joinKoreanList(values: string[]) {
  return [...new Set(values)].join('·')
}

function formatDayList(days: Array<{ date: string; dayGanji: string }>) {
  return days.map((day) => `${formatShortDate(day.date)}(${day.dayGanji})`).join(', ')
}

function formatShortDate(date?: string) {
  if (!date) {
    return '흐름이 좋은 날'
  }

  const [, month, day] = date.split('-')

  return `${Number(month)}월 ${Number(day)}일`
}

function buildRankText(period: 'today' | PeriodFortuneReading['period'], score: number, topPercent: number) {
  const periodLabel = period === 'today' ? '오늘' : period === 'week' ? '이번 주' : '이번 달'
  const tone = score >= 76 ? '상위권 흐름' : score >= 62 ? '중상위권 흐름' : '관리형 흐름'

  return `${periodLabel}의 운 흐름은 체감상 상위 ${topPercent}% 안쪽의 ${tone}으로 볼 수 있습니다.`
}

function scoreToTopPercent(score: number) {
  return Math.max(5, Math.min(65, 100 - score))
}

function buildCategoryReadings(
  chart: SajuChart,
  day: CalendarDay,
  tenGod: string,
  branchTenGod: string,
  relationHighlights: DailyRelation[],
) {
  return (Object.keys(categoryProfiles) as DailyCategoryReading['category'][]).map((category) => {
    const profile = categoryProfiles[category]
    const elementStatus = chart.elementSummary.find((item) => item.element === profile.element)?.status
    const hasSupportRelation = relationHighlights.some((relation) => relation.tone === 'support')
    const hasTensionRelation = relationHighlights.some((relation) => relation.tone === 'tension')
    const score = clampScore(
      60 +
        (profile.boostTenGods.includes(tenGod) ? 16 : 0) +
        (profile.boostTenGods.includes(branchTenGod) ? 8 : 0) -
        (profile.dragTenGods.includes(tenGod) ? 13 : 0) -
        (profile.dragTenGods.includes(branchTenGod) ? 7 : 0) +
        (day.dayStemElement === profile.element ? 8 : 0) +
        (elementStatus === '부족' ? 7 : 0) -
        (elementStatus === '과다' ? 7 : 0) +
        (hasSupportRelation ? 6 : 0) -
        (hasTensionRelation ? 9 : 0),
    )

    return {
      category,
      score,
      summary: buildCategorySummary(category, score, tenGod, day.dayStemElement),
      advice: score >= 72 ? profile.support : profile.caution,
      basis: `${tenGod}/${branchTenGod}, ${day.dayStemElement} 기운, ${profile.element} 영역 기준`,
    }
  })
}

function buildCategorySummary(
  category: DailyCategoryReading['category'],
  score: number,
  tenGod: string,
  element: FiveElement,
) {
  const tone = score >= 76 ? '흐름이 좋은 편' : score >= 62 ? '무난하게 쓸 수 있는 편' : '조심스럽게 다뤄야 하는 편'

  return `${category}은 ${tone}입니다. ${tenGod} 기운과 ${element} 오행을 중심으로 하루의 방향을 잡아보세요.`
}

function clampScore(score: number) {
  return Math.max(35, Math.min(95, score))
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function getStrongestCategory(categoryScores: PeriodFortuneReading['categoryScores']) {
  return [...categoryScores].sort((a, b) => b.score - a.score)[0]?.category ?? '일운'
}

function countValues<T extends string>(values: T[]) {
  const counts = new Map<T, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return counts
}

function topKeys<T extends string>(counts: Map<T, number>, limit: number) {
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([key]) => key)
}

function describeElementTone(chart: SajuChart, element: FiveElement) {
  const summary = chart.elementSummary.find((item) => item.element === element)

  if (!summary || summary.count === 0) {
    return `${element} 기운이 원국의 빈자리를 보완해주는 날입니다.`
  }

  if (summary.count >= 3) {
    return `${element} 기운이 이미 강한 편이라 속도 조절이 필요합니다.`
  }

  return `${element} 기운이 원국과 무난하게 이어지는 날입니다.`
}

function findDailyRelations(pillars: PillarReading[], dayBranch: EarthlyBranch) {
  const findings: DailyRelation[] = []

  for (const pillar of pillars) {
    for (const relation of branchRelations) {
      if (relation.pairs.some(([first, second]) => isSamePair(first, second, pillar.branch, dayBranch))) {
        findings.push({
          type: relation.type,
          label: `${pillar.branch}${dayBranch}`,
          pillarLabel: pillar.label,
          tone: relation.tone,
        })
      }
    }
  }

  return findings
}

function isSamePair(
  first: EarthlyBranch,
  second: EarthlyBranch,
  source: EarthlyBranch,
  target: EarthlyBranch,
) {
  return (first === source && second === target) || (first === target && second === source)
}
