import type { BookingStatus } from '../../types'

type BadgeConfig = { label: string; className: string }

const CONFIGS: Record<BookingStatus, BadgeConfig> = {
  Inquiry:   { label: 'Inquiry',   className: 'bg-slate-100 text-slate-600 border-slate-200' },
  Hold:      { label: 'Hold',      className: 'bg-amber-50  text-amber-700 border-amber-200' },
  Requested: { label: 'Requested', className: 'bg-blue-50   text-blue-700  border-blue-200'  },
  Assigned:  { label: 'Assigned',  className: 'bg-violet-50 text-violet-700 border-violet-200' },
  Booked:    { label: 'Booked',    className: 'bg-green-50  text-green-700 border-green-200' },
  Completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-400 border-red-200 line-through opacity-60' },
}

interface Props { status: BookingStatus }

export default function StatusBadge({ status }: Props) {
  const { label, className } = CONFIGS[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}>
      {label}
    </span>
  )
}
