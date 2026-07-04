import {
  calculateFourPillars,
  getBranchTenGod,
  getSolarTermsOfYear,
  getTenGod,
  lunarToSolar,
  type DayBoundary,
  type EarthlyBranch,
  type FiveElement,
  type Gender,
  type HeavenlyStem,
} from 'manseryeok'
import { calculateSaju } from 'ssaju'
import { getConditionalAdvice, type ConditionalAdviceStrength } from './conditionalAdvicePack'

export type BirthInput = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender
  isLunar?: boolean
  isLeapMonth?: boolean
  dayBoundary?: DayBoundary
}

export type PillarKey = 'year' | 'month' | 'day' | 'hour'

export type HiddenStemReading = {
  stem: HeavenlyStem
  tenGod: string
}

export type TwelveLifeStage =
  | '장생'
  | '목욕'
  | '관대'
  | '건록'
  | '제왕'
  | '쇠'
  | '병'
  | '사'
  | '묘'
  | '절'
  | '태'
  | '양'

export type TwelveGodStar =
  | '지살'
  | '연살'
  | '월살'
  | '망신살'
  | '장성살'
  | '반안살'
  | '역마살'
  | '육해살'
  | '화개살'
  | '겁살'
  | '재살'
  | '천살'

export type SpecialStarName =
  | '현침살'
  | '정록'
  | '역마살'
  | '백호대살'
  | '천을귀인'
  | '문창귀인'
  | '금여성'
  | '태극귀인'
  | '화개살'
  | '괴강살'
  | '천문성'
  | '도화살'
  | '홍염살'
  | '공망'
  | '양인살'
  | '귀문관살'
  | '천라지망'
  | '고신살'
  | '과숙살'

export type SpecialStarCategory = '길성' | '신살'
export type ConfidenceLevel = 'core' | 'reference'

export type SpecialStarReading = {
  name: SpecialStarName
  category: SpecialStarCategory
  level: ConfidenceLevel
  pillarKeys: PillarKey[]
  reason: string
}

export type RelationType =
  | '천간합'
  | '천간충'
  | '지지육합'
  | '지지삼합'
  | '지지방합'
  | '지지충'
  | '지지형'
  | '지지파'
  | '지지해'
  | '원진'

export type RelationFinding = {
  type: RelationType
  label: string
  level: ConfidenceLevel
  pillarKeys: PillarKey[]
  members: string[]
  transformsTo?: FiveElement
}

export type PillarReading = {
  key: PillarKey
  label: string
  korean: string
  hanja: string
  stem: HeavenlyStem
  branch: EarthlyBranch
  stemElement: FiveElement
  branchElement: FiveElement
  stemYinYang: string
  branchYinYang: string
  stemTenGod: string
  branchTenGod: string
  hiddenStems: HiddenStemReading[]
  twelveLifeStage: TwelveLifeStage
  twelveGodStar: TwelveGodStar
  specialStars: SpecialStarName[]
}

export type ElementSummary = {
  element: FiveElement
  count: number
  percentage: number
  status: '부족' | '적정' | '과다'
}

export type AdvancedAnalysis = {
  dayStrength: {
    strength: string
    score: number
  }
  geukguk: string
  yongsin: string[]
  interpretation: string
}

export type FlowFortune = {
  label: string
  ganzhi: string
  stemTenGod: string
  branchTenGod: string
  twelveLifeStage: string
}

export type BeginnerReading = {
  title: string
  body: string
  basis: string
}

export type TopicReading = {
  topic: '성격' | '일/직업' | '재물' | '관계' | '건강/생활'
  summary: string
  advice: string
  basis: string
}

export type SajuChart = {
  input: BirthInput
  summary: string
  pillars: PillarReading[]
  voidBranches: EarthlyBranch[]
  elementSummary: ElementSummary[]
  relations: RelationFinding[]
  summaryRelations: RelationFinding[]
  detailRelations: RelationFinding[]
  specialStars: SpecialStarReading[]
  coreSpecialStars: SpecialStarReading[]
  referenceSpecialStars: SpecialStarReading[]
  advanced: AdvancedAnalysis
  beginnerReadings: BeginnerReading[]
  topicReadings: TopicReading[]
  yearlyFortunes: FlowFortune[]
  monthlyFortunes: FlowFortune[]
  luck: {
    direction: '순행' | '역행'
    startAge: number | null
    basis: {
      yearStem: HeavenlyStem
      yearStemYinYang: string
      gender: Gender
      directionReason: string
      startAgeReason: string
      boundaryNotice: string
      referenceTermName: string | null
      referenceTermTime: string | null
      birthTime: string | null
      timeDifference: string | null
      preciseStart: string | null
    }
    pillars: Array<{
      age: number
      korean: string
      stem: HeavenlyStem
      branch: EarthlyBranch
      stemTenGod: string
      branchTenGod: string
      twelveLifeStage: TwelveLifeStage
    }>
  }
}

const pillarLabels: Record<PillarKey, string> = {
  year: '연주',
  month: '월주',
  day: '일주',
  hour: '시주',
}

const elements: FiveElement[] = ['목', '화', '토', '금', '수']

const stemYinYang: Record<HeavenlyStem, string> = {
  갑: '양',
  을: '음',
  병: '양',
  정: '음',
  무: '양',
  기: '음',
  경: '양',
  신: '음',
  임: '양',
  계: '음',
}

