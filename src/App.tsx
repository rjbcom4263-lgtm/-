import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
  RotateCcw,
  Save,
  Share2,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { calculateSajuChart, type BirthInput, type SajuChart } from './lib/sajuEngine'
import {
  buildDailyFortuneReading,
  buildPeriodFortuneReading,
  type DailyCategoryReading,
  type DailyFortuneReading,
  type PeriodFortuneReading,
} from './lib/dailyFortune'
import { normalizeBirthInput } from './lib/birthInput'
import { buildManseCalendarMonth, type CalendarDay, type ManseCalendarMonth } from './lib/manseCalendar'
import type { SajuReportSection } from './lib/sajuReport'
import './App.css'

const initialForm: BirthInput = {
  year: 2001,
  month: 8,
  day: 3,
  hour: 13,
  minute: 30,
  gender: 'male',
  isLunar: false,
  isLeapMonth: false,
  dayBoundary: 'midnight',
}

const savedBirthInputKey = 'saju.birthInput.v1'
const savedProfilesKey = 'saju.birthProfiles.v1'
const maxProfileNameLength = 30
const maxSavedProfiles = 20

type ChipDescription = {
  summary: string
  useWell: string
  caution: string
  rule?: string
}

const chipDescriptions: Record<string, ChipDescription> = {
  현침살: {
    summary: '말, 손끝, 기술처럼 날카롭고 섬세한 감각을 뜻합니다.',
    useWell: '분석, 글쓰기, 수리, 의료·기술처럼 세밀함이 필요한 일에 좋게 쓸 수 있습니다.',
    caution: '말이 너무 날카롭게 들리지 않도록 표현을 부드럽게 다듬는 것이 좋습니다.',
    rule: '천간·지지·간지 중 현침 조건에 해당할 때 감지합니다.',
  },
  정록: {
    summary: '꾸준한 수입, 직업 기반, 자기 몫을 얻는 힘과 관련된 길성입니다.',
    useWell: '한 분야에서 성실하게 신뢰를 쌓을 때 안정적인 기반으로 이어지기 쉽습니다.',
    caution: '안정만 고집하면 변화 대응이 늦을 수 있어 실력 갱신이 필요합니다.',
    rule: '일간 기준으로 정록 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  역마살: {
    summary: '이동, 변화, 외부 활동과 관련됩니다.',
    useWell: '출장, 영업, 여행, 온라인 활동처럼 움직이며 기회를 찾을 때 장점이 됩니다.',
    caution: '방향 없이 바쁘기만 하면 피로가 커지니 움직임에 목적을 두는 것이 좋습니다.',
    rule: '연지 또는 일지의 삼합 그룹을 기준으로 역마 지지가 있을 때 감지합니다.',
  },
  백호대살: {
    summary: '강한 돌파력과 긴장감을 함께 가진 별입니다.',
    useWell: '위기 대응, 현장 업무, 전문 기술처럼 집중력과 용기가 필요한 일에 쓸 수 있습니다.',
    caution: '무섭게 단정하기보다 급한 판단과 과한 무리를 줄이는 관리 포인트로 봅니다.',
    rule: '일주 또는 해당 기둥의 간지가 백호대살 조건에 해당할 때 감지합니다.',
  },
  천을귀인: {
    summary: '어려운 순간에 도움, 조언, 보호가 들어오기 쉬운 귀한 별입니다.',
    useWell: '좋은 사람과 제도, 조언을 받아들이는 태도를 가지면 장점이 커집니다.',
    caution: '도움이 자동으로 온다고 보기보다 평소 신뢰를 쌓는 것이 중요합니다.',
    rule: '일간 기준 천을귀인 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  문창귀인: {
    summary: '공부, 글쓰기, 말하기, 정리 능력과 관련된 길성입니다.',
    useWell: '기록, 발표, 자격증, 콘텐츠처럼 배운 것을 정리해 쓰는 일에 좋습니다.',
    caution: '생각만 많아지지 않도록 정리한 내용을 실제 결과물로 만드는 습관이 필요합니다.',
    rule: '일간 기준 문창귀인 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  금여성: {
    summary: '품위, 안정감, 좋은 인연과 생활의 여유를 뜻하는 길성입니다.',
    useWell: '태도, 신뢰, 관계의 품격을 지킬 때 사람과 기회가 자연스럽게 붙기 쉽습니다.',
    caution: '편안함에 머무르기보다 자기 실력과 생활 기반을 함께 키우는 것이 좋습니다.',
    rule: '일간 기준 금여성 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  태극귀인: {
    summary: '큰 흐름 속에서 보호와 회복을 받는 별입니다.',
    useWell: '힘든 경험을 배움으로 바꾸고 다시 방향을 잡는 회복력으로 쓰기 좋습니다.',
    caution: '운이 알아서 풀린다고 보기보다 고비마다 선택을 점검하는 태도가 필요합니다.',
    rule: '일간 기준 태극귀인 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  화개살: {
    summary: '혼자 몰입하는 힘, 예술성, 정신성, 깊은 생각과 관련됩니다.',
    useWell: '창작, 연구, 상담, 명리처럼 깊게 파고드는 분야에서 장점이 됩니다.',
    caution: '혼자만의 시간이 길어질 때는 관계와 생활 리듬을 일부러 챙기는 것이 좋습니다.',
    rule: '연지 또는 일지의 삼합 그룹을 기준으로 화개 지지가 있을 때 감지합니다.',
  },
  괴강살: {
    summary: '강한 고집과 돌파력, 리더십이 있는 별입니다.',
    useWell: '책임이 큰 일, 현장 판단, 리더 역할처럼 강한 결단이 필요한 곳에 좋습니다.',
    caution: '내 기준만 앞서면 주변과 부딪힐 수 있어 조율과 확인이 필요합니다.',
    rule: '해당 기둥의 간지가 괴강살 조건에 해당할 때 감지합니다.',
  },
  천문성: {
    summary: '직관, 영감, 깊은 관심사와 관련됩니다.',
    useWell: '상담, 연구, 명리, 창작처럼 보이지 않는 흐름을 읽는 일에 장점이 있습니다.',
    caution: '느낌만으로 결론 내리기보다 사실 확인과 기록을 함께하면 안정됩니다.',
    rule: '천문성 지지가 일지 또는 시지에 있을 때만 감지합니다.',
  },
  도화살: {
    summary: '인기, 매력, 주목도와 관련됩니다.',
    useWell: '홍보, 디자인, 콘텐츠, 서비스처럼 사람의 관심을 받는 일에 좋게 쓸 수 있습니다.',
    caution: '관계의 선이 흐려지면 오해가 생길 수 있어 표현 기준이 필요합니다.',
    rule: '연지 또는 일지의 삼합 그룹을 기준으로 도화 지지가 있을 때 감지합니다.',
  },
  홍염살: {
    summary: '은근한 매력과 감정적 끌림을 뜻합니다.',
    useWell: '친화력, 분위기, 감성 표현을 살리는 관계와 브랜딩에 장점이 있습니다.',
    caution: '호감이 오해로 번지지 않도록 말과 행동의 경계를 분명히 하면 좋습니다.',
    rule: '일간 기준 홍염살 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  공망: {
    summary: '어떤 영역이 바로 채워지지 않고 비어 있거나 늦게 채워지는 느낌입니다.',
    useWell: '집착을 줄이고 부족한 부분을 루틴과 계획으로 채우는 신호로 볼 수 있습니다.',
    caution: '없어진다는 뜻이 아니므로 겁내기보다 해당 위치를 천천히 관리하면 됩니다.',
    rule: '일주 기준 공망 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  양인살: {
    summary: '강한 자존심, 독립성, 돌파력과 관련됩니다.',
    useWell: '기술, 운동, 현장, 리더십처럼 힘을 훈련해서 쓰는 분야에 장점이 있습니다.',
    caution: '감정적으로 밀어붙이면 충돌이 커질 수 있어 속도 조절이 필요합니다.',
    rule: '양간 일간 기준 양인 지지에 해당하는 글자가 있을 때 감지합니다.',
  },
  귀문관살: {
    summary: '예민한 직관과 깊은 몰입을 뜻합니다.',
    useWell: '심리, 상담, 예술, 연구처럼 섬세하게 읽고 파고드는 일에 쓸 수 있습니다.',
    caution: '혼자 해석하고 결론 내리기보다 확인하는 대화가 필요합니다.',
    rule: '사주 지지 네 글자 안에 귀문관살 지지쌍이 함께 있을 때 감지합니다.',
  },
  천라지망: {
    summary: '일이 여러 조건에 얽혀 천천히 풀리는 흐름입니다.',
    useWell: '절차, 계약, 관리, 행정처럼 복잡한 것을 정리하는 능력으로 바꿀 수 있습니다.',
    caution: '막힌다고 단정하지 말고 순서와 조건을 하나씩 풀어가는 태도가 좋습니다.',
    rule: '사주 지지 네 글자 안에 술해 또는 진사 조합이 있을 때 감지합니다.',
  },
  고신살: {
    summary: '혼자 생각하고 독립적으로 서려는 성향입니다.',
    useWell: '혼자 집중하는 시간을 자기계발과 전문성으로 연결하면 좋습니다.',
    caution: '감정을 너무 숨기면 가까운 사람이 거리감을 느낄 수 있습니다.',
    rule: '연지 또는 일지의 삼합 그룹을 기준으로 고신 지지가 있을 때 감지합니다.',
  },
  과숙살: {
    summary: '마음을 천천히 열고 관계를 신중하게 선택하는 성향입니다.',
    useWell: '깊고 안정적인 관계를 만들기 위해 시간을 두고 살피는 힘으로 쓸 수 있습니다.',
    caution: '표현이 너무 늦으면 오해가 생길 수 있어 작은 감정부터 말하는 연습이 좋습니다.',
    rule: '연지 또는 일지의 삼합 그룹을 기준으로 과숙 지지가 있을 때 감지합니다.',
  },
}

