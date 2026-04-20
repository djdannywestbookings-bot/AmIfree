const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year!, month! - 1, day!)
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr)
  return `${DAYS_SHORT[d.getDay()]} ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
}

export function formatTimeRange(start: string, end: string, crossMidnight: boolean, afterHours: boolean): string {
  if (afterHours) return `${start} – ${end} (after-hours)`
  if (crossMidnight) return `${start} – ${end} +1`
  return `${start} – ${end}`
}

export function getDayLabel(dayIndex: number): string {
  return DAYS_SHORT[dayIndex] ?? ''
}

export function getWeekDates(anchorDate: Date): Date[] {
  const dow = anchorDate.getDay()
  const monday = new Date(anchorDate)
  monday.setDate(anchorDate.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
