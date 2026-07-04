import { writeFileSync } from 'node:fs'
import { calculateSaju } from 'ssaju'
import { calculateSajuChart, type BirthInput } from '../src/lib/sajuEngine'

type PillarKey = 'year' | 'month' | 'day' | 'hour'
type Sample = {
  name: string
  note: string
  input: BirthInput
}

const pillarOrder: PillarKey[] = ['year', 'month', 'day', 'hour']
const pillarLabels: Record<PillarKey, string> = {
  year: '연주',
  month: '월주',
  day: '일주',
  hour: '시주',
}
const hanjaToKorean: Record<string, string> = {
  甲: '갑',
  乙: '을',
  丙: '병',
  丁: '정',
  戊: '무',
  己: '기',
  庚: '경',
  辛: '신',
  壬: '임',
  癸: '계',
  子: '자',
  丑: '축',
  寅: '인',
  卯: '묘',
  辰: '진',
  巳: '사',
  午: '오',
  未: '미',
  申: '신',
  酉: '유',
  戌: '술',
  亥: '해',
}

const samples: Sample[] = [
  { name: '대표 01', note: '기본 남성 역행 대운', input: birth(2001, 8, 3, 13, 30, 'male') },
  { name: '대표 02', note: '여성 역행 대운', input: birth(1992, 2, 14, 6, 10, 'female') },
  { name: '대표 03', note: '윤년 2월 29일 23시대', input: birth(2024, 2, 29, 23, 30, 'female') },
  { name: '대표 04', note: '현재 기준 샘플', input: birth(2026, 7, 3, 13, 30, 'male') },
  { name: '절기 01', note: '2026 소서 직전', input: birth(2026, 7, 7, 9, 0, 'male') },
  { name: '절기 02', note: '2026 소서 직후', input: birth(2026, 7, 7, 11, 0, 'male') },
  { name: '입춘 01', note: '입춘 당일 오전', input: birth(2010, 2, 4, 7, 50, 'female') },
  { name: '입춘 02', note: '입춘 전후 대조', input: birth(1972, 2, 4, 23, 30, 'male') },
  { name: '자시 01', note: '자정 기준 23:45', input: birth(1987, 11, 28, 23, 45, 'male') },
  { name: '자시 02', note: '자정 직후 00:05', input: birth(1999, 12, 31, 0, 5, 'female') },
  { name: '대운 01', note: '남성 순행 후보', input: birth(1968, 6, 21, 18, 40, 'male') },
  { name: '대운 02', note: '여성 순행/역행 대조', input: birth(1983, 9, 9, 21, 0, 'female') },
]

const rows = samples.map(compareSample)
const totals = {
  pillars: countPass(rows, 'pillarMatch'),
  tenGods: countPass(rows, 'tenGodMatch'),
  voidBranches: countPass(rows, 'voidMatch'),
  luckDirection: countPass(rows, 'luckDirectionMatch'),
  luckStartAge: countPass(rows, 'luckStartAgeMatch'),
}