const hiddenStemByBranch: Record<EarthlyBranch, HeavenlyStem[]> = {
  자: ['임', '계'],
  축: ['계', '신', '기'],
  인: ['무', '병', '갑'],
  묘: ['갑', '을'],
  진: ['을', '계', '무'],
  사: ['무', '경', '병'],
  오: ['병', '기', '정'],
  미: ['정', '을', '기'],
  신: ['무', '임', '경'],
  유: ['경', '신'],
  술: ['신', '정', '무'],
  해: ['무', '갑', '임'],
}

const twelveLifeStageByStem: Record<HeavenlyStem, Record<EarthlyBranch, TwelveLifeStage>> = {
  갑: { 해: '장생', 자: '목욕', 축: '관대', 인: '건록', 묘: '제왕', 진: '쇠', 사: '병', 오: '사', 미: '묘', 신: '절', 유: '태', 술: '양' },
  을: { 오: '장생', 사: '목욕', 진: '관대', 묘: '건록', 인: '제왕', 축: '쇠', 자: '병', 해: '사', 술: '묘', 유: '절', 신: '태', 미: '양' },
  병: { 인: '장생', 묘: '목욕', 진: '관대', 사: '건록', 오: '제왕', 미: '쇠', 신: '병', 유: '사', 술: '묘', 해: '절', 자: '태', 축: '양' },
  정: { 유: '장생', 신: '목욕', 미: '관대', 오: '건록', 사: '제왕', 진: '쇠', 묘: '병', 인: '사', 축: '묘', 자: '절', 해: '태', 술: '양' },
  무: { 인: '장생', 묘: '목욕', 진: '관대', 사: '건록', 오: '제왕', 미: '쇠', 신: '병', 유: '사', 술: '묘', 해: '절', 자: '태', 축: '양' },
  기: { 유: '장생', 신: '목욕', 미: '관대', 오: '건록', 사: '제왕', 진: '쇠', 묘: '병', 인: '사', 축: '묘', 자: '절', 해: '태', 술: '양' },
  경: { 사: '장생', 오: '목욕', 미: '관대', 신: '건록', 유: '제왕', 술: '쇠', 해: '병', 자: '사', 축: '묘', 인: '절', 묘: '태', 진: '양' },
  신: { 자: '장생', 해: '목욕', 술: '관대', 유: '건록', 신: '제왕', 미: '쇠', 오: '병', 사: '사', 진: '묘', 묘: '절', 인: '태', 축: '양' },
  임: { 신: '장생', 유: '목욕', 술: '관대', 해: '건록', 자: '제왕', 축: '쇠', 인: '병', 묘: '사', 진: '묘', 사: '절', 오: '태', 미: '양' },
  계: { 묘: '장생', 인: '목욕', 축: '관대', 자: '건록', 해: '제왕', 술: '쇠', 유: '병', 신: '사', 미: '묘', 오: '절', 사: '태', 진: '양' },
}

const twelveGodStarGroups: Array<{
  base: EarthlyBranch[]
  stars: Record<EarthlyBranch, TwelveGodStar>
}> = [
  {
    base: ['인', '오', '술'],
    stars: { 인: '지살', 묘: '연살', 진: '월살', 사: '망신살', 오: '장성살', 미: '반안살', 신: '역마살', 유: '육해살', 술: '화개살', 해: '겁살', 자: '재살', 축: '천살' },
  },
  {
    base: ['사', '유', '축'],
    stars: { 사: '지살', 오: '연살', 미: '월살', 신: '망신살', 유: '장성살', 술: '반안살', 해: '역마살', 자: '육해살', 축: '화개살', 인: '겁살', 묘: '재살', 진: '천살' },
  },
  {
    base: ['신', '자', '진'],
    stars: { 신: '지살', 유: '연살', 술: '월살', 해: '망신살', 자: '장성살', 축: '반안살', 인: '역마살', 묘: '육해살', 진: '화개살', 사: '겁살', 오: '재살', 미: '천살' },
  },
  {
    base: ['해', '묘', '미'],
    stars: { 해: '지살', 자: '연살', 축: '월살', 인: '망신살', 묘: '장성살', 진: '반안살', 사: '역마살', 오: '육해살', 미: '화개살', 신: '겁살', 유: '재살', 술: '천살' },
  },
]

const pairRelations: Array<{
  type: RelationType
  pairs: string[][]
  transformsTo?: FiveElement
}> = [
  { type: '천간합', pairs: [['갑', '기'], ['을', '경'], ['병', '신'], ['정', '임'], ['무', '계']] },
  { type: '천간충', pairs: [['갑', '경'], ['을', '신'], ['병', '임'], ['정', '계']] },
  { type: '지지육합', pairs: [['자', '축'], ['인', '해'], ['묘', '술'], ['진', '유'], ['사', '신'], ['오', '미']] },
  { type: '지지충', pairs: [['자', '오'], ['축', '미'], ['인', '신'], ['묘', '유'], ['진', '술'], ['사', '해']] },
  { type: '지지파', pairs: [['자', '유'], ['축', '진'], ['인', '해'], ['묘', '오'], ['사', '신'], ['술', '미']] },
  { type: '지지해', pairs: [['자', '미'], ['축', '오'], ['인', '사'], ['묘', '진'], ['신', '해'], ['유', '술']] },
  { type: '원진', pairs: [['자', '미'], ['축', '오'], ['인', '유'], ['묘', '신'], ['진', '해'], ['사', '술']] },
]

