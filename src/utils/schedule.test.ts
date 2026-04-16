import { describe, it, expect } from 'vitest'
import { MOCK_DJS, MOCK_RECURRING_SHIFTS } from '../data/mock'
import type { DJ, RecurringShift } from '../types'

const availableDJs: DJ[] = MOCK_DJS.filter(dj => dj.available)
const unavailableDJs: DJ[] = MOCK_DJS.filter(dj => !dj.available)

describe('availableDJs filter', () => {
  it('produces exactly 3 available DJs', () => { expect(availableDJs).toHaveLength(3) })
  it('includes dj1 DJ Westside', () => { expect(availableDJs.find(d => d.id === 'dj1')).toBeDefined() })
  it('includes dj2 DJ Neon', () => { expect(availableDJs.find(d => d.id === 'dj2')).toBeDefined() })
  it('includes dj4 DJ Pulse', () => { expect(availableDJs.find(d => d.id === 'dj4')).toBeDefined() })
  it('excludes dj3 DJ Static (available: false)', () => { expect(availableDJs.find(d => d.id === 'dj3')).toBeUndefined() })
  it('excludes dj5 DJ Axiom (available: false)', () => { expect(availableDJs.find(d => d.id === 'dj5')).toBeUndefined() })
  it('all returned DJs have available === true', () => { expect(availableDJs.every(d => d.available)).toBe(true) })
})

describe('unavailableDJs', () => {
  it('produces exactly 2 unavailable DJs', () => { expect(unavailableDJs).toHaveLength(2) })
  it('contains dj3 and dj5', () => {
    const ids = unavailableDJs.map(d => d.id)
    expect(ids).toContain('dj3')
    expect(ids).toContain('dj5')
  })
  it('all returned DJs have available === false', () => { expect(unavailableDJs.every(d => !d.available)).toBe(true) })
})

describe('recurring shift assignments respect availability', () => {
  const availableIds = new Set(availableDJs.map(d => d.id))
  it('every assigned shift points to an available DJ', () => {
    const assignedShifts = MOCK_RECURRING_SHIFTS.filter((s: RecurringShift) => s.assignedDJId !== null)
    for (const shift of assignedShifts) {
      expect(availableIds.has(shift.assignedDJId as string)).toBe(true)
    }
  })
  it('rs4 is correctly unassigned (null)', () => {
    const rs4 = MOCK_RECURRING_SHIFTS.find((s: RecurringShift) => s.id === 'rs4')
    expect(rs4).toBeDefined()
    expect(rs4!.assignedDJId).toBeNull()
  })
  it('rs3 (after-hours shift) is assigned to dj4 who is available', () => {
    const rs3 = MOCK_RECURRING_SHIFTS.find((s: RecurringShift) => s.id === 'rs3')
    expect(rs3!.afterHours).toBe(true)
    expect(rs3!.assignedDJId).toBe('dj4')
    expect(availableIds.has('dj4')).toBe(true)
  })
  it('no shift assigned to dj3', () => {
    expect(MOCK_RECURRING_SHIFTS.filter((s: RecurringShift) => s.assignedDJId === 'dj3')).toHaveLength(0)
  })
  it('no shift assigned to dj5', () => {
    expect(MOCK_RECURRING_SHIFTS.filter((s: RecurringShift) => s.assignedDJId === 'dj5')).toHaveLength(0)
  })
})

describe('assignment dropdown simulation', () => {
  it('dropdown options derived from availableDJs only', () => {
    const optionIds = availableDJs.map(dj => dj.id)
    expect(optionIds).not.toContain('dj3')
    expect(optionIds).not.toContain('dj5')
    expect(optionIds).toContain('dj1')
    expect(optionIds).toContain('dj2')
    expect(optionIds).toContain('dj4')
  })
  it('total dropdown options count matches available DJ count', () => { expect(availableDJs.length).toBe(3) })
  it('unavailable DJ names never appear in dropdown labels', () => {
    const labels = availableDJs.map(dj => dj.name)
    expect(labels).not.toContain('DJ Static')
    expect(labels).not.toContain('DJ Axiom')
  })
})
