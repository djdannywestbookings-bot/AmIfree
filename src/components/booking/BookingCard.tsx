import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, DollarSign, Clock } from 'lucide-react'
import StatusBadge from './StatusBadge'
import ConflictBadge from './ConflictBadge'
import FollowUpPanel from '../followup/FollowUpPanel'
import { formatDate, formatTimeRange } from '../../utils/time'
import type { Booking, Venue } from '../../types'

interface Props {
  booking: Booking
  venue: Venue | null
}

export default function BookingCard({ booking, venue }: Props) {
  const [expanded, setExpanded] = useState(false)
  const {
    title, nightlifeDate, startTime, endTime, crossMidnight,
    afterHours, status, conflict, city, state, fee, notes, followUpMessages,
  } = booking

  const timeRange = formatTimeRange(startTime, endTime, crossMidnight, afterHours)
  const dateLabel = formatDate(nightlifeDate)

  return (
    <div className={`rounded-xl border bg-card p-3.5 shadow-sm transition-all
      ${conflict === 'Hard Conflict' ? 'border-red-300 bg-red-50/30' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{title}</p>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <Clock size={11} />
            <span>{dateLabel} · {timeRange}</span>
          </div>
          {venue && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin size={11} />
              <span>{venue.name} · {city}, {state}</span>
            </div>
          )}
          {!venue && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin size={11} />
              <span>{city}, {state}</span>
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <StatusBadge status={status} />
        <ConflictBadge conflict={conflict} />
        {crossMidnight && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-indigo-50 text-indigo-600 border-indigo-200">
            Cross-midnight
          </span>
        )}
        {afterHours && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-purple-50 text-purple-700 border-purple-200">
            After-hours
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
          {fee !== null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign size={12} />
              <span className="font-medium text-foreground">${fee.toLocaleString()}</span>
            </div>
          )}
          {notes && (
            <p className="text-xs text-muted-foreground italic">{notes}</p>
          )}
          <FollowUpPanel messages={followUpMessages} />
        </div>
      )}
    </div>
  )
}