const tripleRelations: Array<{
  type: RelationType
  members: EarthlyBranch[]
  transformsTo: FiveElement
}> = [
  { type: '지지삼합', members: ['신', '자', '진'], transformsTo: '수' },
  { type: '지지삼합', members: ['인', '오', '술'], transformsTo: '화' },
  { type: '지지삼합', members: ['해', '묘', '미'], transformsTo: '목' },
  { type: '지지삼합', members: ['사', '유', '축'], transformsTo: '금' },
  { type: '지지방합', members: ['인', '묘', '진'], transformsTo: '목' },
  { type: '지지방합', members: ['사', '오', '미'], transformsTo: '화' },
  { type: '지지방합', members: ['신', '유', '술'], transformsTo: '금' },
  { type: '지지방합', members: ['해', '자', '축'], transformsTo: '수' },
]

const branchPunishmentSets: EarthlyBranch[][] = [
  ['인', '사', '신'],
  ['축', '술', '미'],
  ['자', '묘'],
  ['진', '진'],
  ['오', '오'],
  ['유', '유'],
  ['해', '해'],
]

const noblemanBranchesByStem: Record<HeavenlyStem, EarthlyBranch[]> = {
  갑: ['축', '미'],
  을: ['자', '신'],
  병: ['해', '유'],
  정: ['해', '유'],
  무: ['축', '미'],
  기: ['자', '신'],
  경: ['축', '미'],
  신: ['인', '오'],
  임: ['사', '묘'],
  계: ['사', '묘'],
}

const taegukBranchesByStem: Record<HeavenlyStem, EarthlyBranch[]> = {
  갑: ['자', '오'],
  을: ['자', '오'],
  병: ['묘', '유'],
  정: ['묘', '유'],
  무: ['진', '술', '축', '미'],
  기: ['진', '술', '축', '미'],
  경: ['인', '해'],
  신: ['인', '해'],
  임: ['사', '신'],
  계: ['사', '신'],
}

const geumyeoBranchByStem: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '진',
  을: '사',
  병: '미',
  정: '신',
  무: '미',
  기: '신',
  경: '술',
  신: '해',
  임: '축',
  계: '인',
}

const officialProsperityBranchByStem: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '인',
  을: '묘',
  병: '사',
  정: '오',
  무: '사',
  기: '오',
  경: '신',
  신: '유',
  임: '해',
  계: '자',
}

const literaryTalentBranchByStem: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '사',
  을: '오',
  병: '신',
  정: '유',
  무: '신',
  기: '유',
  경: '해',
  신: '자',
  임: '인',
  계: '묘',
}

const charmBranchByStem: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '오',
  을: '오',
  병: '인',
  정: '미',
  무: '진',
  기: '진',
  경: '술',
  신: '유',
  임: '자',
  계: '신',
}

const bladeBranchByStem: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
  갑: '묘',
  병: '오',
  무: '오',
  경: '유',
  임: '자',
}

const branchGroupRules: Array<{
  bases: EarthlyBranch[]
  peach: EarthlyBranch
  lonely: EarthlyBranch
  solitary: EarthlyBranch
  travel: EarthlyBranch
  storage: EarthlyBranch
}> = [
  { bases: ['신', '자', '진'], peach: '유', lonely: '인', solitary: '축', travel: '인', storage: '진' },
  { bases: ['인', '오', '술'], peach: '묘', lonely: '신', solitary: '미', travel: '신', storage: '술' },
  { bases: ['사', '유', '축'], peach: '오', lonely: '해', solitary: '술', travel: '해', storage: '축' },
  { bases: ['해', '묘', '미'], peach: '자', lonely: '사', solitary: '진', travel: '사', storage: '미' },
]

const ghostGatePairs: EarthlyBranch[][] = [
  ['자', '유'],
  ['축', '오'],
  ['인', '미'],
  ['묘', '신'],
  ['진', '해'],
  ['사', '술'],
]

const netPairs: EarthlyBranch[][] = [
  ['술', '해'],
  ['진', '사'],
]

const whiteTigerGanzhi = new Set(['갑진', '을미', '병술', '정축', '무진', '임술', '계축'])
const commandingGanzhi = new Set(['무진', '무술', '경진', '경술', '임진', '임술'])
const needleGanzhi = new Set(['갑신', '갑오', '신묘'])
const heavenlyGateBranches = new Set<EarthlyBranch>(['묘', '미', '술', '해'])

