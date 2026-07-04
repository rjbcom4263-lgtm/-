import type { BirthInput } from './sajuEngine'

export function normalizeBirthInput(value: Partial<BirthInput> | null): BirthInput | null {
  if (!value) {
    return null
  }

  const input = {
    year: Number(value.year),
    month: Number(value.month),
    day: Number(value.day),
    hour: Number(value.hour),
    minute: Number(value.minute),
    gender: value.gender === 'female' ? 'female' : 'male',
    isLunar: Boolean(value.isLunar),
    isLeapMonth: Boolean(value.isLeapMonth),
    dayBoundary: normalizeDayBoundary(value.dayBoundary),
  } satisfies BirthInput

  if (
    !Number.isInteger(input.year) ||
    !Number.isInteger(input.month) ||
    !Number.isInteger(input.day) ||
    !Number.isInteger(input.hour) ||
    !Number.isInteger(input.minute) ||
    input.year < 1391 ||
    input.year > 2100 ||
    input.month < 1 ||
    input.month > 12 ||
    input.day < 1 ||
    input.day > getMaxDayOfMonth(input.year, input.month, input.isLunar) ||
    input.hour < 0 ||
    input.hour > 23 ||
    input.minute < 0 ||
    input.minute > 59
  ) {
    return null
  }

  return input
}

function normalizeDayBoundary(value: Partial<BirthInput>['dayBoundary']) {
  return value === 'jasi' || value === 'splitJasi' ? value : 'midnight'
}

export function getMaxDayOfMonth(year: number, month: number, isLunar: boolean) {
  // 음력은 달마다 29/30일이라 최대 30일로만 제한하고, 정확한 검증은 만세력 계산에 맡깁니다.
  if (isLunar) {
    return 30
  }

  return new Date(year, month, 0).getDate()
}
