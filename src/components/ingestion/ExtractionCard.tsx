import { CheckCircle, AlertCircle, Info, Plus } from 'lucide-react'
import type { ExtractionResult } from '../../types'

interface Props {
  result: ExtractionResult
  onApply: (id: string) => void
  applied: boolean
}

const CONFIDENCE_STYLES = {
  high:   { icon: CheckCircle, label: 'High confidence',   className: 'text-green-600',  bg: 'bg-green-50  border-green-200' },
  medium: { icon: AlertCircle, label: 'Medium confidence', className: 'text-amber-600',  bg: 'bg-amber-50  border-amber-200' },
  low:    { icon: Info,         label: 'Low confidence',   className: 'text-red-600',    bg: 'bg-red-50    border-red-200'   },
}

export default function ExtractionCard({ result, onApply, applied }: Props) {
  const { id, extractedTitle, extractedDate, extractedTime, extractedVenue, extractedFee, confidence, rawInput } = result
  const conf = CONFIDENCE_STYLES[confidence]
  const ConfIcon = conf.icon

  return (
    <div className={`rounded-xl border p-3.5 ${conf.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{extractedTitle}</p>
          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <p><span className="font-medium text-foreground">Date:</span> {extractedDate}</p>
            <p><span className="font-medium text-foreground">Time:</span> {extractedTime}</p>
            <p><span className="font-medium text-foreground">Venue:</span> {extractedVenue}</p>
            {extractedFee && <p><span className="font-medium text-foreground">Fee:</span> {extractedFee}</p>}
          </div>
          <div className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${conf.className}`}>
            <ConfIcon size={11} />
            {conf.label}
          </div>
        </div>
        <button
          onClick={() => onApply(id)}
          disabled={applied}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors
            ${applied
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
        >
          <Plus size={12} />
          {applied ? 'Added' : 'Add'}
        </button>
      </div>
      <p className="mt-2.5 text-[10px] text-muted-foreground italic border-t border-border/40 pt-2 line-clamp-2">
        Source: &ldquo;{rawInput}&rdquo;
      </p>
    </div>
  )
}
