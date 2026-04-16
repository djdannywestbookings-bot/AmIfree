import { useState } from 'react'
import { Eye, EyeOff, Share2 } from 'lucide-react'
import { MOCK_BOOKINGS, CURRENT_DJ_ID } from '../data/mock'
import { formatDate, formatTimeRange } from '../utils/time'
import StatusBadge from '../components/booking/StatusBadge'
import type { ViewMode } from '../types'

const myBookings = MOCK_BOOKINGS.filter(b =>
  b.djId === CURRENT_DJ_ID && b.status !== 'Cancelled'
)

export default function AvailabilityPage() {
  const [mode, setMode] = useState<ViewMode>('owner')
  const [showCity, setShowCity] = useState(true)

  return (
    <div className="p-4 space-y-4 pb-6">
      <div>
        <h2 className="text-sm font-semibold">Availability Sharing</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Toggle between your full view and what a shared viewer sees.
        </p>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-border">
        {(['owner', 'shared'] as ViewMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors
              ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
          >
            {m === 'owner' ? <Eye size={13} /> : <EyeOff size={13} />}
            {m === 'owner' ? 'My View (Owner)' : 'Shared View'}
          </button>
        ))}
      </div>

      {mode === 'shared' && (
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <EyeOff size={13} className="text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground">Shared viewers see:</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc">
            <li>Blocked time only (no title, no venue, no fee)</li>
            <li className="flex items-center gap-2">
              City/State
              <button
                onClick={() => setShowCity(c => !c)}
                className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background hover:bg-muted transition-colors font-medium"
              >
                {showCity ? 'Hide' : 'Show'}
              </button>
            </li>
          </ul>
          <div className="flex items-center gap-2 pt-1">
            <Share2 size={12} className="text-primary" />
            <span className="text-xs text-primary font-medium underline cursor-pointer">Copy share link</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
          {mode === 'owner' ? 'Your Bookings' : 'Blocked Times (Shared View)'}
        </p>

        {myBookings.map(b => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-3">
            {mode === 'owner' ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(b.nightlifeDate)} · {formatTimeRange(b.startTime, b.endTime, b.crossMidnight, b.afterHours)}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.city}, {b.state}</p>
                    {b.fee !== null && (
                      <p className="text-xs text-foreground font-medium mt-1">${b.fee.toLocaleString()}</p>
                    )}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Blocked</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(b.nightlifeDate)} · {formatTimeRange(b.startTime, b.endTime, b.crossMidnight, b.afterHours)}
                    </p>
                    {showCity && (
                      <p className="text-xs text-muted-foreground">{b.city}, {b.state}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
