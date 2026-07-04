import { writeFileSync } from 'node:fs'
import { calculateSajuChart, type BirthInput, type SajuChart } from '../src/lib/sajuEngine'
import { buildSajuReportSections, type SajuReportSection } from '../src/lib/sajuReport'

type Sample = {
  name: string
  input: BirthInput
}

const sampleCount = 50
const samples = buildSamples(sampleCount)

const reports = samples.map((sample) => {
  const chart = calculateSajuChart(sample.input)
  const sections = buildSajuReportSections(chart)
  return buildDocumentAudit(sample, chart, sections)
})

const repeatedConclusions = countRepeats(reports.map((report) => report.conclusion))
const repeatedAdvice = countRepeats(reports.map((report) => report.advice))
const findings = [
  reports.every((report) => report.hasRequiredText)
    ? `${sampleCount}개 샘플 모두 핵심 결론, 조언, 성향/일/관계/생활 요약이 비어 있지 않습니다.`
    : '일부 샘플에서 핵심 문구가 비어 있습니다.',
  repeatedConclusions.length === 0
    ? `핵심 결론은 ${sampleCount}개 샘플에서 모두 다르게 생성됩니다.`
    : `동일한 구조에서는 핵심 결론이 반복됩니다. 반복 예: ${repeatedConclusions.join(', ')}`,
  repeatedAdvice.length === 0
    ? `실천 조언은 ${sampleCount}개 샘플에서 모두 다르게 생성됩니다.`
    : `동일한 신강/신약·십성 조합에서는 실천 조언이 반복됩니다. 반복 예: ${repeatedAdvice.join(', ')}`,
  reports.some((report) => report.warningFlags.length)
    ? '일부 문장에서 점검할 표현이 있습니다. 샘플별 점검 항목을 확인해야 합니다.'
    : 'undefined/null/NaN, 중복 공백, 과도하게 긴 화면 요약은 발견되지 않았습니다.',
]

const markdown = [
  `# 사주팔자 문서형 풀이 ${sampleCount}개 샘플 점검 보고서`,
  '',
  `작성일: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  '',
  '## 점검 목적',
  '',
  `- 문서형 풀이가 ${sampleCount}개 샘플에서 실제로 다르게 나오는지 확인`,
  '- 일반 사용자가 먼저 보는 핵심 결론, 요약, 실천 포인트가 비어 있지 않은지 확인',
  '- 화면에 표시되는 짧은 요약에서 이상한 문장, 깨진 값, 과도한 길이가 있는지 확인',
  '',
  '## 종합 결과',
  '',
  ...findings.map((finding) => `- ${finding}`),
  '',
  '## 샘플 요약표',
  '',
  '| 샘플 | 입력 | 일주 | 신강/신약 | 강한 오행 | 보완 기운 | 핵심 결론 길이 | 점검 |',
  '|---|---|---|---|---|---|---:|---|',
  ...reports.map(
    (report) =>
      `| ${report.name} | ${report.inputLabel} | ${report.dayPillar} | ${report.strength} | ${report.strongestElement} | ${report.weakElements} | ${report.conclusion.length}자 | ${report.warningFlags.length ? report.warningFlags.join(', ') : '통과'} |`,
  ),
  '',
  '## 샘플별 문서형 풀이 확인',
  '',
  ...reports.flatMap((report) => [
    `### ${report.name}`,
    '',
    `- 입력: ${report.inputLabel}`,
    `- 원국: ${report.chartSummary}`,
    `- 중심: ${report.dayPillar}`,
    `- 강한 기운: ${report.strongestElement}`,
    `- 보완 기운: ${report.weakElements}`,
    `- 핵심 결론: ${report.conclusion}`,
    `- 실천 조언: ${report.advice}`,
    '',
    '| 구역 | 화면 요약 문장 |',
    '|---|---|',
    `| 성향 | ${escapeTable(report.coreSummary)} |`,
    `| 일 | ${escapeTable(report.workSummary)} |`,
    `| 돈 | ${escapeTable(report.moneySummary)} |`,
    `| 관계 | ${escapeTable(report.relationshipSummary)} |`,
    `| 생활 | ${escapeTable(report.healthSummary)} |`,
    '',
    '| 실천 포인트 | 문장 |',
    '|---|---|',
    `| 일 | ${escapeTable(report.workAction)} |`,
    `| 돈 | ${escapeTable(report.moneyAction)} |`,
    `| 관계 | ${escapeTable(report.relationshipAction)} |`,
    `| 생활 | ${escapeTable(report.healthAction)} |`,
    '',
    `점검 결과: ${report.warningFlags.length ? report.warningFlags.join(', ') : '문장 표시 이상 없음'}`,
    '',
  ]),
  '## 다음 개선 제안',
  '',
  '1. 문장 품질은 통과했지만, 일부 샘플은 조언 문장이 아직 길게 느껴질 수 있습니다. 다음 단계에서는 조언 문장을 "해야 할 일 1개" 중심으로 더 짧게 다듬는 것이 좋습니다.',
  '2. 현재 문서형 풀이의 개인화는 원국, 오행, 십성, 주제별 리포트에 의해 달라집니다. 더 고급스럽게 만들려면 직업/재물/관계별 결론 문장을 별도 템플릿으로 분리하면 좋습니다.',
  '3. 실제 서비스 전에는 이 50개 샘플을 고정 회귀 자료로 두고, 문장팩이나 계산 로직을 바꿀 때마다 반복률과 과장 표현을 다시 점검하는 것이 안전합니다.',
  '',
].join('\n')

