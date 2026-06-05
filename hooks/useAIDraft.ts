"use client"

import { useState } from "react"

interface DraftResult {
  editId: string
  suggestion: string
  provider: string
  model: string
}

export function useAIDraft(segmentId: string) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DraftResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function requestDraft() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/segments/${segmentId}/ai-draft`, { method: "POST" })
      if (!res.ok) throw new Error("Draft request failed")
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  async function acceptDraft(finalText: string, timeSpentMs?: number) {
    if (!result) return
    await fetch(`/api/segments/${segmentId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editId: result.editId, finalText, timeSpentMs }),
    })
  }

  return { loading, result, error, requestDraft, acceptDraft, clear: () => setResult(null) }
}
