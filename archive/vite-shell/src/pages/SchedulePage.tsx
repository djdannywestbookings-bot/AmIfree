import { useState } from 'react'
import { MOCK_VENUES, MOCK_RECURRING_SHIFTS, MOCK_DJS } from '../data/mock'
import { getDayLabel } from '../utils/time'

const availableDJs = MOCK_DJS.filter(dj => dj.available)

export default function SchedulePage() {
  const [selectedVenueId, setSelectedVenueId] = useState(MOCK_VENUES[0]!.id)
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    Object.fromEntries(MOCK_RECURRING_SHIFTS.map(s => [s.id, s.assignedDJId]))
  )

  const venueShifts = MOCK_RECURRING_SHIFTS.filter(s => s.venueId === selectedVenueId)
  const venue = MOCK_VENUES.find(v => v.id === selectedVenueId)

  function assign(shiftId: string, djId: string) {
    setAssignments(prev => ({ ...prev, [shiftId]: djId === '' ? null : djId }))
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      <div>
        <h2 className="text-sm font-semibold">Promoter / Operator Scheduling</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage venues and recurring shifts. Only available DJs appear in assignment lists.
        </p>
      </div>

      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
          Select Venue
        </label>
        <div className="flex flex-col gap-2">
          {MOCK_VENUES.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVenueId(v.id)}
              className={`text-left px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors
                ${selectedVenueId === v.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/40'}`}
            >
              {v.name}
              <span className="block text-xs font-normal text-muted-foreground">{v.city}, {v.state}</span>
            </button>
          ))}
        </div>
      </div>

      {venue && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              Recurring Shifts — {venue.name}
            </p>
            <span className="text-[10px] text-muted-foreground">{venueShifts.length} shifts</span>
          </div>

          {venueShifts.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No recurring shifts for this venue.</p>
          )}

          <div className="space-y-2">
            {venueShifts.map(shift => {
              const assignedDJId = assignments[shift.id] ?? null
              const assignedDJ = MOCK_DJS.find(dj => dj.id === assignedDJId)

              return (
                <div key={shift.id} className={`rounded-xl border p-3 bg-card
                  ${shift.afterHours ? 'border-purple-200 bg-purple-50/30' : 'border-border'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {getDayLabel(shift.dayOfWeek)}s · {shift.startTime} – {shift.endTime}
                        {shift.crossMidnight && <span className="ml-1 text-[10px] text-indigo-600 font-semibold">+1</span>}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {shift.afterHours && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full">
                            After-hours
                          </span>
                        )}
                        {shift.crossMidnight && !shift.afterHours && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">
                            Cross-midnight
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 min-w-[120px]">
                      <label className="text-[10px] text-muted-foreground font-medium mb-1 block">
                        {assignedDJ ? 'Assigned' : 'Assign DJ'}
                      </label>
                      <select
                        value={assignedDJId ?? ''}
                        onChange={e => assign(shift.id, e.target.value)}
                        className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">— open —</option>
                        {availableDJs.map(dj => (
                          <option key={dj.id} value={dj.id}>
                            {dj.name}
                          </option>
                        ))}
                      </select>
                      {assignedDJId && !availableDJs.find(d => d.id === assignedDJId) && (
                        <p className="text-[10px] text-amber-600 mt-0.5">DJ marked unavailable</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Available DJs ({availableDJs.length} of {MOCK_DJS.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MOCK_DJS.map(dj => (
                <span key={dj.id} className={`text-[10px] px-2 py-1 rounded-full border font-medium
                  ${dj.available
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-muted text-muted-foreground border-border line-through opacity-60'}`}>
                  {dj.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
          }