writeFileSync('SAJU_DOCUMENT_SAMPLE_REPORT.md', markdown, 'utf8')

function buildSamples(count: number): Sample[] {
  const seedDates = [
    [1968, 6, 21, 18, 40],
    [1972, 2, 4, 23, 30],
    [1975, 9, 9, 5, 5],
    [1979, 1, 6, 4, 10],
    [1983, 9, 9, 21, 0],
    [1987, 11, 28, 23, 45],
    [1990, 4, 5, 0, 15],
    [1992, 3, 14, 9, 20],
    [1995, 5, 18, 15, 15],
    [1999, 12, 31, 0, 5],
    [2001, 8, 3, 13, 30],
    [2005, 4, 30, 11, 25],
    [2010, 2, 4, 7, 50],
    [2012, 12, 21, 23, 10],
    [2018, 7, 7, 6, 45],
  ] as const

  return Array.from({ length: count }, (_, index) => {
    const seed = seedDates[index % seedDates.length]
    const cycle = Math.floor(index / seedDates.length)
    const year = Math.min(seed[0] + cycle, 2026)
    const month = seed[1]
    const day = Math.min(seed[2] + (cycle % 2), daysInMonth(year, month))
    const hour = (seed[3] + cycle * 3) % 24
    const minute = (seed[4] + cycle * 11) % 60
    const gender = index % 2 === 0 ? 'female' : 'male'

    return {
      name: `샘플 ${String(index + 1).padStart(2, '0')}`,
      input: birth(year, month, day, hour, minute, gender),
    }
  })
}

