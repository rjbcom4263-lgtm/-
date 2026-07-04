import {
  dayMasterPack,
  elementBalancePack,
  elementDetailPack,
  findCombinationReadings,
  getFortuneSentence,
  getLuckCycleSentence,
  getRelationSentence,
  getSpecialStarSentence,
  relationDetailPack,
  tenGodDetailPack,
  tenGodTopicPack,
} from './interpretationPacks'
import { getConditionalAdvice, type ConditionalAdviceStrength, type ConditionalAdviceTopic } from './conditionalAdvicePack'
import type { SajuChart } from './sajuEngine'

export type SajuReportPoint = {
  plain: string
  expert: string
  life: string
}

export type SajuReportSection = {
  order: number
  title: string
  plainTitle: string
  summary: string
  expertSummary: string
  conclusion: string
  advice: string
  points: SajuReportPoint[]
}

type SajuReportSectionDraft = Omit<SajuReportSection, 'conclusion' | 'advice'>

const elementMeanings = {
  목: '나무처럼 자라고 넓어지는 힘입니다. 공부, 계획, 사람을 여는 힘과 가깝습니다.',
  화: '불처럼 드러나고 표현하는 힘입니다. 말, 인기, 속도, 추진력과 가깝습니다.',
  토: '땅처럼 잡아주고 정리하는 힘입니다. 책임, 현실감, 버티는 힘과 가깝습니다.',
  금: '쇠처럼 자르고 판단하는 힘입니다. 기준, 돈 관리, 계약, 마무리와 가깝습니다.',
  수: '물처럼 흐르고 생각하는 힘입니다. 정보, 이동, 대화, 회복과 가깝습니다.',
}

const elementPersonality = {
  목: '새로운 것을 배우고 키우는 쪽으로 힘이 갑니다. 계획을 세우고 사람을 연결하는 일에서 장점이 드러납니다.',
  화: '표현하고 드러내는 쪽으로 힘이 갑니다. 말, 발표, 홍보, 빠른 실행에서 장점이 드러납니다.',
  토: '현실을 정리하고 버티는 쪽으로 힘이 갑니다. 책임감, 관리, 안정적인 운영에서 장점이 드러납니다.',
  금: '판단하고 마무리하는 쪽으로 힘이 갑니다. 기준 세우기, 돈 관리, 계약, 정리에서 장점이 드러납니다.',
  수: '생각하고 흐름을 읽는 쪽으로 힘이 갑니다. 정보, 대화, 이동, 연구에서 장점이 드러납니다.',
}

type ElementStatusKey = 'excess' | 'lack' | 'balanced'

const tenGodPlain = {
  비견: '내 힘으로 버티고 선택하려는 기운',
  겁재: '경쟁, 비교, 빼앗기지 않으려는 기운',
  식신: '꾸준히 만들고 먹고사는 힘',
  상관: '표현, 반항, 새 방식으로 바꾸려는 힘',
  편재: '기회, 사람, 큰돈의 흐름을 잡는 힘',
  정재: '월급, 저축, 안정적인 돈 관리의 힘',
  편관: '압박, 책임, 위기를 돌파하는 힘',
  정관: '규칙, 직장, 신뢰, 사회적 인정의 힘',
  편인: '직감, 공부, 혼자 파고드는 힘',
  정인: '보호, 배움, 도움을 받는 힘',
  일간: '나 자신을 뜻하는 중심 기운',
}

