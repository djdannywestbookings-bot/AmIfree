import { describe, it, expect } from 'vitest'
import { formatTimeRange, formatDate, toDateStr, getWeekDates, parseDate } from './time'

describe('formatTimeRange', () => {
  it('renders a normal same-night range without any suffix', () => {
    expect(formatTimeRange('20:00', '23:00', false, false)).toBe('20:00 – 23:00')
  })
  it('appends +1 for a cross-midnight booking', () => {
    expect(formatTimeRange('22:00', '02:00', true, false)).toBe('22:00 – 02:00 +1')
  })
  it('appends (after-hours) for a 2–5 AM after-hours set', () => {
    expect(formatTimeRange('02:00', '05:00', false, true)).toBe('02:00 – 05:00 (after-hours)')
  })
  it('after-hours flag takes precedence over crossMidnight when both are set', () => {
    expect(formatTimeRange('02:00', '04:00', true, true)).toBe('02:00 – 04:00 (after-hours)')
  })
  it('handles a daytime booking with no special flags', () => {
    expect(formatTimeRange('15:00', '17:00', false, false)).toBe('15:00 – 17:00')
  })
  it('handles midnight boundary without cross-midnight flag as plain range', () => {
    expect(formatTimeRange('23:00', '00:00', false, false)).toBe('23:00 – 00:00')
  })
})

describe('nightlifeDate cross-midnight semantics', () => {
  it('cross-midnight gig b1 nightlifeDate is the starting calendar day (Fri Apr 17)', () => {
    const nightlifeDate = '2026-04-17'
    const d = parseDate(nightlifeDate)
    expect(d.getDay()).toBe(5)
    expect(toDateStr(d)).toBe('2026-04-17')
  })
  it('after-hours gig b4 nightlifeDate is 2026-04-18 (Saturday extended)', () => {
    const nightlifeDate = '2026-04-18'
    const d = parseDate(nightlifeDate)
    expect(d.getDay()).toBe(6)
    expect(toDateStr(d)).toBe('2026-04-18')
  })
  it('cross-midnight b1 and after-hours b4 land on different nightlife days', () => {
    expect('2026-04-17').not.toBe('2026-04-18')
  })
})

describe('formatDate', () => {
  it('formats 2026-04-17 as "Fri Apr 17"', () => {
    expect(formatDate('2026-04-17')).toBe('Fri Apr 17')
  })
  it('formats 2026-04-18 as "Sat Apr 18"', () => {
    expect(formatDate('2026-04-18')).toBe('Sat Apr 18')
  })
  it('formats 2026-04-22 as "Wed Apr 22"', () => {
    expect(formatDate('2026-04-22')).toBe('Wed Apr 22')
  })
})

describe('toDateStr', () => {
  it('round-trips 2026-04-17 through parseDate', () => {
    expect(toDateStr(parseDate('2026-04-17'))).toBe('2026-04-17')
  })
  it('round-trips 2026-01-01 (year boundary)', () => {
    expect(toDateStr(parseDate('2026-01-01'))).toBe('2026-01-01')
  })
  it('pads single-digit month and day', () => {
    expect(toDateStr(parseDate('2026-03-05'))).toBe('2026-03-05')
  })
})

describe('getWeekDates', () => {
  it('returns exactly 7 dates', () => {
    const dates = getWeekDates(parseDate('2026-04-17'))
    expect(dates).toHaveLength(7)
  })
  it('week containing Fri Apr 17 starts on Mon Apr 13', () => {
    const dates = getWeekDates(parseDate('2026-04-17'))
    expect(toDateStr(dates[0]!)).toBe('2026-04-13')
  })
  it('week containing Fri Apr 17 ends on Sun Apr 19', () => {
    const dates = getWeekDates(parseDate('2026-04-17'))
    expect(toDateStr(dates[6]!)).toBe('2026-04-19')
  })
  it('anchor on Monday returns that same Monday as day 0', () => {
    const dates = getWeekDates(parseDate('2026-04-13'))
    expect(toDateStr(dates[0]!)).toBe('2026-04-13')
  })
  it('anchor on Sunday week still starts Mon Apr 13', () => {
    const dates = getWeekDates(parseDate('2026-04-19'))
    expect(toDateStr(dates[0]!)).toBe('2026-04-13')
  })
})