const termDescriptions: Record<string, ChipDescription> = {
  '천간 십성': {
    summary: '천간 십성은 겉으로 드러나는 말, 선택, 사회적 태도를 보여줍니다.',
    useWell: '내가 밖에서 어떤 방식으로 행동하고 인정받으려 하는지 볼 때 참고합니다.',
    caution: '이것 하나만으로 성격을 단정하지 말고 지지와 전체 구조를 함께 봐야 합니다.',
  },
  '지지 십성': {
    summary: '지지 십성은 실제 생활 바닥에서 반복되는 습관과 관계 흐름을 보여줍니다.',
    useWell: '일상에서 자주 겪는 사람 문제, 돈 문제, 생활 패턴을 볼 때 도움이 됩니다.',
    caution: '겉모습보다 체감에 가까운 정보라 천간과 다르게 느껴질 수 있습니다.',
  },
  '12운성': {
    summary: '12운성은 기운이 어느 성장 단계에 있는지 보는 기준입니다.',
    useWell: '시작, 성장, 절정, 정리처럼 힘의 리듬을 이해할 때 쓰면 좋습니다.',
    caution: '좋고 나쁨보다 그 기운을 어떤 속도로 써야 하는지 보는 보조 정보입니다.',
  },
  '12신살': {
    summary: '12신살은 이동, 인기, 고독, 변화처럼 생활에서 드러나는 보조 흐름입니다.',
    useWell: '성격보다 사건의 분위기나 생활 패턴을 가볍게 참고할 때 좋습니다.',
    caution: '신살 이름만 보고 무섭게 단정하지 말고 원국과 함께 봐야 합니다.',
  },
}

type ResultView = 'manse' | 'reading' | 'daily'
type FortuneTab = 'today' | 'tomorrow' | 'week' | 'month'
type BirthProfile = {
  id: string
  name: string
  input: BirthInput
}

function numberField(value: string) {
  return Number.parseInt(value, 10) || 0
}

function getInitialBirthInput(): BirthInput {
  if (typeof window === 'undefined') {
    return initialForm
  }

  const sharedInput = parseBirthInputFromParams(new URLSearchParams(window.location.search))

  if (sharedInput) {
    return sharedInput
  }

  try {
    const savedInput = window.localStorage.getItem(savedBirthInputKey)

    if (!savedInput) {
      return initialForm
    }

    return normalizeBirthInput(JSON.parse(savedInput)) ?? initialForm
  } catch {
    return initialForm
  }
}

function getInitialProfileName() {
  if (typeof window === 'undefined') {
    return '나'
  }

  const name = normalizeProfileName(new URLSearchParams(window.location.search).get('name') ?? '', '나')

  return name
}

function getInitialProfiles(): BirthProfile[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawProfiles = window.localStorage.getItem(savedProfilesKey)
    const profiles = normalizeProfiles(rawProfiles ? JSON.parse(rawProfiles) : null)

    if (profiles.length) {
      return profiles
    }

    const legacyInput = normalizeBirthInput(JSON.parse(window.localStorage.getItem(savedBirthInputKey) ?? 'null'))

    return legacyInput ? [{ id: createProfileId(), name: '저장된 사람', input: legacyInput }] : []
  } catch {
    return []
  }
}

function normalizeProfiles(value: unknown): BirthProfile[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return []
    }

    const profile = item as Partial<BirthProfile>
    const input = normalizeBirthInput(profile.input ?? null)
    const name = normalizeProfileName(profile.name, '이름 없음')

    return input
      ? [
          {
            id: typeof profile.id === 'string' && profile.id ? profile.id : createProfileId(),
            name,
            input,
          },
        ]
      : []
  }).slice(0, maxSavedProfiles)
}