export function buildSajuReportSections(chart: SajuChart): SajuReportSection[] {
  const dayPillar = chart.pillars.find((pillar) => pillar.key === 'day')
  const strongestElement = [...chart.elementSummary].sort((a, b) => b.count - a.count)[0]
  const strongestElementReading = strongestElement ? getElementReading(strongestElement.element, strongestElement.status) : null
  const weakElements = chart.elementSummary.filter((item) => item.count === 0)
  const strongestTenGod = getMostCommonTenGod(chart)
  const hasTensionRelation = chart.summaryRelations.some((relation) => relation.level === 'core')
  const firstLuck = chart.luck.pillars[0]
  const relationTopic = findTopic(chart, '관계')
  const primaryRelation = chart.summaryRelations[0] ?? chart.detailRelations[0]
  const primaryRelationReading = primaryRelation ? getRelationReading(primaryRelation.type, primaryRelation.members.length) : null
  const primarySpecialStar = chart.coreSpecialStars[0] ?? chart.referenceSpecialStars[0]
  const primarySpecialStarSentence = primarySpecialStar ? getSpecialStarSentence(primarySpecialStar.name) : ''
  const dayMasterReading = dayPillar ? dayMasterPack[dayPillar.stem] : null
  const combinationReadings = findCombinationReadings(chart).slice(0, 3)

  return withGuidance([
    {
      order: 11,
      title: '만세력 판독 요약',
      plainTitle: '내 사주 재료 한눈에 보기',
      summary: `이 사람의 기본 재료는 ${chart.summary}입니다. 중심은 ${dayPillar?.korean ?? '-'} 일주이고, ${dayMasterReading?.plain ?? '일간 성향을 중심으로 봅니다'} 전체 분위기는 ${strongestElement?.element ?? '-'} 기운이 많이 끌고 갑니다.`,
      expertSummary: `일간은 ${dayPillar?.stem ?? '-'}, 일지는 ${dayPillar?.branch ?? '-'}이며 원국 4주는 ${chart.pillars.map((pillar) => pillar.korean).join(', ')}로 판독됩니다.`,
      points: [
        point(
          '사주는 네 개의 기둥으로 봅니다.',
          `년월일시 명식: ${chart.pillars.map((pillar) => `${pillar.label} ${pillar.korean}`).join(', ')}`,
          '한 사람을 볼 때 집 주소처럼 기본 위치를 먼저 확인하는 단계입니다. 여기서 성격, 일, 관계, 운의 흐름을 읽기 시작합니다.',
        ),
        point(
          `가장 눈에 띄는 기운은 ${strongestElement?.element ?? '-'}입니다.`,
          `오행 분포: ${chart.elementSummary.map((item) => `${item.element} ${item.count}개`).join(', ')}`,
          strongestElement && strongestElementReading
            ? `${elementMeanings[strongestElement.element]} ${strongestElementReading.core} ${strongestElementReading.easy}`
            : '강한 오행이 아직 뚜렷하지 않습니다.',
        ),
        point(
          `비어 있거나 약한 기운은 ${formatWeakElements(weakElements)}입니다.`,
          `부족 오행 기준: ${weakElements.length ? weakElements.map((item) => item.element).join(', ') : '없음'}`,
          '부족한 기운은 못한다는 뜻이 아니라, 의식적으로 배워야 편해지는 영역입니다.',
        ),
      ],
    },
    {
      order: 1,
      title: '원국 핵심 구조',
      plainTitle: '내 기본 성향의 뼈대',
      summary: `이 사주는 ${formatStrength(chart.advanced.dayStrength.strength)} 쪽으로 계산됩니다. 여기에 ${strongestTenGod} 흐름이 자주 보여서, 실제 성향은 ${describeTenGod(strongestTenGod)} 쪽으로 나타나기 쉽습니다.`,
      expertSummary: `신강/신약 점수 ${chart.advanced.dayStrength.score}, 격국 ${chart.advanced.geukguk}, 용신 후보 ${chart.advanced.yongsin.length ? chart.advanced.yongsin.join(', ') : '없음'}입니다.`,
      points: [
        point(
          `${formatStrength(chart.advanced.dayStrength.strength)}은 내 에너지의 기본 세기입니다.`,
          `신강/신약 점수: ${chart.advanced.dayStrength.score}`,
          chart.advanced.dayStrength.strength === 'strong'
            ? `${dayMasterReading?.strength ?? '자기 생각과 추진력이 강합니다.'} 대신 ${dayMasterReading?.risk ?? '남의 말이 늦게 들어오거나 고집으로 보일 수 있습니다.'}`
            : chart.advanced.dayStrength.strength === 'weak'
              ? `상황과 사람의 영향을 많이 받습니다. 그래도 ${dayMasterReading?.strength ?? '분위기를 읽고 맞추는 힘'}은 장점으로 쓸 수 있습니다.`
              : '한쪽으로 크게 치우치지 않아 상황에 따라 유연하게 움직일 수 있습니다.',
        ),
        point(
          `용신은 부족하거나 과한 균형을 잡아주는 도움 기운입니다.`,
          `용신 후보: ${chart.advanced.yongsin.length ? chart.advanced.yongsin.join(', ') : '계산된 후보 없음'}`,
          '쉽게 말해 “내가 더 편해지려면 어떤 습관과 환경이 필요한가”를 보는 힌트입니다.',
        ),
        point(
          '격국은 이 사주가 어떤 방식으로 힘을 쓰는지 보는 틀입니다.',
          `격국: ${chart.advanced.geukguk}`,
          `${chart.advanced.interpretation} 이 구조에서는 ${hasTensionRelation ? '관계나 선택에서 부딪힘이 생길 때 오히려 방향 전환이 크게 일어날 수 있습니다.' : '큰 충돌보다 자기 리듬을 꾸준히 만드는 쪽이 더 중요합니다.'} ${primarySpecialStarSentence}`,
        ),
      ],
    },
    {
      order: 9,
      title: '평생 총운',
      plainTitle: '인생 흐름 크게 보기',
      summary: `운은 10년 단위의 큰 흐름과 해마다 오는 작은 흐름이 겹쳐 움직입니다. 이 명식은 ${strongestElement?.element ?? '-'} 기운을 어떻게 쓰느냐에 따라 인생 체감이 크게 달라집니다.`,
      expertSummary: `대운 방향은 ${chart.luck.direction}, 대운 시작은 만 ${chart.luck.startAge ?? '-'}세입니다.`,
      points: [
        point(
          '대운은 인생의 계절입니다.',
          `대운 배열: ${chart.luck.pillars.slice(0, 4).map((luck) => `${luck.age}세 ${luck.korean}`).join(', ')}`,
          '봄에는 씨를 뿌리고 겨울에는 버티듯, 대운은 어느 시기에 무엇이 쉬워지고 어려워지는지 보여줍니다.',
        ),
        point(
          '세운은 그해의 날씨입니다.',
          `초기 세운: ${chart.yearlyFortunes.slice(0, 3).map((fortune) => `${fortune.label} ${fortune.ganzhi}`).join(', ')}`,
          '큰 계절이 좋아도 그해 날씨가 거칠 수 있고, 반대로 힘든 대운 속에서도 좋은 해가 올 수 있습니다.',
        ),
        point(
          '인생은 원국, 대운, 세운을 같이 봐야 합니다.',
          `일주 ${dayPillar?.korean ?? '-'} 중심으로 대운과 세운을 연결합니다.`,
          `${firstLuck ? `첫 흐름인 ${firstLuck.age}세 ${firstLuck.korean} 대운부터` : '대운 시작점부터'} 자기 강점이 통하는 환경과 통하지 않는 환경이 갈립니다. 그래서 “좋다/나쁘다”보다 어느 분야에서 어떤 선택을 해야 하는지가 더 중요합니다.`,
        ),
      ],
    },
    buildTopicSection(3, '금전운', '돈을 버는 방식과 새는 구멍', chart, '재물'),
    buildTopicSection(2, '직업운', '일을 잘하는 방식', chart, '일/직업'),
    buildTopicSection(4, '연애운', '사랑할 때 반복되는 모습', chart, '관계'),
    {
      order: 5,
      title: '결혼운',
      plainTitle: '함께 살 때 맞는 방식',
      summary: `결혼운은 단순히 결혼을 하느냐보다, 어떤 관계 방식에서 안정되고 어떤 지점에서 갈등이 생기는지를 보는 항목입니다. ${dayMasterReading?.marriage ?? ''}`,
      expertSummary: '관계운, 관성/재성 흐름, 대운의 안정성, 원국 합충 관계를 함께 확인합니다.',
      points: [
        point(
          '결혼은 감정보다 생활 리듬이 중요합니다.',
          `관계 근거: ${relationTopic?.basis ?? '관계 항목 추가 분석 필요'}`,
          `${relationTopic?.summary ?? '상대와 오래 가려면 내가 반복하는 관계 습관을 먼저 봐야 합니다.'} ${dayMasterReading?.marriage ?? ''}`,
        ),
        point(
          '맞는 사람은 내 약점을 덜 자극하는 사람입니다.',
          `관계 조언: ${relationTopic?.advice ?? '관계 조언 추가 필요'}`,
          '초반 설렘보다 갈등이 생겼을 때 대화가 되는지, 돈과 생활 기준이 맞는지가 더 중요합니다.',
        ),
        point(
          '배우자상과 위기 시기는 더 정밀한 규칙으로 확장할 수 있습니다.',
          '현재 버전은 단정적 혼인/이혼 판단보다 계산 근거가 있는 관계 패턴을 우선 표시합니다.',
          '이 방향이 과장된 운세보다 실제 서비스 신뢰도를 높입니다.',
        ),
      ],
    },
    buildTopicSection(7, '건강운', '몸과 생활 리듬 관리', chart, '건강/생활'),
    {
      order: 6,
      title: '인간관계/가족운',
      plainTitle: '사람 사이에서 반복되는 패턴',
      summary: `사람 문제는 성격만으로 생기지 않습니다. 내 기운과 상대 기운이 부딪히거나 맞물리는 방식에서 반복됩니다. ${primaryRelationReading?.relationship ?? ''} ${dayMasterReading?.relationship ?? ''}`,
      expertSummary: `핵심 관계 ${chart.summaryRelations.length ? chart.summaryRelations.map((relation) => relation.label).join(', ') : '없음'}, 상세 관계 ${chart.detailRelations.length ? chart.detailRelations.map((relation) => relation.label).join(', ') : '없음'}${primaryRelationReading ? ` / 관계 해석: ${primaryRelationReading.expert}` : ''}`,
      points: [
        point(
          '합은 가까워지는 힘, 충은 부딪히는 힘입니다.',
          `합충형파해 요약: ${chart.summaryRelations.length ? chart.summaryRelations.map((relation) => relation.label).join(', ') : '뚜렷한 핵심 관계 없음'}`,
          chart.summaryRelations[0] ? getRelationSentence(chart.summaryRelations[0]) : '가까워지는 관계도 부담이 될 수 있고, 부딪히는 관계도 변화를 만드는 계기가 될 수 있습니다.',
        ),
        point(
          '관계운은 감정, 생활, 돈의 흐름에서 함께 드러납니다.',
          `관계 조언: ${relationTopic?.advice ?? '-'}`,
          `누가 나쁘다보다, 어떤 상황에서 내가 예민해지고 어떤 사람에게 기대가 커지는지 보는 것이 중요합니다. ${primaryRelationReading ? `${primaryRelationReading.love} ${primaryRelationReading.workMoney} ${primaryRelationReading.health}` : ''} ${dayMasterReading?.relationship ?? ''}`,
        ),
      ],
    },
    {
      order: 8,
      title: '대운 상세 해석',
      plainTitle: '10년 단위 인생 흐름',
      summary: '대운은 10년마다 바뀌는 큰 배경입니다. 직업, 돈, 관계의 판이 바뀔 때 대운 변화가 함께 작동하는 경우가 많습니다.',
      expertSummary: `대운 방향 ${chart.luck.direction}, 시작 만 ${chart.luck.startAge ?? '-'}세`,
      points: chart.luck.pillars.slice(0, 6).map((luck) =>
        point(
          `${luck.age}세부터 ${luck.korean} 대운입니다.`,
          `${luck.age}세 ${luck.korean}: ${luck.stemTenGod}/${luck.branchTenGod}, 12운성 ${luck.twelveLifeStage}`,
          getLuckCycleSentence(luck.age, luck.korean, luck.stemTenGod, luck.branchTenGod, luck.twelveLifeStage),
        ),
      ),
    },
    {
      order: 10,
      title: '세운 핵심 해석',
      plainTitle: '해마다 바뀌는 분위기',
      summary: '세운은 그해의 사건 가능성을 보는 흐름입니다. 시험, 이직, 연애, 돈 문제처럼 특정 해에 강하게 나타나는 움직임을 확인합니다.',
      expertSummary: '연도별 간지, 십성, 12운성을 기준으로 봅니다.',
      points: chart.yearlyFortunes.slice(0, 6).map((fortune) =>
        point(
          `${fortune.label}은 ${fortune.ganzhi} 흐름입니다.`,
          `${fortune.stemTenGod}/${fortune.branchTenGod}, 12운성 ${fortune.twelveLifeStage}`,
          getFortuneSentence(
            fortune.label,
            fortune.ganzhi,
            fortune.stemTenGod,
            fortune.branchTenGod,
            fortune.twelveLifeStage,
            'year',
          ),
        ),
      ),
    },
    {
      order: 12,
      title: '현실 조언 및 총평',
      plainTitle: '그래서 어떻게 살면 좋은가',
      summary: '사주는 미래를 맞히는 것보다 반복되는 선택 습관을 알아차리는 데 쓸 때 가장 현실적입니다.',
      expertSummary: `강한 오행 ${strongestElement?.element ?? '-'}, 보완 오행 ${formatWeakElements(weakElements)}, 신강/신약 ${formatStrength(chart.advanced.dayStrength.strength)}${combinationReadings.length ? ` / 조합 ${combinationReadings.map((item) => item.key).join(', ')}` : ''}`,
      points: [
        point(
          `${dayPillar?.korean ?? '-'} 일주는 ${strongestElement?.element ?? '-'} 기운과 ${strongestTenGod} 흐름을 잘 쓰는 것이 핵심입니다.`,
          `일주 ${dayPillar?.korean ?? '-'}, 강한 오행 ${strongestElement?.element ?? '-'} ${strongestElement?.count ?? 0}개, 주요 십성 ${strongestTenGod}`,
          strongestElement && strongestElementReading
            ? `${elementMeanings[strongestElement.element]} ${strongestElementReading.personality} ${strongestElementReading.advice}`
            : '강한 기운을 실제 행동으로 어떻게 쓰는지가 중요합니다.',
        ),
        point(
          weakElements.length
            ? `${formatStrength(chart.advanced.dayStrength.strength)} 구조에서는 ${formatWeakElements(weakElements)}을 먼저 관리하는 것이 좋습니다.`
            : `${formatStrength(chart.advanced.dayStrength.strength)} 구조에서는 부족한 오행보다 전체 균형을 유지하는 것이 중요합니다.`,
          `신강/신약 ${formatStrength(chart.advanced.dayStrength.strength)}, 부족 오행 ${weakElements.length ? weakElements.map((item) => item.element).join(', ') : '없음'}`,
          '약한 부분은 피하라는 뜻이 아니라, 루틴과 환경으로 보완하라는 뜻입니다.',
        ),
        point(
          '핵심 결론은 내 구조를 알고 같은 실수를 줄이는 것입니다.',
          '원국, 대운, 세운을 함께 참고합니다.',
          `${dayPillar?.korean ?? '-'} 일주는 ${formatStrength(chart.advanced.dayStrength.strength)} 구조에서 ${strongestElement?.element ?? '-'} 기운과 ${strongestTenGod} 흐름이 반복 선택으로 나타나기 쉽습니다. ${combinationReadings.length ? combinationReadings.map((item) => `${item.key} 조합: ${item.reading.core} ${item.reading.useWell} ${item.reading.advice}`).join(' ') : ''} ${dayMasterReading?.advice ?? ''} ${chart.beginnerReadings[0]?.body ?? chart.advanced.interpretation}`,
        ),
      ],
    },
  ]).sort((a, b) => a.order - b.order)
}