export function calculateSajuChart(input: BirthInput): SajuChart {
  const result = calculateFourPillars({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    isLunar: input.isLunar,
    isLeapMonth: input.isLunar ? input.isLeapMonth : false,
    dayBoundary: input.dayBoundary ?? 'midnight',
  })
  const ssajuResult = calculateSaju({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender === 'male' ? '남' : '여',
    calendar: input.isLunar ? 'lunar' : 'solar',
    leap: Boolean(input.isLeapMonth),
    timezone: 'Asia/Seoul',
  })

  const korean = result.toObject()
  const hanja = result.toHanjaObject()
  const dayMaster = result.day.heavenlyStem
  const yearBranch = result.year.earthlyBranch
  const dayBranch = result.day.earthlyBranch
  const dayGanzhi = korean.day
  const allBranches = (Object.keys(pillarLabels) as PillarKey[]).map((key) => result[key].earthlyBranch)

  const pillars: PillarReading[] = (Object.keys(pillarLabels) as PillarKey[]).map((key) => ({
    key,
    label: pillarLabels[key],
    korean: korean[key],
    hanja: hanja[key].hanja,
    stem: result[key].heavenlyStem,
    branch: result[key].earthlyBranch,
    stemElement: result[`${key}Element`].stem,
    branchElement: result[`${key}Element`].branch,
    stemYinYang: result[`${key}YinYang`].stem,
    branchYinYang: result[`${key}YinYang`].branch,
    stemTenGod: result.tenGods[key].stem,
    branchTenGod: result.tenGods[key].branch,
    hiddenStems: getHiddenStemReadings(result[key].earthlyBranch, dayMaster),
    twelveLifeStage: getTwelveLifeStage(dayMaster, result[key].earthlyBranch),
    twelveGodStar: getTwelveGodStar(yearBranch, result[key].earthlyBranch),
    specialStars: getSpecialStarNames({
      dayMaster,
      dayGanzhi,
      yearBranch,
      dayBranch,
      allBranches,
      voidBranches: result.voidBranches,
      pillarKey: key,
      ganzhi: korean[key],
      stem: result[key].heavenlyStem,
      branch: result[key].earthlyBranch,
      twelveGodStar: getTwelveGodStar(yearBranch, result[key].earthlyBranch),
    }),
  }))

  const relations = findRelations(pillars)
  const specialStars = summarizeSpecialStars(pillars)
  const elementSummary = summarizeElements(pillars)
  const advanced = {
    dayStrength: ssajuResult.advanced.dayStrength,
    geukguk: ssajuResult.advanced.geukguk,
    yongsin: ssajuResult.advanced.yongsin,
    interpretation: ssajuResult.advanced.interpretation,
  }

  return {
    input,
    summary: result.toString(),
    pillars,
    voidBranches: result.voidBranches,
    elementSummary,
    relations,
    summaryRelations: relations.filter((relation) => relation.level === 'core'),
    detailRelations: relations,
    specialStars,
    coreSpecialStars: specialStars.filter((star) => star.level === 'core'),
    referenceSpecialStars: specialStars.filter((star) => star.level === 'reference'),
    advanced,
    beginnerReadings: buildBeginnerReadings({
      dayMaster,
      dayPillar: korean.day,
      elementSummary,
      advanced,
      luckDirection: result.luckPillars?.forward ? '순행' : '역행',
      luckStartAge: result.luckPillars?.startAge ?? null,
    }),
    topicReadings: buildTopicReadings({
      dayMaster,
      pillars,
      elementSummary,
      advanced,
      coreSpecialStars: specialStars.filter((star) => star.level === 'core'),
      referenceSpecialStars: specialStars.filter((star) => star.level === 'reference'),
    }),
    yearlyFortunes: ssajuResult.seyun.slice(0, 10).map((item) => ({
      label: `${item.year}년`,
      ganzhi: item.ganzhi,
      stemTenGod: item.tenGodStem,
      branchTenGod: item.tenGodBranch,
      twelveLifeStage: item.stage12,
    })),
    monthlyFortunes: ssajuResult.wolun.map((item) => ({
      label: item.monthName,
      ganzhi: item.ganzhi,
      stemTenGod: item.stemTenGod,
      branchTenGod: item.branchTenGod,
      twelveLifeStage: item.stage12,
    })),
    luck: {
      direction: result.luckPillars?.forward ? '순행' : '역행',
      startAge: result.luckPillars?.startAge ?? null,
      basis: buildLuckBasis({
        input,
        yearStem: result.year.heavenlyStem,
        gender: input.gender,
        forward: Boolean(result.luckPillars?.forward),
        startAge: result.luckPillars?.startAge ?? null,
        startYears: result.luckPillars?.startYears ?? null,
        startMonths: result.luckPillars?.startMonths ?? null,
        startDays: result.luckPillars?.startDays ?? null,
      }),
      pillars:
        result.luckPillars?.pillars.map((luck) => ({
          age: luck.age,
          korean: luck.korean,
          stem: luck.pillar.heavenlyStem,
          branch: luck.pillar.earthlyBranch,
          stemTenGod: getTenGod(dayMaster, luck.pillar.heavenlyStem),
          branchTenGod: getBranchTenGod(dayMaster, luck.pillar.earthlyBranch),
          twelveLifeStage: getTwelveLifeStage(dayMaster, luck.pillar.earthlyBranch),
        })) ?? [],
    },
  }
}

function buildLuckBasis({
  input,
  yearStem,
  gender,
  forward,
  startAge,
  startYears,
  startMonths,
  startDays,
}: {
  input: BirthInput
  yearStem: HeavenlyStem
  gender: Gender
  forward: boolean
  startAge: number | null
  startYears: number | null
  startMonths: number | null
  startDays: number | null
}): SajuChart['luck']['basis'] {
  const yearStemYinYang = stemYinYang[yearStem]
  const genderLabel = gender === 'male' ? '남성' : '여성'
  const directionRule = forward ? '양년 남성 또는 음년 여성' : '음년 남성 또는 양년 여성'
  const termBasis = getLuckTermBasis(input, forward)
  const preciseStart =
    startYears === null || startMonths === null || startDays === null
      ? null
      : `${startYears}년 ${startMonths}개월 ${startDays}일`

  return {
    yearStem,
    yearStemYinYang,
    gender,
    directionReason: `${yearStem}${yearStemYinYang}년 ${genderLabel}은 ${directionRule} 기준으로 대운이 ${
      forward ? '순행' : '역행'
    }합니다.`,
    startAgeReason:
      startAge === null
        ? '대운 시작 나이는 외부 만세력 계산 결과가 없어 표시하지 못했습니다.'
        : `첫 대운은 ${termBasis?.term.name ?? '인접 절기'} 절입시각과 출생시각의 차이를 바탕으로 만 ${startAge}세 전후부터 시작되는 것으로 계산했습니다.`,
    boundaryNotice:
      '입춘, 경칩, 소서, 입추 같은 절입시각 가까이에 태어난 경우 월주와 대운 시작 나이가 크게 달라질 수 있습니다.',
    referenceTermName: termBasis?.term.name ?? null,
    referenceTermTime: termBasis ? formatKstDateTime(termBasis.term.date) : null,
    birthTime: termBasis ? formatKstDateTime(termBasis.birthDate) : null,
    timeDifference: termBasis ? formatDuration(termBasis.diffMs) : null,
    preciseStart,
  }
}

