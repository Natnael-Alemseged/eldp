"use client"

import { Button } from "@/components/ui/button"

interface AIAssistPanelProps {
  loading: boolean
  suggestion: string | null
  error: string | null
  onRequest: () => void
  onAccept: (text: string) => void
  onDismiss: () => void
}

export default function AIAssistPanel({
  loading,
  suggestion,
  error,
  onRequest,
  onAccept,
  onDismiss,
}: AIAssistPanelProps) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium">AI Draft Assist</p>
        <Button size="sm" variant="outline" onClick={onRequest} disabled={loading}>
          {loading ? "Thinking…" : "Get suggestion"}
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {suggestion && (
        <>
          <div
            className="bg-white border border-zinc-200 rounded-lg p-3 text-sm mb-3 leading-relaxed"
            style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
          >
            {suggestion}
          </div>
          <div className="flex gap-2 items-center">
            <Button size="sm" onClick={() => onAccept(suggestion)}>
              Use suggestion
            </Button>
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Human review required before this becomes a gold segment.
          </p>
        </>
      )}
    </div>
  )
}