function buildTopicSection(
  order: number,
  title: string,
  plainTitle: string,
  chart: SajuChart,
  topic: string,
): SajuReportSectionDraft {
  const reading = findTopic(chart, topic)
  const strongestElement = [...chart.elementSummary].sort((a, b) => b.count - a.count)[0]
  const strongestElementReading = strongestElement ? getElementReading(strongestElement.element, strongestElement.status) : null
  const weakElements = chart.elementSummary.filter((item) => item.count === 0)
  const strongestTenGod = getMostCommonTenGod(chart)
  const topicTone = getTopicTone(title, strongestElement?.element, strongestTenGod)
  const topicPack = getTenGodTopicSentence(strongestTenGod, title)
  const tenGodDetail = tenGodDetailPack[strongestTenGod] ?? tenGodDetailPack.일간
  const elementTopicPack = strongestElement ? getElementTopicSentence(strongestElement.element, title, strongestElement.status) : ''
  const dayPillar = chart.pillars.find((pillar) => pillar.key === 'day')
  const dayMasterReading = dayPillar ? dayMasterPack[dayPillar.stem] : null
  const dayMasterTopicPack = getDayMasterTopicSentence(dayMasterReading, title)
  const conditionalAdviceTopic = getConditionalAdviceTopic(title)
  const conditionalAdvice = conditionalAdviceTopic
    ? getConditionalAdvice(strongestTenGod, formatStrength(chart.advanced.dayStrength.strength) as ConditionalAdviceStrength, conditionalAdviceTopic)
    : ''

  return {
    order,
    title,
    plainTitle,
    summary: `${reading?.summary ?? `${title}은 현재 계산된 원국 구조를 기준으로 봅니다.`} ${topicTone.summary} ${tenGodDetail.core} ${topicPack} ${dayMasterTopicPack}`,
    expertSummary: `${reading?.basis ?? '오행, 십성, 대운 흐름을 함께 확인해야 합니다.'} / 주요 십성 ${strongestTenGod}: ${tenGodDetail.expert} / 강한 오행 ${strongestElement?.element ?? '-'}`,
    points: [
      point(
        topicTone.plain,
        `주요 십성 ${strongestTenGod}: ${describeTenGod(strongestTenGod)}`,
        `${conditionalAdvice ? `${conditionalAdvice} ` : ''}${topicTone.life} ${tenGodDetail.easy} ${topicPack}`,
      ),
      point(
        weakElements.length
          ? `${formatWeakElements(weakElements)}이 약점으로 잡히므로 이 부분은 일부러 보완해야 합니다.`
          : '부족한 오행이 뚜렷하지 않으므로 특정 한쪽을 과하게 밀기보다 균형이 중요합니다.',
        `부족 오행: ${weakElements.length ? weakElements.map((item) => item.element).join(', ') : '없음'}`,
        `${tenGodDetail.strength} 다만 ${tenGodDetail.risk} ${conditionalAdvice || reading?.advice || '지금은 큰 방향을 잡고, 이후 세부 규칙으로 더 깊게 확장합니다.'}`,
      ),
      point(
        `${title}은 추상적인 운이 아니라 매일 반복하는 선택에서 드러납니다.`,
        `${topic} 항목 기준 해석, 강한 오행 ${strongestElement?.element ?? '-'}`,
        strongestElement && strongestElementReading
          ? `${elementPersonality[strongestElement.element]} ${strongestElementReading.personality} 이 흐름이 ${title}에서는 ${topicTone.action}으로 나타날 수 있습니다. ${elementTopicPack} ${dayMasterTopicPack}`
          : '강한 기운을 실제 행동으로 어떻게 쓰는지가 중요합니다.',
      ),
    ],
  }
}