function createProfileId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeProfileName(value: unknown, fallback = '') {
  const text = typeof value === 'string' ? value : ''
  const cleaned = text
    .replace(/[\u0000-\u001f\u007f<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxProfileNameLength)

  return cleaned || fallback
}

function buildShareUrl(input: BirthInput, name = '', view: ResultView = 'manse') {
  const url = new URL(window.location.href)

  url.search = ''
  if (view !== 'manse') {
    url.searchParams.set('view', view)
  }
  url.searchParams.set('y', String(input.year))
  url.searchParams.set('m', String(input.month))
  url.searchParams.set('d', String(input.day))
  url.searchParams.set('h', String(input.hour))
  url.searchParams.set('min', String(input.minute))
  url.searchParams.set('g', input.gender)
  url.searchParams.set('lunar', input.isLunar ? '1' : '0')
  url.searchParams.set('leap', input.isLeapMonth ? '1' : '0')
  url.searchParams.set('db', input.dayBoundary ?? 'midnight')
  if (name.trim()) {
    url.searchParams.set('name', name.trim())
  }

  return url.toString()
}

function parseResultViewFromParams(params: URLSearchParams): ResultView {
  const view = params.get('view') ?? params.get('target')

  if (view === 'daily' || view === 'today') {
    return 'daily'
  }

  if (view === 'reading') {
    return 'reading'
  }

  return 'manse'
}

function parseBirthInputFromParams(params: URLSearchParams) {
  if (!params.has('y') || !params.has('m') || !params.has('d')) {
    return null
  }

  return normalizeBirthInput({
    year: Number(params.get('y')),
    month: Number(params.get('m')),
    day: Number(params.get('d')),
    hour: Number(params.get('h') ?? initialForm.hour),
    minute: Number(params.get('min') ?? initialForm.minute),
    gender: params.get('g') === 'female' ? 'female' : 'male',
    isLunar: params.get('lunar') === '1',
    isLeapMonth: params.get('leap') === '1',
    dayBoundary: params.get('db') as BirthInput['dayBoundary'],
  })
}

function formatBirthProfile(input: BirthInput) {
  const calendar = input.isLunar ? '음력' : '양력'
  const leap = input.isLunar && input.isLeapMonth ? ' 윤달' : ''
  const time = `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`

  return `${calendar}${leap} ${input.year}.${input.month}.${input.day} ${time}`
}

function App() {
  const [form, setForm] = useState<BirthInput>(() => getInitialBirthInput())
  const [view, setView] = useState<ResultView>(() =>
    typeof window === 'undefined' ? 'manse' : parseResultViewFromParams(new URLSearchParams(window.location.search)),
  )
  const [saveStatus, setSaveStatus] = useState('')
  const [shareUrlPreview, setShareUrlPreview] = useState('')
  const [profiles, setProfiles] = useState<BirthProfile[]>(() => getInitialProfiles())
  const [profileName, setProfileName] = useState(() => getInitialProfileName())
  const [selectedProfileId, setSelectedProfileId] = useState('')

  const result = useMemo(() => {
    try {
      return {
        chart: calculateSajuChart(form),
        error: '',
      }
    } catch (error) {
      return {
        chart: null,
        error: error instanceof Error ? error.message : '계산 중 문제가 생겼습니다.',
      }
    }
  }, [form])

  useEffect(() => {
    const name = profileName.trim() || '나'
    const viewLabel: Record<ResultView, string> = {
      manse: '만세력',
      reading: '사주 풀이',
      daily: '오늘의 운세',
    }

    document.title = `${name} ${viewLabel[view]} | 사주팔자`
  }, [profileName, view])

  const updateForm = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setSaveStatus('')
    setShareUrlPreview('')
  }

  const resetForm = () => {
    setForm(initialForm)
    setProfileName('나')
    setSelectedProfileId('')
    setSaveStatus('')
    setShareUrlPreview('')
  }

  const saveBirthInput = () => {
    const name = normalizeProfileName(profileName, '이름 없음')
    const nextProfile = {
      id: selectedProfileId || createProfileId(),
      name,
      input: form,
    }
    const nextProfiles = (selectedProfileId
      ? profiles.map((profile) => (profile.id === selectedProfileId ? nextProfile : profile))
      : [...profiles, nextProfile]
    ).slice(-maxSavedProfiles)

    setProfiles(nextProfiles)
    setSelectedProfileId(nextProfile.id)
    window.localStorage.setItem(savedProfilesKey, JSON.stringify(nextProfiles))
    window.localStorage.setItem(savedBirthInputKey, JSON.stringify(form))
    setSaveStatus(`${name} 사주를 이 브라우저에 저장했습니다.`)
    setShareUrlPreview('')
  }

  const loadProfile = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId)

    if (!profile) {
      setSelectedProfileId('')
      return
    }

    setSelectedProfileId(profile.id)
    setProfileName(profile.name)
    setForm(profile.input)
    setView('manse')
    setSaveStatus(`${profile.name} 사주를 불러왔습니다.`)
    setShareUrlPreview('')
  }

  const startNewProfile = () => {
    setSelectedProfileId('')
    setProfileName('')
    setForm(initialForm)
    setView('manse')
    setSaveStatus('새 사람 정보를 입력하세요.')
    setShareUrlPreview('')
  }

  const deleteProfile = (profileId: string) => {
    const profile = profiles.find((item) => item.id === profileId)

    if (!profile) {
      return
    }

    const nextProfiles = profiles.filter((item) => item.id !== profileId)

    setProfiles(nextProfiles)
    window.localStorage.setItem(savedProfilesKey, JSON.stringify(nextProfiles))
    if (selectedProfileId === profileId) {
      setSelectedProfileId('')
    }
    setSaveStatus(`${profile.name} 저장 정보를 삭제했습니다.`)
    setShareUrlPreview('')
  }

  const shareBirthInput = async () => {
    const shareUrl = buildShareUrl(form, '', view)

    try {
      await navigator.clipboard.writeText(shareUrl)
      setSaveStatus('이름을 제외한 공유 링크를 클립보드에 복사했습니다.')
    } catch {
      window.history.replaceState(null, '', shareUrl)
      setSaveStatus('주소창에 이름을 제외한 공유 링크를 반영했습니다.')
    }
    setShareUrlPreview(shareUrl)
  }

  const clearSavedProfiles = () => {
    const ok = window.confirm('이 브라우저에 저장된 사주 정보를 모두 삭제할까요?')

    if (!ok) {
      return
    }

    window.localStorage.removeItem(savedProfilesKey)
    window.localStorage.removeItem(savedBirthInputKey)
    setProfiles([])
    setSelectedProfileId('')
    setSaveStatus('이 브라우저에 저장된 사주 정보를 모두 삭제했습니다.')
    setShareUrlPreview('')
  }

  return (
    <main className="app-shell">
      <section className="intro-band">
        <div className="intro-copy">
          <p className="eyebrow">Saju Engine MVP</p>
          <h1>사주팔자 만세력</h1>
          <p>기초 명식과 신살, 길성, 관계를 핵심/참고로 나눠 읽기 쉽게 정리합니다.</p>
        </div>
        <div className="engine-status" aria-label="engine status">
          <ShieldCheck size={18} />
          <span>manseryeok 기준 + ssaju 비교 구조</span>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="panel-heading">
            <CalendarDays size={20} />
            <h2>출생 정보</h2>
            <button
              className="icon-button"
              type="button"
              aria-label="입력값 초기화"
              title="입력값 초기화"
              onClick={resetForm}
            >
              <RotateCcw size={17} />
            </button>
          </div>

          <div className="profile-tools">
            <label>
              <span>대상 이름</span>
              <input
                type="text"
                value={profileName}
                placeholder="예: 나, 엄마, 친구"
                onChange={(event) => {
                  setProfileName(normalizeProfileName(event.target.value))
                  setSaveStatus('')
                }}
              />
            </label>
            <label>
              <span>저장된 사람</span>
              <select value={selectedProfileId} onChange={(event) => loadProfile(event.target.value)}>
                <option value="">직접 입력 중</option>
                {profiles.map((profile) => (
                  <option value={profile.id} key={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="secondary-tool-button" type="button" onClick={startNewProfile}>
              새 사람 입력
            </button>
            <p className="privacy-hint">
              저장 기능은 이 브라우저에만 보관됩니다. 공유 링크에는 출생 정보가 포함되며 이름은 기본 제외됩니다.
            </p>
          </div>

          <div className="field-grid">
            <NumberInput
              label="연도"
              value={form.year}
              min={1391}
              max={2100}
              onChange={(value) => updateForm('year', value)}
            />
            <NumberInput
              label="월"
              value={form.month}
              min={1}
              max={12}
              onChange={(value) => updateForm('month', value)}
            />
            <NumberInput
              label="일"
              value={form.day}
              min={1}
              max={31}
              onChange={(value) => updateForm('day', value)}
            />
            <NumberInput
              label="시"
              value={form.hour}
              min={0}
              max={23}
              onChange={(value) => updateForm('hour', value)}
            />
            <NumberInput
              label="분"
              value={form.minute}
              min={0}
              max={59}
              onChange={(value) => updateForm('minute', value)}
            />
            <label>
              <span>성별</span>
              <select
                value={form.gender}
                onChange={(event) => updateForm('gender', event.target.value as BirthInput['gender'])}
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </label>
          </div>

          <div className="toggle-row">
            <label className="check-control">
              <input
                type="checkbox"
                checked={Boolean(form.isLunar)}
                onChange={(event) => updateForm('isLunar', event.target.checked)}
              />
              <span>음력</span>
            </label>
            <label className="check-control">
              <input
                type="checkbox"
                checked={Boolean(form.isLeapMonth)}
                disabled={!form.isLunar}
                onChange={(event) => updateForm('isLeapMonth', event.target.checked)}
              />
              <span>윤달</span>
            </label>
          </div>

          <details className="advanced-settings">
            <summary>고급 시간 기준</summary>
            <label>
              <span>자시 기준</span>
              <select
                value={form.dayBoundary ?? 'midnight'}
                onChange={(event) => updateForm('dayBoundary', event.target.value as BirthInput['dayBoundary'])}
              >
                <option value="midnight">자정 기준: 00:00에 일주 변경</option>
                <option value="jasi">자시 기준: 23:00부터 다음 일주</option>
                <option value="splitJasi">야자시/조자시: 일주는 유지, 시주만 다음 일간</option>
              </select>
            </label>
            <div className="setting-note-grid">
              <span>시간대</span>
              <strong>한국 시간 Asia/Seoul</strong>
              <span>절기</span>
              <strong>정밀 24절기 절입시각</strong>
              <span>진태양시</span>
              <strong>미적용</strong>
            </div>
            <p className="advanced-setting-note">
              자정 기준이 아닌 옵션은 23시대 출생자의 일주·시주가 달라질 수 있습니다. 신강/신약 같은 보조 분석은 기본 기준 참고값으로 함께 봅니다.
            </p>
          </details>

          <div className="input-actions">
            <button type="button" onClick={saveBirthInput}>
              <Save size={16} />
              <span>저장</span>
            </button>
            <button type="button" onClick={shareBirthInput}>
              <Share2 size={16} />
              <span>이름 제외 공유</span>
            </button>
          </div>
          {saveStatus ? <p className="save-status">{saveStatus}</p> : null}
          {shareUrlPreview ? (
            <div className="share-preview">
              <span>공유 링크</span>
              <input value={shareUrlPreview} readOnly aria-label="공유 링크" />
            </div>
          ) : null}
          {profiles.length ? (
            <section className="saved-profile-list" aria-label="저장된 사람 목록">
              <div className="saved-profile-head">
                <span>최근 저장</span>
                <small>{profiles.length}명</small>
              </div>
              {profiles.slice().reverse().map((profile) => (
                <article className={profile.id === selectedProfileId ? 'active' : ''} key={profile.id}>
                  <button type="button" onClick={() => loadProfile(profile.id)}>
                    <strong>{profile.name}</strong>
                    <small>{formatBirthProfile(profile.input)}</small>
                  </button>
                  <button
                    className="delete-profile-button"
                    type="button"
                    aria-label={`${profile.name} 저장 정보 삭제`}
                    title="삭제"
                    onClick={() => deleteProfile(profile.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </article>
              ))}
              <button className="clear-profile-button" type="button" onClick={clearSavedProfiles}>
                저장정보 전체 삭제
              </button>
            </section>
          ) : null}
        </form>

        <section className="result-panel">
          {result.error || !result.chart ? (
            <div className="empty-state">
              <h2>계산할 수 없는 입력입니다</h2>
              <p>{result.error}</p>
            </div>
          ) : (
            <SajuResult
              chart={result.chart}
              profileName={normalizeProfileName(profileName, '이름 없음')}
              view={view}
              onViewChange={setView}
              onShare={shareBirthInput}
            />
          )}
        </section>
      </section>
    </main>
  )
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(numberField(event.target.value))}
      />
    </label>
  )
}

function CalculationStandardBadges({ chart }: { chart: SajuChart }) {
  const dayBoundaryLabels: Record<NonNullable<BirthInput['dayBoundary']>, string> = {
    midnight: '자정 기준',
    jasi: '자시 기준',
    splitJasi: '야자시/조자시',
  }

  return (
    <div className="standard-badges" aria-label="현재 계산 기준">
      <span>한국 시간</span>
      <span>절입시각 기준</span>
      <span>{dayBoundaryLabels[chart.input.dayBoundary ?? 'midnight']}</span>
      <span>진태양시 미적용</span>
      {(chart.input.dayBoundary ?? 'midnight') !== 'midnight' ? <span>보조 분석 기준 주의</span> : null}
    </div>
  )
}

function SajuResult({
  chart,
  profileName,
  view,
  onViewChange,
  onShare,
}: {
  chart: SajuChart
  profileName: string
  view: ResultView
  onViewChange: (view: ResultView) => void
  onShare: () => void
}) {
  const dayPillar = chart.pillars.find((pillar) => pillar.key === 'day')
  const strongestElement = [...chart.elementSummary].sort((a, b) => b.count - a.count)[0]
  const weakElements = chart.elementSummary.filter((item) => item.count === 0)
  const [calendarCursor, setCalendarCursor] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  }))
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => toDateKey(new Date()))
  const calendar = useMemo(
    () => buildManseCalendarMonth(calendarCursor.year, calendarCursor.month),
    [calendarCursor],
  )
  const selectedCalendarDay =
    calendar.days.find((day) => day.date === selectedCalendarDate && day.isCurrentMonth) ??
    calendar.days.find((day) => day.isCurrentMonth) ??
    calendar.days[0]
  const dailyFortune = useMemo(
    () => buildDailyFortuneReading(chart, selectedCalendarDay),
    [chart, selectedCalendarDay],
  )
  const tomorrowDay = useMemo(() => getCalendarDayByDate(shiftDateKey(selectedCalendarDay.date, 1)), [selectedCalendarDay.date])
  const tomorrowFortune = useMemo(
    () => buildDailyFortuneReading(chart, tomorrowDay),
    [chart, tomorrowDay],
  )
  const weeklyFortune = useMemo(
    () => buildPeriodFortuneReading(chart, getSelectedWeekDays(calendar, selectedCalendarDay.date), 'week'),
    [calendar, chart, selectedCalendarDay.date],
  )
  const monthlyFortune = useMemo(
    () => buildPeriodFortuneReading(chart, calendar.days.filter((day) => day.isCurrentMonth), 'month'),
    [calendar, chart],
  )

  const moveCalendarMonth = (delta: number) => {
    setCalendarCursor((current) => {
      const next = shiftCalendarMonth(current, delta)
      setSelectedCalendarDate(toDateKey(new Date(next.year, next.month - 1, 1)))

      return next
    })
  }

  if (view === 'reading') {
    return <SajuReading chart={chart} profileName={profileName} onBack={() => onViewChange('manse')} onShare={onShare} />
  }

  if (view === 'daily') {
    return (
      <SajuDailyFortune
        calendar={calendar}
        dailyFortune={dailyFortune}
        tomorrowFortune={tomorrowFortune}
        weeklyFortune={weeklyFortune}
        monthlyFortune={monthlyFortune}
        chart={chart}
        profileName={profileName}
        selectedDate={selectedCalendarDay.date}
        onBack={() => onViewChange('manse')}
        onSelectDate={setSelectedCalendarDate}
        onPrev={() => moveCalendarMonth(-1)}
        onNext={() => moveCalendarMonth(1)}
      />
    )
  }

  return (
    <>
      <div className="result-heading">
        <div>
          <p className="eyebrow">명식 요약</p>
          <h2>{profileName} 사주: {chart.summary}</h2>
          <CalculationStandardBadges chart={chart} />
        </div>
        <button className="print-button" type="button" onClick={onShare}>
          <Share2 size={16} />
          <span>공유</span>
        </button>
      </div>

      <section className="quick-summary">
        <SummaryTile label="일간" value={dayPillar?.stem ?? '-'} note={`${dayPillar?.korean ?? '-'} 일주`} />
        <SummaryTile
          label="강한 오행"
          value={strongestElement?.element ?? '-'}
          note={`${strongestElement?.percentage.toFixed(1) ?? '-'}%`}
        />
        <SummaryTile
          label="부족한 오행"
          value={weakElements.length ? weakElements.map((item) => item.element).join(', ') : '없음'}
          note="천간/지지 8글자 기준"
        />
        <SummaryTile
          label="대운"
          value={chart.luck.direction}
          note={`만 ${chart.luck.startAge ?? '-'}세 시작`}
        />
      </section>

      <div className="primary-action-row">
        <button className="primary-action" type="button" onClick={() => onViewChange('reading')}>
          <BookOpenText size={18} />
          <span>사주 풀이 보기</span>
        </button>
        <button className="primary-action secondary-action" type="button" onClick={() => onViewChange('daily')}>
          <CalendarDays size={18} />
          <span>오늘의 운세 보기</span>
        </button>
      </div>

      <details className="saju-disclosure" open>
        <summary>
          <span>사주 명식표</span>
          <small>천간, 지지, 십성, 지장간</small>
        </summary>
        <div className="pillar-grid">
          {chart.pillars.map((pillar) => (
            <article className="pillar-card" key={pillar.key}>
              <div className="pillar-card-head">
                <span>{pillar.label}</span>
                <small>{pillar.hanja}</small>
              </div>
              <strong>{pillar.korean}</strong>
              <div className="meta-list">
                <InfoTerm label={`천간 십성 ${pillar.stemTenGod}`} term="천간 십성" />
                <InfoTerm label={`지지 십성 ${pillar.branchTenGod}`} term="지지 십성" />
                <InfoTerm label={`12운성 ${pillar.twelveLifeStage}`} term="12운성" />
                <InfoTerm label={`12신살 ${pillar.twelveGodStar}`} term="12신살" />
              </div>
              <div className="hidden-stem-row">
                {pillar.hiddenStems.map((hiddenStem) => (
                  <span key={`${pillar.key}-${hiddenStem.stem}`}>
                    {hiddenStem.stem} {hiddenStem.tenGod}
                  </span>
                ))}
              </div>
              <ChipRow
                values={pillar.specialStars}
                emptyLabel="주요 신살 없음"
                meta={Object.fromEntries(
                  pillar.specialStars.map((name) => {
                    const star = chart.specialStars.find((item) => item.name === name)

                    return [
                      name,
                      {
                        level: star?.level === 'core' ? '중요' : '참고',
                        position: `${pillar.label} ${pillar.korean}`,
                      },
                    ]
                  }),
                )}
              />
            </article>
          ))}
        </div>
      </details>

      <div className="detail-grid">
        <section>
          <h3>공망</h3>
          <ChipRow values={chart.voidBranches} emptyLabel="없음" />
        </section>
        <section className="luck-basis-card">
          <h3>대운 방향</h3>
          <p>{chart.luck.direction}</p>
          <small>첫 대운 시작: 만 {chart.luck.startAge ?? '-'}세</small>
          <div className="luck-basis">
            <span>계산 근거</span>
            <p>{chart.luck.basis.directionReason}</p>
            <details className="inline-basis-details">
              <summary>자세한 계산 근거 보기</summary>
              <p>{chart.luck.basis.startAgeReason}</p>
              <LuckBasisFacts chart={chart} />
            </details>
          </div>
        </section>
      </div>

      <details className="saju-disclosure">
        <summary>
          <span>신살과 길성</span>
          <small>핵심 {chart.coreSpecialStars.length}개, 참고 {chart.referenceSpecialStars.length}개</small>
        </summary>
        <h4>핵심</h4>
        <InfoGrid
          items={chart.coreSpecialStars.map((star) => ({
            label: star.category,
            title: star.name,
            note: star.reason,
          }))}
          emptyLabel="감지된 핵심 신살/길성이 없습니다."
        />
        <h4>참고</h4>
        <InfoGrid
          muted
          items={chart.referenceSpecialStars.map((star) => ({
            label: star.category,
            title: star.name,
            note: star.reason,
          }))}
          emptyLabel="감지된 참고 신살/길성이 없습니다."
        />
      </details>

      <details className="saju-disclosure">
        <summary>
          <span>합충형파해</span>
          <small>요약 {chart.summaryRelations.length}개, 상세 {chart.detailRelations.length}개</small>
        </summary>
        <h4>요약</h4>
        <InfoGrid
          items={chart.summaryRelations.map((relation) => ({
            label: relation.type,
            title: relation.label,
            note: relation.transformsTo ? `${relation.transformsTo}국` : '',
          }))}
          emptyLabel="감지된 핵심 관계가 없습니다."
        />
        <h4>상세</h4>
        <InfoGrid
          muted
          items={chart.detailRelations.map((relation) => ({
            label: relation.type,
            title: relation.label,
            note: relation.transformsTo ? `${relation.transformsTo}국` : '',
          }))}
          emptyLabel="감지된 상세 관계가 없습니다."
        />
      </details>

      <details className="saju-disclosure">
        <summary>
          <span>오행 분포</span>
          <small>강한 오행 {strongestElement?.element ?? '-'} / 부족 {weakElements.length ? weakElements.map((item) => item.element).join(', ') : '없음'}</small>
        </summary>
        <div className="element-list">
          {chart.elementSummary.map((item) => (
            <div className="element-item" key={item.element}>
              <span>{item.element}</span>
              <strong>{item.percentage.toFixed(1)}%</strong>
              <small>{item.status}</small>
            </div>
          ))}
        </div>
      </details>

      <details className="saju-disclosure">
        <summary>
          <span>고급 분석</span>
          <small>{formatStrength(chart.advanced.dayStrength.strength)} / {chart.advanced.geukguk}</small>
        </summary>
        <div className="analysis-grid">
          <SummaryTile
            label="신강/신약"
            value={formatStrength(chart.advanced.dayStrength.strength)}
            note={`점수 ${chart.advanced.dayStrength.score}`}
          />
          <SummaryTile label="격국" value={chart.advanced.geukguk} note="월지와 구조 기준" />
          <SummaryTile
            label="용신"
            value={chart.advanced.yongsin.length ? chart.advanced.yongsin.join(', ') : '-'}
            note="보완 기운 후보"
          />
        </div>
        <p className="analysis-note">{chart.advanced.interpretation}</p>
      </details>

      <details className="saju-disclosure">
        <summary>
          <span>세운</span>
          <small>{chart.yearlyFortunes[0]?.label ?? '-'} {chart.yearlyFortunes[0]?.ganzhi ?? '-'}</small>
        </summary>
        <FlowGrid items={chart.yearlyFortunes} period="year" />
      </details>

      <details className="saju-disclosure">
        <summary>
          <span>월운</span>
          <small>{chart.monthlyFortunes[0]?.label ?? '-'} {chart.monthlyFortunes[0]?.ganzhi ?? '-'}</small>
        </summary>
        <FlowGrid items={chart.monthlyFortunes} period="month" />
      </details>

      <details className="saju-disclosure">
        <summary>
          <span>대운 미리보기</span>
          <small>{chart.luck.direction}, 만 {chart.luck.startAge ?? '-'}세 시작</small>
        </summary>
        <div className="luck-explain">
          <div>
            <span>방향</span>
            <strong>{chart.luck.direction}</strong>
            <small>{chart.luck.basis.yearStem}{chart.luck.basis.yearStemYinYang}년 · {chart.luck.basis.gender === 'male' ? '남성' : '여성'}</small>
          </div>
          <p>{chart.luck.basis.startAgeReason}</p>
          <details className="inline-basis-details">
            <summary>절입시각과 시간 차이 보기</summary>
            <LuckBasisFacts chart={chart} />
          </details>
          <small>{chart.luck.basis.boundaryNotice}</small>
        </div>
        <div className="luck-list">
          {chart.luck.pillars.slice(0, 8).map((luck) => (
            <div className="luck-item" key={`${luck.age}-${luck.korean}`}>
              <span>{luck.age}세</span>
              <strong>{luck.korean}</strong>
              <small>
                {luck.stemTenGod}/{luck.branchTenGod} · {luck.twelveLifeStage}
              </small>
            </div>
          ))}
        </div>
      </details>
    </>
  )
}

