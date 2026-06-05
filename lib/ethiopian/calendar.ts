export interface EthiopianDate {
  year: number
  month: number
  day: number
}

export const ETHIOPIAN_MONTHS = [
  "Meskerem",
  "Tikimit",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miyazya",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
]

export function gregorianToEthiopian(date: Date): EthiopianDate {
  const gcYear = date.getFullYear()
  const gcMonth = date.getMonth() + 1
  const gcDay = date.getDate()

  // Ethiopian new year falls on Sep 12 in GC years that immediately follow a GC leap year
  const nyDay = (gcYear - 1) % 4 === 0 ? 12 : 11

  let ecYear: number
  if (gcMonth > 9 || (gcMonth === 9 && gcDay >= nyDay)) {
    ecYear = gcYear - 7
  } else {
    ecYear = gcYear - 8
  }

  const nyGC = new Date(gcYear, 8, nyDay)
  let diffDays: number

  if (date >= nyGC) {
    diffDays = Math.floor((date.getTime() - nyGC.getTime()) / 86_400_000)
  } else {
    const prevNyDay = (gcYear - 2) % 4 === 0 ? 12 : 11
    const prevNyGC = new Date(gcYear - 1, 8, prevNyDay)
    diffDays = Math.floor((date.getTime() - prevNyGC.getTime()) / 86_400_000)
  }

  const ecMonth = Math.floor(diffDays / 30) + 1
  const ecDay = (diffDays % 30) + 1
  return { year: ecYear, month: ecMonth, day: ecDay }
}

export function ethiopianToGregorian(ec: EthiopianDate): Date {
  const nyGCYear = ec.year + 7
  const nyDay = (nyGCYear - 1) % 4 === 0 ? 12 : 11
  const nyGC = new Date(nyGCYear, 8, nyDay)
  const daysOffset = (ec.month - 1) * 30 + (ec.day - 1)
  return new Date(nyGC.getTime() + daysOffset * 86_400_000)
}

export function formatEthiopianDate(ec: EthiopianDate): string {
  return `${ec.day} ${ETHIOPIAN_MONTHS[ec.month - 1]} ${ec.year} EC`
}