function getConditionalAdviceTopic(title: string): ConditionalAdviceTopic | null {
  if (title === '직업운') {
    return '직업운'
  }

  if (title === '금전운') {
    return '재물운'
  }

  if (title === '연애운' || title === '결혼운' || title === '인간관계/가족운') {
    return '관계운'
  }

  if (title === '건강운') {
    return '생활/건강운'
  }

  return null
}

function getRelationReading(type: string, memberCount: number) {
  if (type === '천간합') return relationDetailPack.천간합
  if (type === '천간충') return relationDetailPack.천간충
  if (type === '지지육합') return relationDetailPack.육합
  if (type === '지지삼합') return relationDetailPack.삼합
  if (type === '지지방합') return relationDetailPack.방합
  if (type === '지지충') return relationDetailPack.지지충
  if (type === '지지파') return relationDetailPack.파
  if (type === '지지해') return relationDetailPack.해
  if (type === '원진') return relationDetailPack.원진
  if (type === '지지형') return memberCount === 1 ? relationDetailPack.자형 : relationDetailPack.형
  if (type.includes('합')) return relationDetailPack.합
  if (type.includes('충')) return relationDetailPack.충

  return relationDetailPack.합
}

function getDayMasterTopicSentence(reading: (typeof dayMasterPack)[keyof typeof dayMasterPack] | null, title: string) {
  if (!reading) {
    return ''
  }

  if (title === '금전운') {
    return reading.money
  }

  if (title === '직업운') {
    return reading.work
  }

  if (title === '연애운') {
    return reading.love
  }

  if (title === '건강운') {
    return reading.health
  }

  if (title === '결혼운') {
    return reading.marriage
  }

  return reading.relationship
}

