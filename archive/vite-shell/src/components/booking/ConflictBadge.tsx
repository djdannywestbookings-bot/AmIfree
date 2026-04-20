import type { ConflictType } from '../../types'

type Config = { label: string; className: string; dot: string }

const CONFIGS: Record<NonNullable<ConflictType>, Config> = {
  'Hard Conflict':       { label: 'Hard Conflict',    className: 'bg-red-100 text-red-700 border-red-300',        dot: 'bg-red-500'    },
  'Possible Conflict':   { label: 'Possible Conflict',className: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  'Missing Info Warning':{ label: 'Missing Info',     className: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
}

interface Props { conflict: ConflictType }

export default function ConflictBadge({ conflict }: Props) {
  if (!conflict) return null
  const { label, className, dot } = CONFIGS[conflict]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}
