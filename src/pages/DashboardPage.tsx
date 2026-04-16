import BookingCard from '../components/booking/BookingCard'
import { MOCK_BOOKINGS, MOCK_VENUES } from '../data/mock'
import type { BookingStatus } from '../types'

const STATUS_ORDER: BookingStatus[] = ['Booked', 'Assigned', 'Requested', 'Hold', 'Inquiry', 'Completed', 'Cancelled']

const sorted = [...MOCK_BOOKINGS].sort((a, b) => {
  const si = STATUS_ORDER.indexOf(a.status)
  const sj = STATUS_ORDER.indexOf(b.status)
  if (si !== sj) return si - sj
  return b.nightlifeDate.localeCompare(a.nightlifeDate)
})

const conflicts = MOCK_BOOKINGS.filter(b => b.conflict !== null).length
const upcoming  = MOCK_BOOKINGS.filter(b => b.status === 'Booked' || b.status === 'Assigned').length

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4 pb-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     value: MOCK_BOOKINGS.length },
          { label: 'Upcoming',  value: upcoming },
          { label: 'Conflicts', value: conflicts },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border bg-card p-3 text-center shadow-sm">
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">All Bookings</h2>
        <div className="space-y-3">
          {sorted.map(booking => {
            const venue = MOCK_VENUES.find(v => v.id === booking.venueId) ?? null
            return <BookingCard key={booking.id} booking={booking} venue={venue} />
          })}
        </div>
      </div>
    </div>
  )
}