function getTenGodTopicSentence(tenGod: string, title: string) {
  const topicKey = title === '금전운' || title === '직업운' || title === '연애운' || title === '건강운' || title === '결혼운' ? title : '관계운'

  return tenGodTopicPack[tenGod]?.[topicKey] ?? tenGodTopicPack.일간[topicKey]
}

function getElementReading(element: keyof typeof elementDetailPack, status: string) {
  const key: ElementStatusKey = status === '과다' ? 'excess' : status === '부족' ? 'lack' : 'balanced'

  return elementDetailPack[element][key]
}

function getElementTopicSentence(element: keyof typeof elementBalancePack, title: string, status = '적정') {
  const reading = getElementReading(element, status)

  if (title === '금전운') {
    return reading.money
  }

  if (title === '직업운') {
    return reading.work
  }

  if (title === '연애운' || title === '결혼운') {
    return reading.love
  }

  if (title === '건강운') {
    return reading.health
  }

  return reading.relationship
}

function withGuidance(sections: SajuReportSectionDraft[]): SajuReportSection[] {
  return sections.map((section) => compactSection({
    ...section,
    conclusion: buildConclusion(section),
    advice: buildAdvice(section),
  }))
}

function buildConclusion(section: SajuReportSectionDraft) {
  if (section.title === '현실 조언 및 총평') {
    return [section.points[0]?.plain, section.points[1]?.plain, section.points[0]?.life].filter(Boolean).join(' ')
  }

  const firstLife = section.points[0]?.life ?? section.summary

  return `${section.plainTitle}의 핵심은 이것입니다. ${firstLife}`
}

