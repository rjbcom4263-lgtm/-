import {
  calculateFourPillars,
  getSolarTermsOfYear,
  solarToLunar,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
} from 'manseryeok'

export type CalendarDay = {
  date: string
  day: number
  weekday: number
  isCurrentMonth: boolean
  isToday: boolean
  dayGanji: string
  dayStem: HeavenlyStem
  dayBranch: EarthlyBranch
  dayStemElement: FiveElement
  dayBranchElement: FiveElement
  lunarLabel: string
  solarTerm?: string
}

export type ManseCalendarMonth = {
  year: number
  month: number
  title: string
  days: CalendarDay[]
}

export function buildManseCalendarMonth(year: number, month: number): ManseCalendarMonth {
  const firstDate = new Date(year, month - 1, 1)
  const startDate = new Date(firstDate)
  startDate.setDate(firstDate.getDate() - firstDate.getDay())

  const today = new Date()
  const solarTerms = getSolarTermMap(year, month)
  const days: CalendarDay[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    const dateYear = date.getFullYear()
    const dateMonth = date.getMonth() + 1
    const dateDay = date.getDate()
    const dateKey = toDateKey(dateYear, dateMonth, dateDay)
    const lunar = solarToLunar(dateYear, dateMonth, dateDay)
    const pillars = calculateFourPillars({
      year: dateYear,
      month: dateMonth,
      day: dateDay,
      hour: 12,
      minute: 0,
    })

    days.push({
      date: dateKey,
      day: dateDay,
      weekday: date.getDay(),
      isCurrentMonth: dateMonth === month,
      isToday:
        dateYear === today.getFullYear() &&
        dateMonth === today.getMonth() + 1 &&
        dateDay === today.getDate(),
      dayGanji: pillars.dayString,
      dayStem: pillars.day.heavenlyStem,
      dayBranch: pillars.day.earthlyBranch,
      dayStemElement: pillars.dayElement.stem,
      dayBranchElement: pillars.dayElement.branch,
      lunarLabel: `${lunar.isLeapMonth ? '윤' : ''}${lunar.month}.${lunar.day}`,
      solarTerm: solarTerms.get(dateKey),
    })
  }

  return {
    year,
    month,
    title: `${year}년 ${month}월`,
    days,
  }
}

const kstDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function getSolarTermMap(year: number, month: number) {
  const termMap = new Map<string, string>()

  for (const term of getSolarTermsOfYear(year)) {
    const dateKey = kstDateFormatter.format(term.date)
    const termMonth = Number(dateKey.slice(5, 7))

    if (termMonth === month) {
      termMap.set(dateKey, term.name)
    }
  }

  return termMap
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