function LuckBasisFacts({ chart }: { chart: SajuChart }) {
  const facts = [
    { label: '기준 절기', value: chart.luck.basis.referenceTermName },
    { label: '절입시각', value: chart.luck.basis.referenceTermTime },
    { label: '출생시각', value: chart.luck.basis.birthTime },
    { label: '시간 차이', value: chart.luck.basis.timeDifference },
    { label: '정밀 환산', value: chart.luck.basis.preciseStart },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value))

  if (!facts.length) {
    return null
  }

  return (
    <dl className="luck-basis-facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SajuDailyFortune({
  calendar,
  dailyFortune,
  tomorrowFortune,
  weeklyFortune,
  monthlyFortune,
  chart,
  profileName,
  selectedDate,
  onBack,
  onSelectDate,
  onPrev,
  onNext,
}: {
  calendar: ManseCalendarMonth
  dailyFortune: DailyFortuneReading
  tomorrowFortune: DailyFortuneReading
  weeklyFortune: PeriodFortuneReading
  monthlyFortune: PeriodFortuneReading
  chart: SajuChart
  profileName: string
  selectedDate: string
  onBack: () => void
  onSelectDate: (date: string) => void
  onPrev: () => void
  onNext: () => void
}) {
  const [activeTab, setActiveTab] = useState<FortuneTab>('today')
  const relatedSigns = getRelatedSigns(chart)

  return (
    <>
      <div className="result-heading reading-heading">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          <span>만세력으로 돌아가기</span>
        </button>
        <div>
          <p className="eyebrow">Daily Fortune</p>
          <h2>{profileName} 오늘의 운세</h2>
        </div>
      </div>

      <section className="daily-overview">
        <article>
          <span>오늘 점수</span>
          <strong>{dailyFortune.averageScore}점</strong>
          <small>체감상 상위 {dailyFortune.topPercent}% 흐름</small>
        </article>
        <article>
          <span>밀어볼 운</span>
          <strong>{getStrongestDailyCategory(dailyFortune).category}</strong>
          <small>{getStrongestDailyCategory(dailyFortune).score}점 · 먼저 힘을 실을 영역</small>
        </article>
        <article>
          <span>조심할 운</span>
          <strong>{getWeakestDailyCategory(dailyFortune).category}</strong>
          <small>{getWeakestDailyCategory(dailyFortune).score}점 · 무리하지 않을 영역</small>
        </article>
      </section>

      <section className="saju-section daily-section">
        <details className="daily-calendar-details">
          <summary>
            <span>날짜 바꾸기</span>
            <small>{dailyFortune.title}</small>
          </summary>
          <ManseCalendar
            calendar={calendar}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onPrev={onPrev}
            onNext={onNext}
          />
        </details>
      </section>

      <section className="saju-section daily-section fortune-tabs-section">
        <div className="fortune-tabs" role="tablist" aria-label="운세 보기 범위">
          <FortuneTabButton active={activeTab === 'today'} label="오늘" onClick={() => setActiveTab('today')} />
          <FortuneTabButton active={activeTab === 'tomorrow'} label="내일" onClick={() => setActiveTab('tomorrow')} />
          <FortuneTabButton active={activeTab === 'week'} label="주간" onClick={() => setActiveTab('week')} />
          <FortuneTabButton active={activeTab === 'month'} label="월간" onClick={() => setActiveTab('month')} />
        </div>

        {activeTab === 'today' ? (
          <>
            <SectionHeader title="선택 날짜 풀이" description="내 원국과 선택한 일진의 관계를 간단히 해석합니다." />
            <DailyFortunePanel reading={dailyFortune} relatedSigns={relatedSigns} />
          </>
        ) : null}

        {activeTab === 'tomorrow' ? (
          <>
            <SectionHeader title="내일의 운세" description="선택 날짜 다음 날의 흐름을 미리 봅니다." />
            <DailyFortunePanel reading={tomorrowFortune} relatedSigns={relatedSigns} />
          </>
        ) : null}

        {activeTab === 'week' ? (
          <>
            <SectionHeader title="주간 운세" description="선택 날짜가 포함된 한 주의 흐름을 봅니다." />
            <PeriodFortunePanel reading={weeklyFortune} relatedSigns={relatedSigns} />
          </>
        ) : null}

        {activeTab === 'month' ? (
          <>
            <SectionHeader title="월간 운세" description="현재 달의 전체 일진 흐름을 요약합니다." />
            <PeriodFortunePanel reading={monthlyFortune} relatedSigns={relatedSigns} />
          </>
        ) : null}
      </section>
    </>
  )
}

function FortuneTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button className={active ? 'active' : ''} type="button" role="tab" aria-selected={active} onClick={onClick}>
      {label}
    </button>
  )
}

function ManseCalendar({
  calendar,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
}: {
  calendar: ManseCalendarMonth
  selectedDate: string
  onSelectDate: (date: string) => void
  onPrev: () => void
  onNext: () => void
}) {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="calendar-shell">
      <div className="calendar-toolbar">
        <button type="button" onClick={onPrev} aria-label="이전 달" title="이전 달">
          <ChevronLeft size={17} />
        </button>
        <strong>{calendar.title}</strong>
        <button type="button" onClick={onNext} aria-label="다음 달" title="다음 달">
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {calendar.days.map((day) => (
          <button
            className={`calendar-day ${day.isCurrentMonth ? '' : 'muted'} ${day.isToday ? 'today' : ''} ${
              day.date === selectedDate ? 'selected' : ''
            }`}
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
          >
            <div className="calendar-day-head">
              <strong>{day.day}</strong>
              {day.solarTerm ? <span>{day.solarTerm}</span> : null}
            </div>
            <p>{day.dayGanji}</p>
            <small>음 {day.lunarLabel}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function DailyFortunePanel({ reading, relatedSigns }: { reading: DailyFortuneReading; relatedSigns: string[] }) {
  const strongestCategory = getStrongestDailyCategory(reading)
  const weakestCategory = getWeakestDailyCategory(reading)
  const oneLineAdvice = buildDailyOneLineAdvice(reading, strongestCategory, weakestCategory)

  return (
    <article className="daily-fortune-panel">
      <div className="daily-fortune-head">
        <div>
          <span>선택한 일진</span>
          <strong>{reading.title}</strong>
        </div>
        <div className="daily-fortune-tags">
          <span>{reading.tenGod}</span>
          <span>지지 {reading.branchTenGod}</span>
        </div>
      </div>

      <div className={`daily-summary-card ${getScoreTone(reading.averageScore)}`}>
        <div>
          <span>오늘의 결론</span>
          <strong>{reading.averageScore}점 · 상위 {reading.topPercent}%</strong>
        </div>
        <p>{reading.headline}</p>
        <small>{oneLineAdvice}</small>
        <ScoreMeter score={reading.averageScore} />
      </div>

      <details className="daily-detail-story">
        <summary>자세한 흐름 보기</summary>
        <FortuneStory text={reading.narrative} relatedSigns={relatedSigns} />
      </details>

      <p className="analysis-note">{reading.elementTone}</p>
      <div className="fortune-brief">
        <div>
          <span>밀어볼 영역</span>
          <strong>{strongestCategory.category}</strong>
          <small>{strongestCategory.score}점 · {strongestCategory.advice}</small>
        </div>
        <div>
          <span>조심할 영역</span>
          <strong>{weakestCategory.category}</strong>
          <small>{weakestCategory.score}점 · {weakestCategory.advice}</small>
        </div>
      </div>
      <div className="daily-time-grid">
        {reading.timeTips.map((tip) => (
          <section key={tip.label}>
            <span>{tip.label}</span>
            <p>{tip.text}</p>
          </section>
        ))}
      </div>
      <div className="daily-category-grid">
        {reading.categoryReadings.map((category) => (
          <article className={`daily-category-card ${getScoreTone(category.score)}`} key={category.category}>
            <div>
              <span>{category.category}</span>
              <strong>{category.score}</strong>
            </div>
            <ScoreMeter score={category.score} />
            <p>{category.summary}</p>
            <small>{category.advice}</small>
            <small>근거: {category.basis}</small>
          </article>
        ))}
      </div>
      <div className="daily-fortune-grid">
        <section>
          <h4>오늘 바로 할 일</h4>
          <ul>
            {reading.actionTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
        <section>
          <h4>주의할 점</h4>
          <p>{reading.caution}</p>
        </section>
      </div>
      <div className="daily-relation-list">
        <h4>원국과의 관계</h4>
        {reading.relationHighlights.length ? (
          <div className="info-grid">
            {reading.relationHighlights.map((relation) => (
              <div className={`info-item ${relation.tone}`} key={`${relation.pillarLabel}-${relation.type}-${relation.label}`}>
                <span>{relation.pillarLabel}</span>
                <strong>{relation.type}</strong>
                <small>{relation.label}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-text">강하게 잡히는 합충형파해 관계는 없습니다.</p>
        )}
      </div>
      <small className="daily-basis">{reading.basis}</small>
    </article>
  )
}

function buildDailyOneLineAdvice(
  reading: DailyFortuneReading,
  strongestCategory: DailyCategoryReading,
  weakestCategory: DailyCategoryReading,
) {
  const scoreTone =
    reading.averageScore >= 70
      ? '밀어붙이기보다 좋은 흐름을 선별해 쓰면 좋습니다.'
      : reading.averageScore >= 58
        ? '무리한 확장보다 선택과 집중이 잘 맞습니다.'
        : '속도를 낮추고 정리부터 하는 편이 좋습니다.'

  return `${strongestCategory.category}은 활용하고, ${weakestCategory.category}은 한 번 더 점검하세요. ${scoreTone}`
}

function PeriodFortunePanel({ reading, relatedSigns }: { reading: PeriodFortuneReading; relatedSigns: string[] }) {
  return (
    <article className={`period-panel ${getScoreTone(reading.averageScore)}`}>
      <div className="period-head">
        <div>
          <span>{reading.title}</span>
          <strong>{reading.averageScore}</strong>
        </div>
        <ScoreMeter score={reading.averageScore} />
        <p>{reading.headline}</p>
      </div>
      <div className={`fortune-rank-card ${getScoreTone(reading.averageScore)}`}>
        <span>나의 운 흐름</span>
        <strong>상위 {reading.topPercent}%</strong>
        <small>{reading.rankText}</small>
      </div>
      <FortuneStory text={reading.narrative} relatedSigns={relatedSigns} />
      <div className="period-focus">
        <p>{reading.focus}</p>
        <div>
          {reading.dominantTenGods.map((tenGod) => (
            <span key={`${reading.period}-ten-${tenGod}`}>{tenGod}</span>
          ))}
          {reading.dominantElements.map((element) => (
            <span key={`${reading.period}-element-${element}`}>{element}</span>
          ))}
        </div>
      </div>
      <div className="period-score-list">
        {reading.categoryScores.map((category) => (
          <div className={getScoreTone(category.score)} key={`${reading.period}-${category.category}`}>
            <span>{category.category}</span>
            <strong>{category.score}</strong>
            <ScoreMeter score={category.score} />
          </div>
        ))}
      </div>
      <div className="period-insight-grid">
        <section>
          <h4>기회</h4>
          <p>{reading.opportunity}</p>
        </section>
        <section>
          <h4>주의</h4>
          <p>{reading.caution}</p>
        </section>
        <section>
          <h4>리듬</h4>
          <p>{reading.rhythm}</p>
        </section>
      </div>
      <div className="period-day-grid">
        <section className="highlight-days">
          <h4>활용하기 좋은 날</h4>
          {reading.highlightDays.map((day) => (
            <p key={`${reading.period}-highlight-${day.date}`}>
              <strong>{day.date}</strong>
              <span>{day.dayGanji} · {day.score}점</span>
            </p>
          ))}
        </section>
        <section className="caution-days">
          <h4>조심할 날</h4>
          {reading.cautionDays.map((day) => (
            <p key={`${reading.period}-caution-${day.date}`}>
              <strong>{day.date}</strong>
              <span>{day.dayGanji} · {day.score}점</span>
            </p>
          ))}
        </section>
      </div>
      <p className="period-advice">{reading.advice}</p>
      <small>{reading.basis}</small>
    </article>
  )
}

function FortuneStory({ text, relatedSigns }: { text: string; relatedSigns: string[] }) {
  return (
    <section className="fortune-story">
      <p>{text}</p>
      <div>
        <span>관련</span>
        {relatedSigns.map((sign) => (
          <strong key={sign}>{sign}</strong>
        ))}
      </div>
    </section>
  )
}

function ScoreMeter({ score }: { score: number }) {
  return (
    <div className="score-meter" aria-label={`점수 ${score}`}>
      <span style={{ width: `${score}%` }} />
    </div>
  )
}

function getScoreTone(score: number) {
  if (score >= 76) {
    return 'score-high'
  }

  if (score >= 62) {
    return 'score-mid'
  }

  return 'score-low'
}

function getStrongestDailyCategory(reading: DailyFortuneReading) {
  return [...reading.categoryReadings].sort((a, b) => b.score - a.score)[0]
}

function getWeakestDailyCategory(reading: DailyFortuneReading) {
  return [...reading.categoryReadings].sort((a, b) => a.score - b.score)[0]
}

function getCalendarDayByDate(dateKey: string): CalendarDay {
  const [year, month] = dateKey.split('-').map(Number)
  const calendar = buildManseCalendarMonth(year, month)

  return calendar.days.find((day) => day.date === dateKey) ?? calendar.days.find((day) => day.isCurrentMonth) ?? calendar.days[0]
}

function shiftDateKey(dateKey: string, delta: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  date.setDate(date.getDate() + delta)

  return toDateKey(date)
}

const branchAnimalLabels: Record<string, string> = {
  자: '쥐띠',
  축: '소띠',
  인: '호랑이띠',
  묘: '토끼띠',
  진: '용띠',
  사: '뱀띠',
  오: '말띠',
  미: '양띠',
  신: '원숭이띠',
  유: '닭띠',
  술: '개띠',
  해: '돼지띠',
}

function getRelatedSigns(chart: SajuChart) {
  const yearAnimal = branchAnimalLabels[chart.pillars.find((pillar) => pillar.key === 'year')?.branch ?? ''] ?? '띠 정보'

  return [yearAnimal, getWesternZodiac(chart.input.month, chart.input.day)]
}

function getWesternZodiac(month: number, day: number) {
  const mmdd = month * 100 + day

  if (mmdd >= 321 && mmdd <= 419) return '양자리'
  if (mmdd >= 420 && mmdd <= 520) return '황소자리'
  if (mmdd >= 521 && mmdd <= 621) return '쌍둥이자리'
  if (mmdd >= 622 && mmdd <= 722) return '게자리'
  if (mmdd >= 723 && mmdd <= 822) return '사자자리'
  if (mmdd >= 823 && mmdd <= 922) return '처녀자리'
  if (mmdd >= 923 && mmdd <= 1022) return '천칭자리'
  if (mmdd >= 1023 && mmdd <= 1122) return '전갈자리'
  if (mmdd >= 1123 && mmdd <= 1221) return '사수자리'
  if (mmdd >= 1222 || mmdd <= 119) return '염소자리'
  if (mmdd >= 120 && mmdd <= 218) return '물병자리'

  return '물고기자리'
}

function shiftCalendarMonth(current: { year: number; month: number }, delta: number) {
  const next = new Date(current.year, current.month - 1 + delta, 1)

  return {
    year: next.getFullYear(),
    month: next.getMonth() + 1,
  }
}

function getSelectedWeekDays(calendar: ManseCalendarMonth, selectedDate: string) {
  const selectedIndex = calendar.days.findIndex((day) => day.date === selectedDate)
  const fallbackIndex = calendar.days.findIndex((day) => day.isCurrentMonth)
  const safeIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex
  const weekStartIndex = Math.max(0, safeIndex - calendar.days[safeIndex].weekday)

  return calendar.days.slice(weekStartIndex, weekStartIndex + 7)
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function SajuReading({
  chart,
  profileName,
  onBack,
  onShare,
}: {
  chart: SajuChart
  profileName: string
  onBack: () => void
  onShare: () => void
}) {
  const dayPillar = chart.pillars.find((pillar) => pillar.key === 'day')
  const strongestElement = [...chart.elementSummary].sort((a, b) => b.count - a.count)[0]
  const weakElements = chart.elementSummary.filter((item) => item.count === 0)
  const yongsin = chart.advanced.yongsin.length ? chart.advanced.yongsin.join(', ') : '-'
  const [reportSections, setReportSections] = useState<SajuReportSection[] | null>(null)
  const primaryTenGods = getPrimaryTenGods(chart)
  const printReading = () => {
    window.print()
  }

  useEffect(() => {
    let mounted = true

    setReportSections(null)
    void import('./lib/sajuReport').then(({ buildSajuReportSections }) => {
      if (mounted) {
        setReportSections(buildSajuReportSections(chart))
      }
    })

    return () => {
      mounted = false
    }
  }, [chart])

  useEffect(() => {
    const openedForPrint: HTMLDetailsElement[] = []
    const openDetailsForPrint = () => {
      openedForPrint.length = 0
      document.querySelectorAll<HTMLDetailsElement>('.result-panel details').forEach((detail) => {
        if (!detail.open) {
          detail.open = true
          openedForPrint.push(detail)
        }
      })
    }
    const restoreDetailsAfterPrint = () => {
      openedForPrint.forEach((detail) => {
        detail.open = false
      })
      openedForPrint.length = 0
    }

    window.addEventListener('beforeprint', openDetailsForPrint)
    window.addEventListener('afterprint', restoreDetailsAfterPrint)

    return () => {
      window.removeEventListener('beforeprint', openDetailsForPrint)
      window.removeEventListener('afterprint', restoreDetailsAfterPrint)
    }
  }, [])

  return (
    <>
      <div className="result-heading reading-heading">
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft size={17} />
          <span>만세력으로 돌아가기</span>
        </button>
        <div className="reading-title-row">
          <div>
            <p className="eyebrow">Saju Reading</p>
            <h2>{profileName} 사주 풀이</h2>
          </div>
          <button className="print-button" type="button" onClick={printReading}>
            <Printer size={16} />
            <span>PDF 저장</span>
          </button>
          <button className="print-button" type="button" onClick={onShare}>
            <Share2 size={16} />
            <span>공유</span>
          </button>
        </div>
      </div>

      <section className="print-cover">
        <span>사주팔자 상담 문서</span>
        <h1>{profileName} 사주 풀이</h1>
        <p>{chart.summary}</p>
        <dl>
          <div>
            <dt>중심 일주</dt>
            <dd>{dayPillar?.korean ?? '-'}</dd>
          </div>
          <div>
            <dt>신강/신약</dt>
            <dd>{formatStrength(chart.advanced.dayStrength.strength)}</dd>
          </div>
          <div>
            <dt>강한 오행</dt>
            <dd>{strongestElement?.element ?? '-'}</dd>
          </div>
          <div>
            <dt>대운</dt>
            <dd>
              {chart.luck.direction} · 만 {chart.luck.startAge ?? '-'}세 시작
            </dd>
          </div>
        </dl>
      </section>

      <section className="reading-hero">
        <article>
          <span>핵심 기질</span>
          <strong>
            {dayPillar?.stem ?? '-'} 일간 · {formatStrength(chart.advanced.dayStrength.strength)}
          </strong>
          <small>{dayPillar?.korean ?? '-'} 일주를 중심으로 봅니다.</small>
        </article>
        <article>
          <span>보완 포인트</span>
          <strong>{yongsin}</strong>
          <small>
            {weakElements.length
              ? `부족 오행: ${weakElements.map((item) => item.element).join(', ')}`
              : `강한 오행: ${strongestElement?.element ?? '-'}`}
          </small>
        </article>
        <article>
          <span>해석 우선순위</span>
          <strong>{chart.coreSpecialStars.length ? `${chart.coreSpecialStars.length}개 핵심 신살` : '기본 명식'}</strong>
          <small>참고 신살보다 핵심 구조를 먼저 봅니다.</small>
        </article>
      </section>

      <section className="saju-section term-help-section">
        <SectionHeader title="용어 빠른 설명" description="낯선 말은 눌러서 쉬운 설명을 볼 수 있습니다." />
        <div className="term-help-row">
          <InfoTerm label={`주요 십성 ${primaryTenGods}`} term="천간 십성" />
          <InfoTerm label="지지 십성" term="지지 십성" />
          <InfoTerm label="12운성" term="12운성" />
          <InfoTerm label="12신살" term="12신살" />
        </div>
      </section>

      <section className="saju-section key-summary-section">
        <SectionHeader title="핵심 요약 3줄" description="먼저 이것만 읽어도 전체 방향을 잡을 수 있습니다." />
        <div className="key-summary-list">
          <article>
            <span>1</span>
            <p>
              이 사주는 <strong>{dayPillar?.korean ?? '-'} 일주</strong>를 중심으로 보며,{' '}
              <strong>{strongestElement?.element ?? '-'}</strong> 기운이 전체 분위기를 많이 끌고 갑니다.
            </p>
          </article>
          <article>
            <span>2</span>
            <p>
              주요 흐름은 <strong>{primaryTenGods}</strong> 쪽으로 나타나기 쉬워, 장점은 살리고 과한 부분은
              조절하는 것이 중요합니다.
            </p>
          </article>
          <article>
            <span>3</span>
            <p>
              보완 포인트는 <strong>{weakElements.length ? weakElements.map((item) => item.element).join(', ') : yongsin}</strong>
              이며, 대운은 <strong>{chart.luck.direction}</strong>으로 만{' '}
              <strong>{chart.luck.startAge ?? '-'}</strong>세 전후부터 큰 흐름이 바뀝니다.
            </p>
          </article>
        </div>
      </section>

      <section className="saju-section document-section">
        <SectionHeader title="문서형 사주 풀이" description="처음 보는 사람도 위에서 아래로 읽을 수 있게 정리한 해석문입니다." />
        {reportSections ? (
          <SajuDocumentArticle chart={chart} profileName={profileName} reportSections={reportSections} />
        ) : (
          <article className="saju-document document-loading">
            <p>문서형 풀이를 정리하는 중입니다.</p>
          </article>
        )}
      </section>

      <section className="saju-section trust-notice">
        <SectionHeader title="이 풀이를 읽는 기준" description="사주 해석이 과장되거나 단정되지 않도록 보는 기준입니다." />
        <div className="notice-grid">
          <article>
            <strong>참고용 콘텐츠</strong>
            <p>이 결과는 만세력 계산과 명리 해석 문장팩을 바탕으로 한 문화·오락 목적의 참고용 풀이입니다.</p>
          </article>
          <article>
            <strong>단정 금지</strong>
            <p>건강, 투자, 결혼, 이혼, 진로를 확정적으로 판단하지 않습니다. 중요한 결정은 현실 자료와 전문가 상담을 우선하세요.</p>
          </article>
          <article>
            <strong>개인정보</strong>
            <p>생년월일 저장값은 이 브라우저의 로컬 저장소에 남습니다. 공용 PC에서는 저장 후 삭제하거나 공유 링크 사용을 피하세요.</p>
          </article>
        </div>
      </section>

      <details className="saju-section reading-section reading-disclosure">
        <summary>
          <span>초보자 요약 해석</span>
          <small>처음 보는 사람도 이해할 수 있게 풀어쓴 요약</small>
        </summary>
        <div className="reading-grid">
          {chart.beginnerReadings.map((reading) => (
            <article className="reading-card" key={reading.title}>
              <h4>{reading.title}</h4>
              <p>{reading.body}</p>
              <small>{reading.basis}</small>
            </article>
          ))}
        </div>
      </details>

      <details className="saju-section reading-disclosure">
        <summary>
          <span>주제별 풀이</span>
          <small>성격, 일, 재물, 관계, 생활 관점</small>
        </summary>
        <div className="topic-grid">
          {chart.topicReadings.map((reading) => (
            <article className="topic-card" key={reading.topic}>
              <span>{reading.topic}</span>
              <small>흐름</small>
              <p>{reading.summary}</p>
              <small>조언</small>
              <strong>{reading.advice}</strong>
              <small>근거: {reading.basis}</small>
            </article>
          ))}
        </div>
      </details>

      <details className="saju-section report-section reading-disclosure">
        <summary>
          <span>정밀 상담 리포트</span>
          <small>12단계 구조의 상세 해석</small>
        </summary>
        <div className="report-grid">
          {reportSections ? (
            reportSections.map((section) => <ReportSectionCard section={section} key={section.order} />)
          ) : (
            <article className="report-card report-loading">
              <p>정밀 해석 문장팩을 불러오는 중입니다.</p>
            </article>
          )}
        </div>
      </details>

      <details className="saju-section reading-disclosure">
        <summary>
          <span>분석 근거</span>
          <small>풀이에 사용한 주요 계산값</small>
        </summary>
        <div className="analysis-grid">
          <SummaryTile
            label="신강/신약"
            value={formatStrength(chart.advanced.dayStrength.strength)}
            note={`점수 ${chart.advanced.dayStrength.score}`}
          />
          <SummaryTile label="격국" value={chart.advanced.geukguk} note="월지와 구조 기준" />
          <SummaryTile
            label="용신"
            value={chart.advanced.yongsin.length ? chart.advanced.yongsin.join(', ') : '-'}
            note="보완 기운 후보"
          />
        </div>
        <p className="analysis-note">{chart.advanced.interpretation}</p>
      </details>

      <details className="saju-section reading-disclosure">
        <summary>
          <span>운의 흐름</span>
          <small>대운, 세운, 월운 요약</small>
        </summary>
        <div className="quick-summary">
          <SummaryTile label="대운 방향" value={chart.luck.direction} note={`만 ${chart.luck.startAge ?? '-'}세 시작`} />
          <SummaryTile
            label="올해 세운"
            value={chart.yearlyFortunes[0]?.ganzhi ?? '-'}
            note={chart.yearlyFortunes[0]?.label ?? '-'}
          />
          <SummaryTile
            label="이번 달 월운"
            value={chart.monthlyFortunes[0]?.ganzhi ?? '-'}
            note={chart.monthlyFortunes[0]?.label ?? '-'}
          />
          <SummaryTile
            label="핵심 신살"
            value={chart.coreSpecialStars.length ? String(chart.coreSpecialStars.length) : '0'}
            note="풀이 우선 반영"
          />
        </div>
      </details>
    </>
  )
}

function SajuDocumentArticle({
  chart,
  profileName,
  reportSections,
}: {
  chart: SajuChart
  profileName: string
  reportSections: SajuReportSection[]
}) {
  const dayPillar = chart.pillars.find((pillar) => pillar.key === 'day')
  const strongestElement = [...chart.elementSummary].sort((a, b) => b.count - a.count)[0]
  const weakElements = chart.elementSummary.filter((item) => item.count === 0)
  const topic = (name: SajuChart['topicReadings'][number]['topic']) =>
    chart.topicReadings.find((reading) => reading.topic === name)
  const section = (title: string) => reportSections.find((item) => item.title === title)
  const mainStars = chart.coreSpecialStars.length
    ? chart.coreSpecialStars.map((star) => star.name).slice(0, 3).join(', ')
    : chart.referenceSpecialStars.map((star) => star.name).slice(0, 3).join(', ') || '뚜렷한 핵심 신살 없음'
  const primaryTenGods = getPrimaryTenGods(chart)
  const coreSection = section('원국 핵심 구조')
  const lifeSection = section('현실 조언 및 총평')
  const workSection = section('직업운')
  const moneySection = section('금전운')
  const relationshipSection = section('인간관계/가족운')
  const healthSection = section('건강운')
  const workTopic = topic('일/직업')
  const moneyTopic = topic('재물')
  const relationshipTopic = topic('관계')
  const healthTopic = topic('건강/생활')
  const dayPillarText = dayPillar ? `${dayPillar.korean} 일주` : '-'
  const strongestElementText = strongestElement?.element ?? '-'
  const weakElementText = weakElements.length ? weakElements.map((item) => item.element).join(', ') : '크게 비어 있는 기운 없음'
  const documentConclusion =
    lifeSection?.conclusion ?? '강한 기운은 장점으로 쓰고, 부족한 기운은 생활 습관으로 보완하는 것이 핵심입니다.'
  const documentAdvice =
    lifeSection?.advice ?? '무리해서 한 번에 바꾸기보다, 반복되는 선택과 생활 리듬을 조금씩 정리하는 편이 좋습니다.'
  const coreSummary = summarizeDocumentText(coreSection?.summary ?? chart.beginnerReadings[0]?.body)
  const workSummary = summarizeDocumentText(workTopic?.summary ?? workSection?.summary)
  const moneySummary = summarizeDocumentText(moneyTopic?.summary ?? moneySection?.summary)
  const relationshipSummary = summarizeDocumentText(relationshipTopic?.summary ?? relationshipSection?.summary)
  const healthSummary = summarizeDocumentText(healthTopic?.summary ?? healthSection?.summary)
  const actionPoints = [
    {
      label: '일',
      body: summarizeDocumentText(workTopic?.advice ?? workSection?.advice, 1),
    },
    {
      label: '돈',
      body: summarizeDocumentText(moneyTopic?.advice ?? moneySection?.advice, 1),
    },
    {
      label: '관계',
      body: summarizeDocumentText(relationshipTopic?.advice ?? relationshipSection?.advice, 1),
    },
    {
      label: '생활',
      body: summarizeDocumentText(healthTopic?.advice ?? healthSection?.advice ?? documentAdvice, 1),
    },
  ].filter((item) => item.body)

  return (
    <article className="saju-document">
      <header>
        <span>사주 풀이 문서</span>
        <h3>{profileName}님의 사주를 쉬운 말로 정리하면</h3>
        <p>
          이 문서는 만세력 계산값을 그대로 나열하지 않고, 성향과 생활 조언으로 다시 묶은 요약입니다.
          자세한 근거는 아래 카드형 리포트에서 이어서 확인할 수 있습니다.
        </p>
      </header>

      <section className="document-callout">
        <span>핵심 결론</span>
        <strong>{documentConclusion}</strong>
        <p>{documentAdvice}</p>
      </section>

      <div className="document-lead-grid">
        <div>
          <span>중심</span>
          <strong>{dayPillarText}</strong>
          <small>{dayPillar?.stem ?? '-'} 일간을 기준으로 해석합니다.</small>
        </div>
        <div>
          <span>강한 기운</span>
          <strong>{strongestElementText}</strong>
          <small>{strongestElement ? `${strongestElement.count}개, ${strongestElement.status}` : '-'}</small>
        </div>
        <div>
          <span>보완 기운</span>
          <strong>{weakElementText}</strong>
          <small>비어 있거나 의식적으로 써야 하는 영역입니다.</small>
        </div>
      </div>

      <div className="document-version-grid">
        <section className="document-version">
          <span>쉬운 풀이</span>
          <h4>먼저 이렇게 이해하면 됩니다</h4>
          <p>
            {profileName}님은 <strong>{dayPillarText}</strong>를 중심으로 봅니다. 쉽게 말하면 이 사주는
            자기 안의 힘을 어떻게 쓰느냐가 중요하고, 특히 <strong>{strongestElementText}</strong> 기운이
            생활 속 선택과 반응에 자주 묻어나는 편입니다.
          </p>
          <div className="document-plain-grid">
            <article>
              <span>성향</span>
              <p>{coreSummary}</p>
            </article>
            <article>
              <span>일과 돈</span>
              <p>{workSummary}</p>
              <p>{moneySummary}</p>
            </article>
            <article>
              <span>관계</span>
              <p>{relationshipSummary}</p>
            </article>
            <article>
              <span>생활</span>
              <p>{healthSummary}</p>
            </article>
          </div>
          <div className="document-action-list">
            {actionPoints.map((point) => (
              <article key={point.label}>
                <span>{point.label}</span>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
          <p>
            강한 부분은 잘 쓰면 장점이 됩니다. 하지만 너무 많이 쓰면 피곤해지거나 주변 사람에게 부담으로 보일 수
            있습니다. 반대로 <strong>{weakElementText}</strong>은 못한다는 뜻이 아니라, 천천히 배우고 습관으로
            채워야 하는 부분입니다.
          </p>
          <p>
            지금 단계에서 가장 현실적인 조언은 <strong>{documentConclusion}</strong>
            입니다. 일과 돈에서는 <strong>{workTopic?.advice ?? moneyTopic?.advice ?? '일의 기준을 먼저 정리하는 것'}</strong>이
            중요하고, 관계에서는 맞고 틀림을 빨리 가르기보다 내가 언제 예민해지는지 알아차리는 것이 도움이 됩니다.
          </p>
          <p>
            한 줄로 말하면, 이 사주는 <strong>잘하는 힘을 더 잘 쓰고, 부족한 부분은 생활 습관으로 보완할 때</strong>
            훨씬 안정적으로 풀립니다.
          </p>
        </section>

        <section className="document-version expert-version">
          <span>전문가 풀이</span>
          <h4>계산 근거로 보면 이렇게 정리됩니다</h4>
          <p>
            원국은 <strong>{chart.summary}</strong>이며, 일간은 <strong>{dayPillar?.stem ?? '-'}</strong>,
            일지는 <strong>{dayPillar?.branch ?? '-'}</strong>입니다. 신강/신약은{' '}
            <strong>{formatStrength(chart.advanced.dayStrength.strength)}</strong>으로 계산되고, 점수는{' '}
            <strong>{chart.advanced.dayStrength.score}</strong>입니다. 격국은{' '}
            <strong>{chart.advanced.geukguk}</strong>으로 분류됩니다.
          </p>
          <p>
            오행 분포에서는 <strong>{strongestElementText}</strong>이 가장 두드러지고, 보완할
            기운은 <strong>{weakElementText}</strong>
            입니다. 주요 십성 흐름은 <strong>{primaryTenGods}</strong> 쪽으로 볼 수 있습니다. 이 구조에서는
            한 가지 결론으로 단정하기보다, 강한 기운이 어떤 환경에서 장점이 되고 어떤 상황에서 과해지는지를 함께
            보는 것이 좋습니다.
          </p>
          <p>
            신살/길성은 <strong>{mainStars}</strong>을 참고할 수 있습니다. 다만 신살은 원국을 뒤집는 결론이 아니라,
            사건과 성향을 보조 설명하는 힌트로 보는 편이 안전합니다. 대운은 <strong>{chart.luck.direction}</strong>
            이며, 첫 대운은 만 <strong>{chart.luck.startAge ?? '-'}</strong>세 전후부터 시작됩니다.
          </p>
          <p>
            따라서 이 명식은 원국의 기본 성향, 오행 균형, 십성 반복, 대운 흐름을 함께 놓고 해석해야 합니다. 특히
            직업과 재물은 <strong>{workTopic?.basis ?? '십성·오행 흐름'}</strong>을 근거로 보고, 관계와
            생활 리듬은 <strong>{relationshipTopic?.basis ?? '원국 관계 구조'}</strong>를 함께 보는 것이 좋습니다.
          </p>
        </section>
      </div>

      <details className="document-detail">
        <summary>문단별 상세 풀이 보기</summary>
        <section>
          <h4>전체 분위기</h4>
          <p>{summarizeDocumentText(section('만세력 판독 요약')?.summary ?? chart.beginnerReadings[0]?.body, 3)}</p>
        </section>
        <section>
          <h4>성향과 장점</h4>
          <p>{summarizeDocumentText(section('원국 핵심 구조')?.summary ?? chart.beginnerReadings[0]?.body, 3)}</p>
        </section>
        <section>
          <h4>일과 돈</h4>
          <p>{summarizeDocumentText(topic('일/직업')?.summary, 2)}</p>
          <p>{summarizeDocumentText(topic('재물')?.summary, 2)}</p>
        </section>
        <section>
          <h4>관계와 생활</h4>
          <p>{summarizeDocumentText(topic('관계')?.summary, 2)}</p>
          <p>{summarizeDocumentText(topic('건강/생활')?.summary, 2)}</p>
        </section>
      </details>

      <footer>
        <strong>총평</strong>
        <p>{documentConclusion}</p>
        <p>{documentAdvice}</p>
      </footer>
    </article>
  )
}

function getPrimaryTenGods(chart: SajuChart) {
  const counts = new Map<string, number>()

  for (const pillar of chart.pillars) {
    for (const tenGod of [pillar.stemTenGod, pillar.branchTenGod]) {
      if (tenGod !== '일간') {
        counts.set(tenGod, (counts.get(tenGod) ?? 0) + 1)
      }
    }
  }

  const primary = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([tenGod]) => tenGod)

  return primary.length ? primary.join(', ') : '뚜렷한 반복 십성 없음'
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

function ReportSectionCard({ section }: { section: SajuReportSection }) {
  return (
    <article className="report-card">
      <div className="report-card-head">
        <span>{String(section.order).padStart(2, '0')}</span>
        <div>
          <h4>{section.title}</h4>
          <small>{section.plainTitle}</small>
        </div>
      </div>
      <p className="report-summary">{section.summary}</p>
      <div className="report-guidance">
        <section>
          <strong>핵심 결론</strong>
          <p>{section.conclusion}</p>
        </section>
        <section>
          <strong>실천 조언</strong>
          <p>{section.advice}</p>
        </section>
      </div>
      <details className="report-detail">
        <summary>근거와 세부 풀이 보기</summary>
        <section className="report-full-text">
          <strong>전체 요약</strong>
          <p>{section.summary}</p>
          <strong>핵심 결론</strong>
          <p>{section.conclusion}</p>
          <strong>실천 조언</strong>
          <p>{section.advice}</p>
        </section>
        <small className="report-expert-summary">{section.expertSummary}</small>
        <div className="report-point-list">
          {section.points.map((point) => (
            <section key={`${point.plain}-${point.expert}`}>
              <strong>쉬운 말</strong>
              <p>{point.plain}</p>
              <strong>전문가 근거</strong>
              <p>{point.expert}</p>
              <strong>삶에서 보이는 모습</strong>
              <p>{point.life}</p>
            </section>
          ))}
        </div>
      </details>
    </article>
  )
}

function SummaryTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="summary-tile">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="section-header">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function InfoTerm({ label, term }: { label: string; term: keyof typeof termDescriptions }) {
  const [open, setOpen] = useState(false)
  const description = termDescriptions[term]

  return (
    <span className="term-info">
      <button
        aria-expanded={open}
        className={open ? 'active' : ''}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <aside className="term-description">
          <strong>{term}</strong>
          <p>{description.summary}</p>
          <p>{description.useWell}</p>
          <p>{description.caution}</p>
        </aside>
      ) : null}
    </span>
  )
}

function ChipRow({
  values,
  emptyLabel,
  meta = {},
}: {
  values: string[]
  emptyLabel: string
  meta?: Record<string, { level?: string; position?: string }>
}) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null)

  if (values.length === 0) {
    return <p className="muted-text">{emptyLabel}</p>
  }

  const selectedDescription = selectedValue ? chipDescriptions[selectedValue] : null
  const selectedMeta = selectedValue ? meta[selectedValue] : null

  return (
    <>
      <div className="chip-row">
        {values.map((value) => {
          const description = chipDescriptions[value]

          return description ? (
            <button
              aria-pressed={selectedValue === value}
              className={selectedValue === value ? 'active' : ''}
              key={value}
              type="button"
              onClick={() => setSelectedValue((current) => (current === value ? null : value))}
            >
              {value}
            </button>
          ) : (
            <span key={value}>{value}</span>
          )
        })}
      </div>
      {selectedValue && selectedDescription ? (
        <aside className="chip-description">
          <div>
            <strong>{selectedValue}</strong>
            {selectedMeta?.level ? <span>{selectedMeta.level}</span> : null}
            {selectedMeta?.position ? <span>{selectedMeta.position}</span> : null}
          </div>
          <p>{selectedDescription.summary}</p>
          <p>
            <strong>좋게 쓰면</strong>
            {selectedDescription.useWell}
          </p>
          <p>
            <strong>주의할 점</strong>
            {selectedDescription.caution}
          </p>
          <p>
            <strong>감지 근거</strong>
            {selectedDescription.rule ?? '원국의 해당 기둥과 기준 글자를 비교해 감지했습니다.'}
            {selectedMeta?.position ? ` 현재는 ${selectedMeta.position}에서 확인됩니다.` : ''}
          </p>
        </aside>
      ) : null}
    </>
  )
}

function InfoGrid({
  items,
  emptyLabel,
  muted = false,
}: {
  items: Array<{ label: string; title: string; note: string }>
  emptyLabel: string
  muted?: boolean
}) {
  if (items.length === 0) {
    return <p className="muted-text">{emptyLabel}</p>
  }

  return (
    <div className="info-grid">
      {items.map((item) => (
        <div className={`info-item ${muted ? 'reference' : ''}`} key={`${item.label}-${item.title}-${item.note}`}>
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          {item.note ? <small>{item.note}</small> : null}
        </div>
      ))}
    </div>
  )
}

function FlowGrid({ items, period }: { items: SajuChart['yearlyFortunes']; period: 'year' | 'month' }) {
  return (
    <div className="flow-grid">
      {items.map((item) => (
        <div className="flow-item" key={`${item.label}-${item.ganzhi}`}>
          <span>{item.label}</span>
          <strong>{item.ganzhi}</strong>
          <small>
            {item.stemTenGod}/{item.branchTenGod} · {item.twelveLifeStage}
            <br />
            {period === 'year' ? '그해 흐름' : '그달 흐름'}
          </small>
        </div>
      ))}
    </div>
  )
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

export default App