function buildAdvice(section: SajuReportSectionDraft) {
  if (section.title === '현실 조언 및 총평') {
    return section.points[2]?.life ?? '사주는 정답지가 아니라 내 반복 패턴을 줄이는 지도처럼 쓰는 것이 가장 좋습니다.'
  }

  const titleAdvice: Record<string, string> = {
    '만세력 판독 요약': '처음에는 어려운 한자보다 일간, 강한 오행, 부족한 오행 세 가지만 먼저 기억하세요.',
    '원국 핵심 구조': '내가 강하게 밀어붙이는 사람인지, 주변 영향을 많이 받는 사람인지부터 구분하면 해석이 쉬워집니다.',
    '평생 총운': '대운은 큰 계절, 세운은 그해 날씨라고 생각하고 중요한 결정을 어느 시기에 할지 나눠 보세요.',
    '금전운': '돈이 들어오는 방식보다 돈이 새는 습관을 먼저 찾는 것이 현실적으로 더 중요합니다.',
    '직업운': '잘 맞는 일은 오래 해도 덜 지치고, 안 맞는 일은 실력이 있어도 계속 소모됩니다.',
    '연애운': '상대가 어떤 사람인지보다 내가 관계에서 반복하는 반응을 먼저 확인하세요.',
    '결혼운': '결혼은 감정의 문제가 아니라 생활 기준, 돈 기준, 갈등 해결 방식의 문제까지 같이 봐야 합니다.',
    '건강운': '건강운은 겁을 주는 항목이 아니라 무너지기 쉬운 생활 패턴을 미리 잡는 항목입니다.',
    '인간관계/가족운': '사람과의 거리는 가까울수록 좋은 것이 아니라 내 기운이 안정되는 거리가 좋은 거리입니다.',
    '대운 상세 해석': '10년 단위로 무엇을 키우고 무엇을 줄일지 정하면 운을 더 현실적으로 쓸 수 있습니다.',
    '세운 핵심 해석': '해마다 강하게 움직이는 분야를 알고 있으면 무리할 때와 기다릴 때를 구분하기 쉽습니다.',
    '현실 조언 및 총평': '사주는 정답지가 아니라 내 반복 패턴을 줄이는 지도처럼 쓰는 것이 가장 좋습니다.',
  }

  return titleAdvice[section.title] ?? '이 항목은 쉬운 말, 전문가 근거, 실제 삶의 모습 순서로 차분히 읽으면 이해가 쉬워집니다.'
}