function getLuckTermBasis(input: BirthInput, forward: boolean) {
  const solarDate = input.isLunar
    ? lunarToSolar(input.year, input.month, input.day, Boolean(input.isLeapMonth))
    : { year: input.year, month: input.month, day: input.day }
  const birthDate = new Date(Date.UTC(solarDate.year, solarDate.month - 1, solarDate.day, input.hour - 9, input.minute))
  const birthMs = birthDate.getTime()
  const terms = [solarDate.year - 1, solarDate.year, solarDate.year + 1]
    .flatMap((year) => getSolarTermsOfYear(year))
    .filter((term) => term.index % 2 === 0)
    .sort((left, right) => left.date.getTime() - right.date.getTime())
  const term = forward
    ? terms.find((item) => item.date.getTime() > birthMs)
    : [...terms].reverse().find((item) => item.date.getTime() <= birthMs)

  if (!term) {
    return null
  }

  return {
    term,
    birthDate,
    diffMs: Math.abs(term.date.getTime() - birthMs),
  }
}

const kstDateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatKstDateTime(date: Date) {
  return kstDateTimeFormatter.format(date).replace(/\.\s?/g, '. ').replace(/\s+/g, ' ').trim()
}

function formatDuration(ms: number) {
  const totalMinutes = Math.round(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  return `${days}일 ${hours}시간 ${minutes}분`
}

export function getHiddenStemReadings(
  branch: EarthlyBranch,
  dayMaster: HeavenlyStem,
): HiddenStemReading[] {
  return hiddenStemByBranch[branch].map((stem) => ({
    stem,
    tenGod: getTenGod(dayMaster, stem),
  }))
}

export function getTwelveLifeStage(
  dayMaster: HeavenlyStem,
  branch: EarthlyBranch,
): TwelveLifeStage {
  return twelveLifeStageByStem[dayMaster][branch]
}

export function getTwelveGodStar(
  yearBranch: EarthlyBranch,
  targetBranch: EarthlyBranch,
): TwelveGodStar {
  const group = twelveGodStarGroups.find((item) => item.base.includes(yearBranch))

  if (!group) {
    throw new Error(`Cannot resolve twelve god star group for ${yearBranch}`)
  }

  return group.stars[targetBranch]
}

export function findRelations(pillars: PillarReading[]): RelationFinding[] {
  return [
    ...findPairRelations(pillars),
    ...findTripleRelations(pillars),
    ...findPunishments(pillars),
  ]
}

export function getSpecialStarNames({
  dayMaster,
  dayGanzhi,
  yearBranch,
  dayBranch,
  allBranches,
  voidBranches,
  pillarKey,
  ganzhi,
  stem,
  branch,
}: {
  dayMaster: HeavenlyStem
  dayGanzhi: string
  yearBranch: EarthlyBranch
  dayBranch: EarthlyBranch
  allBranches: EarthlyBranch[]
  voidBranches: EarthlyBranch[]
  pillarKey: PillarKey
  ganzhi: string
  stem: HeavenlyStem
  branch: EarthlyBranch
  twelveGodStar: TwelveGodStar
}): SpecialStarName[] {
  const stars = new Set<SpecialStarName>()

  if (stem === '갑' || stem === '신' || branch === '묘' || branch === '오' || branch === '신') {
    stars.add('현침살')
  }

  if (needleGanzhi.has(ganzhi)) {
    stars.add('현침살')
  }

  if (officialProsperityBranchByStem[dayMaster] === branch) {
    stars.add('정록')
  }

  if (literaryTalentBranchByStem[dayMaster] === branch) {
    stars.add('문창귀인')
  }

  // 역마살: 연지 또는 일지 삼합 기준 (전통 규칙)
  if (matchesBranchGroupRule(yearBranch, branch, 'travel') || matchesBranchGroupRule(dayBranch, branch, 'travel')) {
    stars.add('역마살')
  }

  if (whiteTigerGanzhi.has(dayGanzhi) && (pillarKey === 'day' || whiteTigerGanzhi.has(ganzhi))) {
    stars.add('백호대살')
  }

  if (noblemanBranchesByStem[dayMaster].includes(branch)) {
    stars.add('천을귀인')
  }

  if (geumyeoBranchByStem[dayMaster] === branch) {
    stars.add('금여성')
  }

  if (taegukBranchesByStem[dayMaster].includes(branch)) {
    stars.add('태극귀인')
  }

  // 화개살: 연지 또는 일지 삼합 기준 (전통 규칙)
  if (matchesBranchGroupRule(yearBranch, branch, 'storage') || matchesBranchGroupRule(dayBranch, branch, 'storage')) {
    stars.add('화개살')
  }

  if (commandingGanzhi.has(ganzhi)) {
    stars.add('괴강살')
  }

  // 천문성: 일지·시지에 있을 때만 인정
  if (heavenlyGateBranches.has(branch) && (pillarKey === 'day' || pillarKey === 'hour')) {
    stars.add('천문성')
  }

  if (matchesBranchGroupRule(yearBranch, branch, 'peach') || matchesBranchGroupRule(dayBranch, branch, 'peach')) {
    stars.add('도화살')
  }

  if (charmBranchByStem[dayMaster] === branch) {
    stars.add('홍염살')
  }

  if (voidBranches.includes(branch)) {
    stars.add('공망')
  }

  if (bladeBranchByStem[dayMaster] === branch) {
    stars.add('양인살')
  }

  if (hasBranchPair(allBranches, branch, ghostGatePairs)) {
    stars.add('귀문관살')
  }

  if (hasBranchPair(allBranches, branch, netPairs)) {
    stars.add('천라지망')
  }

  if (matchesBranchGroupRule(yearBranch, branch, 'lonely') || matchesBranchGroupRule(dayBranch, branch, 'lonely')) {
    stars.add('고신살')
  }

  if (matchesBranchGroupRule(yearBranch, branch, 'solitary') || matchesBranchGroupRule(dayBranch, branch, 'solitary')) {
    stars.add('과숙살')
  }

  return [...stars]
}

function matchesBranchGroupRule(
  baseBranch: EarthlyBranch,
  targetBranch: EarthlyBranch,
  key: 'peach' | 'lonely' | 'solitary' | 'travel' | 'storage',
) {
  return branchGroupRules.some((rule) => rule.bases.includes(baseBranch) && rule[key] === targetBranch)
}

function hasBranchPair(
  allBranches: EarthlyBranch[],
  targetBranch: EarthlyBranch,
  pairs: EarthlyBranch[][],
) {
  return pairs.some(
    ([first, second]) =>
      (targetBranch === first && allBranches.includes(second)) ||
      (targetBranch === second && allBranches.includes(first)),
  )
}

function summarizeSpecialStars(pillars: PillarReading[]): SpecialStarReading[] {
  const byName = new Map<SpecialStarName, PillarKey[]>()

  for (const pillar of pillars) {
    for (const star of pillar.specialStars) {
      byName.set(star, [...(byName.get(star) ?? []), pillar.key])
    }
  }

  return [...byName.entries()].map(([name, pillarKeys]) => ({
    name,
    category: getSpecialStarCategory(name),
    level: getSpecialStarLevel(name),
    pillarKeys,
    reason: `${pillarKeys.map((key) => pillarLabels[key]).join(', ')}에서 감지`,
  }))
}

function getSpecialStarCategory(name: SpecialStarName): SpecialStarCategory {
  return ['정록', '천을귀인', '문창귀인', '금여성', '태극귀인', '천문성'].includes(name)
    ? '길성'
    : '신살'
}

function getSpecialStarLevel(name: SpecialStarName): ConfidenceLevel {
  return ['천을귀인', '화개살', '백호대살', '괴강살', '공망', '양인살', '귀문관살', '천라지망'].includes(name)
    ? 'core'
    : 'reference'
}

function getRelationLevel(type: RelationType): ConfidenceLevel {
  return ['천간합', '천간충', '지지육합', '지지삼합', '지지방합', '지지충', '원진'].includes(type)
    ? 'core'
    : 'reference'
}

function findPairRelations(pillars: PillarReading[]): RelationFinding[] {
  const findings: RelationFinding[] = []

  for (const relation of pairRelations) {
    for (const pair of relation.pairs) {
      const matches = pillars.filter((pillar) => {
        const value = relation.type.startsWith('천간') ? pillar.stem : pillar.branch
        return pair.includes(value)
      })

      const uniqueMembers = new Set(
        matches.map((pillar) => (relation.type.startsWith('천간') ? pillar.stem : pillar.branch)),
      )

      if (uniqueMembers.size === pair.length) {
        findings.push({
          type: relation.type,
          label: `${pair.join('')} ${relation.type}`,
          level: getRelationLevel(relation.type),
          pillarKeys: matches.map((pillar) => pillar.key),
          members: pair,
          transformsTo: relation.transformsTo,
        })
      }
    }
  }

  return findings
}

function findTripleRelations(pillars: PillarReading[]): RelationFinding[] {
  const findings: RelationFinding[] = []

  for (const relation of tripleRelations) {
    const matches = pillars.filter((pillar) => relation.members.includes(pillar.branch))
    const uniqueMembers = new Set(matches.map((pillar) => pillar.branch))

    if (uniqueMembers.size === relation.members.length) {
      findings.push({
        type: relation.type,
        label: `${relation.members.join('')} ${relation.type}`,
        level: getRelationLevel(relation.type),
        pillarKeys: matches.map((pillar) => pillar.key),
        members: relation.members,
        transformsTo: relation.transformsTo,
      })
    }
  }

  return findings
}

function findPunishments(pillars: PillarReading[]): RelationFinding[] {
  const findings: RelationFinding[] = []

  for (const members of branchPunishmentSets) {
    const matches = pillars.filter((pillar) => members.includes(pillar.branch))
    const uniqueMembers = new Set(matches.map((pillar) => pillar.branch))
    const isSelfPunishment = members[0] === members[1]
    const matched = isSelfPunishment ? matches.length >= 2 : uniqueMembers.size === new Set(members).size

    if (matched) {
      findings.push({
        type: '지지형',
        label: `${[...new Set(members)].join('')} 지지형`,
        level: getRelationLevel('지지형'),
        pillarKeys: matches.map((pillar) => pillar.key),
        members: [...new Set(members)],
      })
    }
  }

  return findings
}

function summarizeElements(pillars: PillarReading[]): ElementSummary[] {
  const counts = new Map<FiveElement, number>(elements.map((element) => [element, 0]))

  for (const pillar of pillars) {
    counts.set(pillar.stemElement, (counts.get(pillar.stemElement) ?? 0) + 1)
    counts.set(pillar.branchElement, (counts.get(pillar.branchElement) ?? 0) + 1)
  }

  return elements.map((element) => {
    const count = counts.get(element) ?? 0
    const percentage = (count / 8) * 100

    return {
      element,
      count,
      percentage,
      status: classifyElementBalance(percentage),
    }
  })
}

function buildBeginnerReadings({
  dayMaster,
  dayPillar,
  elementSummary,
  advanced,
  luckDirection,
  luckStartAge,
}: {
  dayMaster: HeavenlyStem
  dayPillar: string
  elementSummary: ElementSummary[]
  advanced: AdvancedAnalysis
  luckDirection: '순행' | '역행'
  luckStartAge: number | null
}): BeginnerReading[] {
  const strongest = [...elementSummary].sort((a, b) => b.count - a.count)[0]
  const weak = elementSummary.filter((item) => item.count === 0)
  const dayElement = getDayMasterElementLabel(dayMaster)
  const strengthLabel = formatDayStrength(advanced.dayStrength.strength)

  return [
    {
      title: '나의 기본 기질',
      body: `${dayPillar} 일주는 ${dayMaster}${dayElement ? `(${dayElement})` : ''}를 중심으로 봅니다. 기본적으로 자신의 기준과 페이스를 중요하게 두는 편이며, 주변 환경에 따라 장점이 다르게 드러날 수 있습니다.`,
      basis: `일간 ${dayMaster}, 일주 ${dayPillar}`,
    },
    {
      title: '강한 기운과 보완점',
      body: `${strongest.element} 기운이 가장 두드러집니다. 이 기운은 장점으로 쓰면 추진력이나 안정감이 되지만, 한쪽으로 쏠리면 유연성이 줄어들 수 있어 부족한 기운을 생활 방식으로 보완하는 것이 좋습니다.`,
      basis: `${strongest.element} ${strongest.percentage.toFixed(1)}%${weak.length ? `, 부족: ${weak.map((item) => item.element).join(', ')}` : ''}`,
    },
    {
      title: '사주의 힘',
      body: `현재 기준으로는 ${strengthLabel} 쪽으로 분류됩니다. 이것은 좋고 나쁨의 판단이라기보다, 스스로 밀고 가는 힘과 외부 도움을 받아들이는 방식의 차이로 보는 것이 안전합니다.`,
      basis: `신강/신약 점수 ${advanced.dayStrength.score}, 격국 ${advanced.geukguk}`,
    },
    {
      title: '운의 흐름 보기',
      body: `대운은 ${luckDirection}으로 흐르고 만 ${luckStartAge ?? '-'}세 전후부터 큰 흐름이 바뀌는 구조입니다. 해석에서는 한 해의 세운보다 대운의 배경을 먼저 보고, 그 위에 연운과 월운을 겹쳐 보는 방식이 좋습니다.`,
      basis: `대운 ${luckDirection}, 시작 나이 ${luckStartAge ?? '-'}세`,
    },
  ]
}

function buildTopicReadings({
  dayMaster,
  pillars,
  elementSummary,
  advanced,
  coreSpecialStars,
  referenceSpecialStars,
}: {
  dayMaster: HeavenlyStem
  pillars: PillarReading[]
  elementSummary: ElementSummary[]
  advanced: AdvancedAnalysis
  coreSpecialStars: SpecialStarReading[]
  referenceSpecialStars: SpecialStarReading[]
}): TopicReading[] {
  const strongest = [...elementSummary].sort((a, b) => b.count - a.count)[0]
  const weak = elementSummary.filter((item) => item.count === 0)
  const strengthLabel = formatDayStrength(advanced.dayStrength.strength)
  const dayElement = getDayMasterElementLabel(dayMaster)
  const yongsin = advanced.yongsin.length ? advanced.yongsin.join(', ') : '보완 기운'
  const coreStarNames = coreSpecialStars.map((star) => star.name).join(', ')
  const referenceStarNames = referenceSpecialStars.map((star) => star.name).join(', ') || '참고 신살 없음'
  const primaryTenGod = getMostCommonTenGodFromPillars(pillars)
  const relationshipSummary = coreStarNames
    ? `관계에서는 핵심 신살로 ${coreStarNames}이 확인됩니다. 좋은 인연과 도움의 흐름을 살리되, 감정적 해석은 과하게 단정하지 않는 편이 좋습니다.`
    : '관계에서는 특별히 앞세울 핵심 신살이 뚜렷하지 않습니다. 이럴 때는 신살 이름보다 일간, 십성, 합충 관계를 중심으로 보는 편이 자연스럽습니다.'
  const relationshipBasis = coreStarNames ? `주요 십성 ${primaryTenGod}, 핵심 신살 ${coreStarNames}` : `주요 십성 ${primaryTenGod}, 핵심 신살 없음`
  const conditionalStrength = strengthLabel as ConditionalAdviceStrength
  const careerAdvice = getConditionalAdvice(primaryTenGod, conditionalStrength, '직업운')
  const moneyAdvice = getConditionalAdvice(primaryTenGod, conditionalStrength, '재물운')
  const relationshipAdvice = getConditionalAdvice(primaryTenGod, conditionalStrength, '관계운')
  const healthAdvice = getConditionalAdvice(primaryTenGod, conditionalStrength, '생활/건강운')
  const strengthAdvice =
    advanced.dayStrength.strength === 'strong'
      ? '스스로 밀고 가는 힘이 강하므로 협업에서는 속도를 조절하고 상대의 선택권을 남겨두는 것이 좋습니다.'
      : advanced.dayStrength.strength === 'weak'
        ? '외부 환경의 영향을 크게 받을 수 있으므로 신뢰할 만한 루틴과 조력자를 만드는 것이 중요합니다.'
        : '한쪽으로 치우치기보다 상황에 맞춰 조절하는 힘을 살리는 것이 좋습니다.'
  const weakAdvice = weak.length
    ? `${weak.map((item) => item.element).join(', ')} 기운이 부족하므로 해당 기운을 상징하는 활동, 환경, 습관을 의식적으로 보완하면 좋습니다.`
    : '부족한 오행이 뚜렷하지 않아 특정 기운을 과하게 보충하기보다 전체 균형을 유지하는 편이 좋습니다.'

  return [
    {
      topic: '성격',
      summary: `${dayMaster}${dayElement ? `(${dayElement})` : ''} 일간에서 ${strongest.element} 기운이 두드러집니다. 자기 기준과 안정감을 중요하게 두는 경향이 있습니다.`,
      advice: `${strengthLabel} 성향은 장점으로 쓰면 추진력과 지속력이 됩니다. ${strengthAdvice}`,
      basis: `일간 ${dayMaster}, 강한 오행 ${strongest.element}`,
    },
    {
      topic: '일/직업',
      summary: `격국은 ${advanced.geukguk}으로 분류됩니다. 일에서는 자신의 구조를 만들고 꾸준히 쌓아가는 방식이 잘 맞을 수 있습니다.`,
      advice: `${careerAdvice || '성과를 급하게 당기기보다 역할, 책임, 루틴을 명확히 두면 강점이 살아납니다.'} ${yongsin} 기운을 보완하는 활동이나 환경을 의식하면 균형을 잡기 좋습니다.`,
      basis: `격국 ${advanced.geukguk}, 주요 십성 ${primaryTenGod}, 용신 ${yongsin}`,
    },
    {
      topic: '재물',
      summary: `재물운은 단순히 돈이 많고 적음보다 흐름을 관리하는 방식으로 보는 것이 좋습니다. 현재 명식은 강한 기운과 부족한 기운의 균형이 중요합니다.`,
      advice: `${moneyAdvice || '감각적인 투자보다 기록, 예산, 반복 가능한 수입 구조처럼 관리 가능한 방식이 유리합니다.'} ${weakAdvice}`,
      basis: `주요 십성 ${primaryTenGod}, 부족 오행 ${weak.length ? weak.map((item) => item.element).join(', ') : '없음'}`,
    },
    {
      topic: '관계',
      summary: relationshipSummary,
      advice: `${relationshipAdvice || '상대에게 바로 결론을 요구하기보다 기준과 감정을 분리해서 말하면 관계의 피로가 줄어듭니다.'} 참고 신살은 ${referenceStarNames}으로 보조적으로만 보세요.`,
      basis: relationshipBasis,
    },
    {
      topic: '건강/생활',
      summary: `건강은 의학적 판단이 아니라 생활 리듬 관점에서 보는 것이 안전합니다. 강한 오행은 과로 패턴으로, 부족한 오행은 회복 습관으로 확인해볼 수 있습니다.`,
      advice: `${healthAdvice || '수면, 수분, 걷기, 일정한 식사처럼 기본 루틴을 먼저 잡는 것이 좋습니다.'} 몸에 불편함이 있으면 사주 해석보다 전문가 상담을 우선하세요.`,
      basis: `주요 십성 ${primaryTenGod}, 오행 분포와 생활 균형 기준`,
    },
  ]
}

function getMostCommonTenGodFromPillars(pillars: PillarReading[]) {
  const counts = new Map<string, number>()

  for (const pillar of pillars) {
    for (const tenGod of [pillar.stemTenGod, pillar.branchTenGod]) {
      if (tenGod !== '일간') {
        counts.set(tenGod, (counts.get(tenGod) ?? 0) + 1)
      }
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '일간'
}

function getDayMasterElementLabel(dayMaster: HeavenlyStem) {
  const elementByStem: Record<HeavenlyStem, string> = {
    갑: '목',
    을: '목',
    병: '화',
    정: '화',
    무: '토',
    기: '토',
    경: '금',
    신: '금',
    임: '수',
    계: '수',
  }

  return elementByStem[dayMaster]
}

function formatDayStrength(strength: string) {
  if (strength === 'strong') {
    return '신강'
  }

  if (strength === 'weak') {
    return '신약'
  }

  return '중화'
}

function classifyElementBalance(percentage: number): ElementSummary['status'] {
  if (percentage === 0) {
    return '부족'
  }

  if (percentage >= 37.5) {
    return '과다'
  }

  return '적정'
}
