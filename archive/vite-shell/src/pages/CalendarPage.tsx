import { MOCK_BOOKINGS, MOCK_VENUES } from '../data/mock'
import { getWeekDates, toDateStr, formatTimeRange } from '../utils/time'
import ConflictBadge from '../components/booking/ConflictBadge'
import StatusBadge from '../components/booking/StatusBadge'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const today = new Date()
const weekDates = getWeekDates(today)
const weekStart = weekDates[0]!
const weekEnd = weekDates[6]!
const weekLabel = `Week of ${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekStart.getFullYear()}`

export default function CalendarPage() {
  return (
    <div className="pb-6">
      <div className="sticky top-0 bg-background z-10 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{weekLabel}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Bookings grouped by nightlife start day. Cross-midnight gigs (+1) stay on their starting day.
        </p>
      </div>

      <div className="divide-y divide-border">
        {weekDates.map((date, i) => {
          const dateStr = toDateStr(date)
          const dayBookings = MOCK_BOOKINGS.filter(b => b.nightlifeDate === dateStr)
          const isToday = toDateStr(today) === dateStr

          return (
            <div key={dateStr} className="px-4 py-3">
              <div className={`flex items-center gap-2 mb-2 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                <span className={`text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center
                  ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {date.getDate()}
                </span>
                <div>
                  <span className="text-sm font-semibold">{DAYS[i]}</span>
                  {isToday && <span className="ml-1.5 text-[10px] text-primary font-semibold">Today</span>}
                </div>
              </div>

              {dayBookings.length === 0 && (
                <p className="text-xs text-muted-foreground pl-10 italic">No bookings</p>
              )}

              <div className="pl-10 space-y-2">
                {dayBookings.map(b => {
                  const venue = MOCK_VENUES.find(v => v.id === b.venueId)
                  const timeLabel = formatTimeRange(b.startTime, b.endTime, b.crossMidnight, b.afterHours)
                  return (
                    <div key={b.id} className={`rounded-lg border p-2.5 text-xs
                      ${b.conflict === 'Hard Conflict' ? 'border-red-300 bg-red-50/40' : 'border-border bg-card'}`}>
                      <p className="font-semibold text-foreground">{b.title}</p>
                      <p className="text-muted-foreground mt-0.5">{timeLabel}{venue ? ` · ${venue.name}` : ''}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <StatusBadge status={b.status} />
                        <ConflictBadge conflict={b.conflict} />
                        {b.afterHours && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                            After-hours (service-day)
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