function compactSection(section: SajuReportSection): SajuReportSection {
  return {
    ...section,
    summary: compactText(section.summary, 2, 170),
    expertSummary: compactText(section.expertSummary, 2, 180),
    conclusion: compactText(section.conclusion, 2, 150),
    advice: compactText(section.advice, 1, 120),
    points: section.points.slice(0, 2).map((item) => ({
      plain: compactText(item.plain, 1, 95),
      expert: compactText(item.expert, 1, 120),
      life: compactText(item.life, 2, 170),
    })),
  }
}

function compactText(value: string, maxSentences: number, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim()

  if (!normalized) {
    return ''
  }

  const sentences = (normalized.match(/[^.!?。！？]+[.!?。！？]?/g) ?? [normalized])
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  const picked = sentences.slice(0, maxSentences).join(' ').trim()
  const base = picked || normalized

  if (base.length <= maxLength) {
    return base
  }

  const cut = base.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  const trimmed = cut.slice(0, lastSpace > 60 ? lastSpace : maxLength).trim()

  return `${trimmed}...`
}

function getMostCommonTenGod(chart: SajuChart) {
  const tenGods = chart.pillars.flatMap((pillar) => [pillar.stemTenGod, pillar.branchTenGod]).filter((tenGod) => tenGod !== '일간')
  const counts = new Map<string, number>()

  for (const tenGod of tenGods) {
    counts.set(tenGod, (counts.get(tenGod) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '일간'
}

function describeTenGod(tenGod: string) {
  return tenGodDetailPack[tenGod]?.core ?? tenGodPlain[tenGod as keyof typeof tenGodPlain] ?? '사주 안에서 반복되는 행동 방식'
}

function getTopicTone(title: string, element = '-', tenGod = '일간') {
  const elementText = element === '-' ? '균형' : element
  const tenGodText = tenGod === '일간' ? describeTenGod(tenGod) : `${tenGod} 기운`

  if (title === '금전운') {
    return {
      summary: `${elementText} 기운과 ${tenGod} 흐름 때문에 돈은 “들어오는 방식”보다 “관리하고 새는 곳을 막는 방식”에서 차이가 납니다.`,
      plain: `돈 문제에서는 ${tenGodText}이 먼저 드러납니다.`,
      life: '돈이 들어오는 순간보다, 돈을 어디에 쓰고 누구와 엮이는지에서 반복 패턴이 생깁니다.',
      action: '수입 구조, 소비 습관, 투자 판단의 차이',
    }
  }

  if (title === '직업운') {
    return {
      summary: `${elementText} 기운이 일하는 방식에 깔려 있어서, 맞는 환경에서는 속도가 나고 안 맞는 환경에서는 쉽게 지칩니다.`,
      plain: `일에서는 ${tenGodText}이 업무 태도로 나타납니다.`,
      life: '같은 일을 해도 어떤 사람은 관리형으로 강하고, 어떤 사람은 표현형이나 전문기술형으로 강합니다.',
      action: '업무 방식, 조직 적응, 독립 가능성',
    }
  }

  if (title === '연애운') {
    return {
      summary: `${elementText} 기운과 ${tenGod} 흐름은 좋아하는 방식, 서운해지는 방식, 관계에서 버티는 방식을 다르게 만듭니다.`,
      plain: `연애에서는 ${tenGodText}이 사랑을 시작하고 유지하는 방식으로 나타납니다.`,
      life: '상대가 바뀌어도 비슷한 서운함이나 기대가 반복된다면 이 구조를 봐야 합니다.',
      action: '끌리는 상대, 표현 방식, 갈등 패턴',
    }
  }

  if (title === '건강운') {
    return {
      summary: `${elementText} 기운의 과부족은 몸의 병명을 뜻하기보다 생활 리듬이 흔들리는 방식을 보여줍니다.`,
      plain: `건강에서는 ${tenGodText}이 스트레스 반응으로 나타날 수 있습니다.`,
      life: '무리하면 어디가 바로 아프다는 식의 단정보다, 잠·식사·긴장·회복 패턴을 먼저 보는 것이 안전합니다.',
      action: '수면, 식사, 과로, 회복 루틴',
    }
  }

  return {
    summary: `${elementText} 기운과 ${tenGod} 흐름이 이 항목의 기본 분위기를 만듭니다.`,
    plain: `이 항목에서는 ${tenGodText}이 중요합니다.`,
    life: '실제 삶에서는 말투, 선택, 관계, 돈의 흐름 같은 반복 행동으로 나타납니다.',
    action: '생활 속 반복 패턴',
  }
}

function point(plain: string, expert: string, life: string): SajuReportPoint {
  return { plain, expert, life }
}

function findTopic(chart: SajuChart, topic: string) {
  return chart.topicReadings.find((reading) => reading.topic === topic)
}

function formatWeakElements(elements: SajuChart['elementSummary']) {
  return elements.length ? `${elements.map((item) => item.element).join(', ')} 부족` : '부족 오행 없음'
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
