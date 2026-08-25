export type RafflePeriod = {
  start: Date
  end: Date
}

function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds())
}

export function getCurrentRafflePeriod(now: Date = new Date()): RafflePeriod {
  const startMonth = Math.floor(now.getMonth() / 4) * 4
  const start = new Date(now.getFullYear(), startMonth, 1, 0, 0, 0, 0)
  const end = addMonths(start, 4)
  return { start, end }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export function formatPeriod(d: Date): string {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`
}