const markdown = [
  '# 자동 엔진 비교 보고서',
  '',
  `작성일: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  '',
  '## 목적',
  '',
  '우리 엔진의 만세력 계산 결과를 보조 엔진 `ssaju`와 같은 입력으로 비교한다. 이 보고서는 외부 사이트 수동 검증을 대체하지 않고, 코드 변경 때마다 빠르게 돌리는 자동 회귀 검증표로 사용한다.',
  '',
  '## 비교 범위',
  '',
  '- 사주 원국: 연주, 월주, 일주, 시주',
  '- 십성: 천간 십성, 지지 십성',
  '- 공망',
  '- 대운 방향',
  '- 대운 시작 나이',
  '- 첫 3개 대운 간지',
  '',
  '## 종합 결과',
  '',
  `- 원국 일치: ${totals.pillars}/${rows.length}`,
  `- 십성 일치: ${totals.tenGods}/${rows.length}`,
  `- 공망 일치: ${totals.voidBranches}/${rows.length}`,
  `- 대운 방향 일치: ${totals.luckDirection}/${rows.length}`,
  `- 대운 시작 나이 일치: ${totals.luckStartAge}/${rows.length}`,
  '',
  '## 샘플별 요약',
  '',
  '| 샘플 | 입력 | 비고 | 원국 | 십성 | 공망 | 대운 방향 | 대운수 | 첫 3대운 |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows.map(
    (row) =>
      `| ${row.name} | ${row.inputLabel} | ${row.note} | ${mark(row.pillarMatch)} | ${mark(row.tenGodMatch)} | ${mark(row.voidMatch)} | ${mark(row.luckDirectionMatch)} | ${mark(row.luckStartAgeMatch)} | ${mark(row.luckPillarsMatch)} |`,
  ),
  '',
  '## 차이 상세',
  '',
  ...rows.flatMap((row) => renderDetails(row)),
  '## 해석 기준',
  '',
  '- 원국과 공망은 반드시 높은 일치율을 기대한다.',
  '- 대운 시작 나이는 라이브러리별 절입시각 처리와 반올림 기준 차이로 다를 수 있으므로, 차이가 나면 기준 문서에 남긴다.',
  '- 23시대 출생은 자시 기준 선택에 따라 일주와 시주가 달라질 수 있으므로, 비교 입력은 기본 자정 기준으로 고정한다.',
  '- 이 자동 비교는 `ssaju`와의 코드 대조이며, 실제 출시 전에는 외부 만세력 사이트 2곳 이상과 수동 표본 검증을 추가한다.',
  '',
].join('\n')

writeFileSync('ENGINE_COMPARISON_AUTOMATED_REPORT.md', markdown, 'utf8')

function compareSample(sample: Sample) {
  const ours = calculateSajuChart(sample.input)
  const ssaju = calculateSaju({
    year: sample.input.year,
    month: sample.input.month,
    day: sample.input.day,
    hour: sample.input.hour,
    minute: sample.input.minute,
    gender: sample.input.gender === 'male' ? '남' : '여',
    calendar: sample.input.isLunar ? 'lunar' : 'solar',
    leap: Boolean(sample.input.isLeapMonth),
    timezone: 'Asia/Seoul',
  })
  const oursPillars = Object.fromEntries(ours.pillars.map((pillar) => [pillar.key, pillar.korean])) as Record<PillarKey, string>
  const oursTenGods = Object.fromEntries(
    ours.pillars.map((pillar) => [pillar.key, `${pillar.stemTenGod}/${pillar.branchTenGod}`]),
  ) as Record<PillarKey, string>
  const ssajuPillars = Object.fromEntries(pillarOrder.map((key) => [key, normalizeGanzhi(ssaju.pillars[key])])) as Record<PillarKey, string>
  const ssajuTenGods = Object.fromEntries(
    pillarOrder.map((key) => [key, `${normalizeTenGod(ssaju.tenGods[key].stem)}/${normalizeTenGod(ssaju.tenGods[key].branch)}`]),
  ) as Record<PillarKey, string>
  const oursLuckPillars = ours.luck.pillars.slice(0, 3).map((pillar) => pillar.korean)
  const ssajuLuckPillars = ssaju.daeun.list.slice(0, 3).map((pillar) => normalizeGanzhi(pillar.ganzhi))
  const ssajuDirection = normalizeDirection(ssaju.daeun.basis.direction)

  return {
    name: sample.name,
    note: sample.note,
    inputLabel: formatInput(sample.input),
    oursPillars,
    ssajuPillars,
    pillarMatch: samePillarMap(oursPillars, ssajuPillars),
    oursTenGods,
    ssajuTenGods,
    tenGodMatch: samePillarMap(oursTenGods, ssajuTenGods),
    oursVoid: ours.voidBranches.join(','),
    ssajuVoid: ssaju.gongmang.branchesKo.join(','),
    voidMatch: ours.voidBranches.join(',') === ssaju.gongmang.branchesKo.join(','),
    oursLuckDirection: ours.luck.direction,
    ssajuLuckDirection: ssajuDirection,
    luckDirectionMatch: ours.luck.direction === ssajuDirection,
    oursLuckStartAge: ours.luck.startAge,
    ssajuLuckStartAge: ssaju.daeun.startAge,
    luckStartAgeMatch: ours.luck.startAge === ssaju.daeun.startAge,
    oursLuckPillars,
    ssajuLuckPillars,
    luckPillarsMatch: oursLuckPillars.join(',') === ssajuLuckPillars.join(','),
  }
}

function renderDetails(row: ReturnType<typeof compareSample>) {
  const issues = [
    row.pillarMatch ? '' : formatPillarDiff('원국', row.oursPillars, row.ssajuPillars),
    row.tenGodMatch ? '' : formatPillarDiff('십성', row.oursTenGods, row.ssajuTenGods),
    row.voidMatch ? '' : `- 공망: ours=${row.oursVoid || '-'} / ssaju=${row.ssajuVoid || '-'}`,
    row.luckDirectionMatch ? '' : `- 대운 방향: ours=${row.oursLuckDirection} / ssaju=${row.ssajuLuckDirection}`,
    row.luckStartAgeMatch ? '' : `- 대운수: ours=${row.oursLuckStartAge ?? '-'} / ssaju=${row.ssajuLuckStartAge ?? '-'}`,
    row.luckPillarsMatch ? '' : `- 첫 3대운: ours=${row.oursLuckPillars.join(',')} / ssaju=${row.ssajuLuckPillars.join(',')}`,
  ].filter(Boolean)

  if (!issues.length) {
    return [`### ${row.name}`, '', '차이 없음.', '']
  }

  return [`### ${row.name}`, '', ...issues, '']
}

function formatPillarDiff(title: string, ours: Record<PillarKey, string>, ssaju: Record<PillarKey, string>) {
  const lines = pillarOrder
    .filter((key) => ours[key] !== ssaju[key])
    .map((key) => `  - ${pillarLabels[key]}: ours=${ours[key] ?? '-'} / ssaju=${ssaju[key] ?? '-'}`)

  return [`- ${title}`, ...lines].join('\n')
}

function normalizeGanzhi(value: string) {
  return value
    .split('')
    .map((char) => hanjaToKorean[char] ?? char)
    .join('')
}

function normalizeTenGod(value: string) {
  return value.replace(/[()]/g, '')
}

function normalizeDirection(value: string) {
  if (value === 'forward') {
    return '순행'
  }

  if (value === 'backward') {
    return '역행'
  }

  return value
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

function countPass(rows: Array<ReturnType<typeof compareSample>>, key: keyof ReturnType<typeof compareSample>) {
  return rows.filter((row) => row[key] === true).length
}

function mark(value: boolean) {
  return value ? '일치' : '차이'
}

function samePillarMap(left: Record<PillarKey, string>, right: Record<PillarKey, string>) {
  return pillarOrder.every((key) => left[key] === right[key])
}

function formatInput(input: BirthInput) {
  return `${input.year}-${pad(input.month)}-${pad(input.day)} ${pad(input.hour)}:${pad(input.minute)} ${input.gender === 'male' ? '남성' : '여성'}`
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}
