import { useState } from 'react'
import { Scan, FileText, Sparkles } from 'lucide-react'
import ExtractionCard from '../components/ingestion/ExtractionCard'
import { MOCK_EXTRACTIONS } from '../data/mock'

export default function IngestPage() {
  const [text, setText] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  function handleExtract() {
        setShowResults(true)
  }

  function handleApply(id: string) {
    setAppliedIds(prev => new Set([...prev, id]))
  }

  return (
    <div className="p-4 space-y-4 pb-6">
      <div>
        <h2 className="text-sm font-semibold mb-1">Ingest Booking Info</h2>
        <p className="text-xs text-muted-foreground">
          Paste a message, email, or booking text. AI will extract the details.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Paste Text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="e.g. Hey, are you free Sat May 2? Rooftop 9pm-1am, $750..."
          rows={4}
          className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm resize-none
            focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground w-full justify-center cursor-not-allowed"
        >
          <Scan size={14} />
          Attach screenshot or file
          <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">Coming soon</span>
        </button>
      </div>

      <button
        onClick={handleExtract}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Sparkles size={15} />
        Extract with AI
      </button>

      {showResults && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Extracted Results (mocked)
            </h3>
          </div>
          {MOCK_EXTRACTIONS.map(result => (
            <ExtractionCard
              key={result.id}
              result={result}
              onApply={handleApply}
              applied={appliedIds.has(result.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
            }