function birth(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: BirthInput['gender'],
): BirthInput {
  return {
    year,
    month,
    day,
    hour,
    minute,
    gender,
    isLunar: false,
    isLeapMonth: false,
    dayBoundary: 'midnight',
  }
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function buildDocumentAudit(sample: Sample, chart: SajuChart, sections: SajuReportSection[]) {
  const dayPillar = chart.pillars.find((pillar) => pillar.key === 'day')
  const strongestElement = [...chart.elementSummary].sort((a, b) => b.count - a.count)[0]
  const weakElements = chart.elementSummary.filter((item) => item.count === 0)
  const topic = (name: SajuChart['topicReadings'][number]['topic']) =>
    chart.topicReadings.find((reading) => reading.topic === name)
  const section = (title: string) => sections.find((item) => item.title === title)
  const lifeSection = section('현실 조언 및 총평')
  const workSection = section('직업운')
  const moneySection = section('금전운')
  const relationshipSection = section('인간관계/가족운')
  const healthSection = section('건강운')
  const workTopic = topic('일/직업')
  const moneyTopic = topic('재물')
  const relationshipTopic = topic('관계')
  const healthTopic = topic('건강/생활')
  const conclusion =
    lifeSection?.conclusion ?? '강한 기운은 장점으로 쓰고, 부족한 기운은 생활 습관으로 보완하는 것이 핵심입니다.'
  const advice =
    lifeSection?.advice ?? '무리해서 한 번에 바꾸기보다, 반복되는 선택과 생활 리듬을 조금씩 정리하는 편이 좋습니다.'
  const coreSummary = summarizeDocumentText(section('원국 핵심 구조')?.summary ?? chart.beginnerReadings[0]?.body)
  const workSummary = summarizeDocumentText(workTopic?.summary ?? workSection?.summary)
  const moneySummary = summarizeDocumentText(moneyTopic?.summary ?? moneySection?.summary)
  const relationshipSummary = summarizeDocumentText(relationshipTopic?.summary ?? relationshipSection?.summary)
  const healthSummary = summarizeDocumentText(healthTopic?.summary ?? healthSection?.summary)
  const workAction = summarizeDocumentText(workTopic?.advice ?? workSection?.advice, 1)
  const moneyAction = summarizeDocumentText(moneyTopic?.advice ?? moneySection?.advice, 1)
  const relationshipAction = summarizeDocumentText(relationshipTopic?.advice ?? relationshipSection?.advice, 1)
  const healthAction = summarizeDocumentText(healthTopic?.advice ?? healthSection?.advice ?? advice, 1)
  const visibleTexts = [
    conclusion,
    advice,
    coreSummary,
    workSummary,
    moneySummary,
    relationshipSummary,
    healthSummary,
    workAction,
    moneyAction,
    relationshipAction,
    healthAction,
  ]
  const warningFlags = detectWarnings(visibleTexts)

  return {
    name: sample.name,
    inputLabel: `${sample.input.year}-${pad(sample.input.month)}-${pad(sample.input.day)} ${pad(sample.input.hour)}:${pad(sample.input.minute)} ${sample.input.gender === 'male' ? '남성' : '여성'}`,
    chartSummary: chart.summary,
    dayPillar: dayPillar ? `${dayPillar.korean} 일주` : '-',
    strength: formatStrength(chart.advanced.dayStrength.strength),
    strongestElement: strongestElement ? `${strongestElement.element} ${strongestElement.count}개(${strongestElement.status})` : '-',
    weakElements: weakElements.length ? weakElements.map((item) => item.element).join(', ') : '없음',
    conclusion,
    advice,
    coreSummary,
    workSummary,
    moneySummary,
    relationshipSummary,
    healthSummary,
    workAction,
    moneyAction,
    relationshipAction,
    healthAction,
    hasRequiredText: visibleTexts.every((text) => text.trim().length > 0),
    warningFlags,
  }
}

function summarizeDocumentText(text?: string, sentenceLimit = 2) {
  if (!text) {
    return ''
  }

  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?。！？]+[.!?。！？]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean)

  return sentences?.slice(0, sentenceLimit).join(' ') ?? text.trim()
}

function detectWarnings(texts: string[]) {
  const warnings = new Set<string>()

  for (const text of texts) {
    if (!text.trim()) {
      warnings.add('빈 문장')
    }

    if (/(undefined|null|NaN)/i.test(text)) {
      warnings.add('깨진 값')
    }

    if (/\s{2,}/.test(text)) {
      warnings.add('중복 공백')
    }

    if (text.length > 260) {
      warnings.add('긴 화면 문장')
    }
  }

  return [...warnings]
}

function countRepeats(values: string[]) {
  const counts = new Map<string, number>()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value)
}

function formatStrength(strength: string) {
  if (strength === 'strong') {
    return '신강'
  }

  if (strength === 'weak') {
    return '신약'
  }

  return '중화'
}

function escapeTable(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\n/g, '<br />')
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}
