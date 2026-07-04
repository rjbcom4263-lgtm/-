import { calculateSaju } from 'ssaju'
import { calculateSajuChart, type BirthInput } from '../src/lib/sajuEngine'

const sampleInput: BirthInput = {
  year: 2001,
  month: 8,
  day: 3,
  hour: 13,
  minute: 30,
  gender: 'male',
  isLunar: false,
  isLeapMonth: false,
}

const pillarOrder = ['hour', 'day', 'month', 'year'] as const
const pillarLabels = {
  hour: '시',
  day: '일',
  month: '월',
  year: '연',
}

const ours = calculateSajuChart(sampleInput)
const ssaju = calculateSaju({
  year: sampleInput.year,
  month: sampleInput.month,
  day: sampleInput.day,
  hour: sampleInput.hour,
  minute: sampleInput.minute,
  gender: sampleInput.gender === 'male' ? '남' : '여',
  calendar: sampleInput.isLunar ? 'lunar' : 'solar',
  leap: Boolean(sampleInput.isLeapMonth),
  timezone: 'Asia/Seoul',
})

function section(title: string) {
  console.log(`\n## ${title}`)
}

section('입력')
console.log(`${sampleInput.year}-${sampleInput.month}-${sampleInput.day} ${sampleInput.hour}:${sampleInput.minute}`)

section('원국')
for (const key of pillarOrder) {
  const oursPillar = ours.pillars.find((pillar) => pillar.key === key)
  console.log(
    `${pillarLabels[key]} | ours=${oursPillar?.korean ?? '-'} | ssaju=${ssaju.pillars[key]}`,
  )
}

section('십성')
for (const key of pillarOrder) {
  const oursPillar = ours.pillars.find((pillar) => pillar.key === key)
  const ssajuTenGod = ssaju.tenGods[key]
  console.log(
    `${pillarLabels[key]} | ours=${oursPillar?.stemTenGod}/${oursPillar?.branchTenGod} | ssaju=${ssajuTenGod.stem}/${ssajuTenGod.branch}`,
  )
}

section('지장간')
for (const key of pillarOrder) {
  const oursPillar = ours.pillars.find((pillar) => pillar.key === key)
  const oursHidden = oursPillar?.hiddenStems.map((hidden) => hidden.stem).join(',') ?? '-'
  const ssajuHidden = Object.values(ssaju.pillarDetails[key].hiddenStems)
    .filter(Boolean)
    .join(',')
  console.log(`${pillarLabels[key]} | ours=${oursHidden} | ssaju=${ssajuHidden}`)
}

section('12운성')
for (const key of pillarOrder) {
  const oursPillar = ours.pillars.find((pillar) => pillar.key === key)
  console.log(
    `${pillarLabels[key]} | ours=${oursPillar?.twelveLifeStage ?? '-'} | ssaju-bong=${ssaju.stages12.bong[key]} | ssaju-geo=${ssaju.stages12.geo[key]}`,
  )
}

section('12신살 / 특살')
for (const key of pillarOrder) {
  const oursPillar = ours.pillars.find((pillar) => pillar.key === key)
  const ssajuSals = ssaju.sals[key]
  console.log(
    `${pillarLabels[key]} | ours=${oursPillar?.twelveGodStar ?? '-'} / ${oursPillar?.specialStars.join(',') || '-'} | ssaju=${ssajuSals.twelveSal} / ${ssajuSals.specialSals.join(',') || '-'}`,
  )
}

section('신살 요약')
console.log(`ours=${ours.specialStars.map((star) => star.name).join(', ') || '-'}`)
console.log(`ssaju 길신=${ssaju.advanced.sinsal.gilsin.join(', ') || '-'}`)
console.log(`ssaju 흉신=${ssaju.advanced.sinsal.hyungsin.join(', ') || '-'}`)

section('공망')
console.log(`ours=${ours.voidBranches.join(',')}`)
console.log(`ssaju=${ssaju.gongmang.branchesKo.join(',')}`)

section('관계')
console.log(`ours=${ours.relations.map((relation) => relation.label).join(' | ') || '-'}`)
console.log(`ssaju 간합/충=${ssaju.stemRelations.map((relation) => relation.desc).join(' | ') || '-'}`)
console.log(`ssaju 지지=${JSON.stringify(ssaju.branchRelations)}`)

section('대운')
console.log(`ours startAge=${ours.luck.startAge}, direction=${ours.luck.direction}`)
console.log(`ssaju startAge=${ssaju.daeun.startAge}, direction=${ssaju.daeun.basis.direction}`)
console.log(`ours first=${ours.luck.pillars.slice(0, 3).map((pillar) => pillar.korean).join(',')}`)
console.log(`ssaju first=${ssaju.daeun.list.slice(0, 3).map((pillar) => pillar.ganzhi).join(',')}`)
