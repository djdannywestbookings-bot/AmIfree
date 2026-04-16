import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  messages: string[]
}

export default function FollowUpPanel({ messages }: Props) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  if (messages.length === 0) return null

  function handleCopy(msg: string, idx: number) {
    navigator.clipboard.writeText(msg).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 1800)
    }).catch(() => {/* clipboard unavailable */})
  }

  return (
    <div className="mt-2 space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Suggested Follow-ups</p>
      {messages.map((msg, i) => (
        <div key={i} className="flex items-start gap-2 bg-muted/60 rounded-lg p-2.5">
          <p className="flex-1 text-xs text-foreground leading-relaxed">{msg}</p>
          <button
            onClick={() => handleCopy(msg, i)}
            className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
            {copiedIdx === i ? 'Copied' : 'Copy'}
          </button>
        </div>
      ))}
    </div>
  )
}
