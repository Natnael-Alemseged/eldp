"use client"

import AIAssistPanel from "@/components/editor/AIAssistPanel"
import { Button } from "@/components/ui/button"
import { useAIDraft } from "@/hooks/useAIDraft"
import dynamic from "next/dynamic"
import Link from "next/link"
import { use, useEffect, useRef, useState } from "react"

const TargetPanel = dynamic(() => import("@/components/editor/TargetPanel"), { ssr: false })

interface Segment {
  id: string
  sourceText: string
  targetText?: string
  languagePair: string
  trustTier: string
  projectId: string
}

const LP_LABELS: Record<string, string> = {
  AM_EN: "Amharic → English",
  EN_AM: "English → Amharic",
  AM_OR: "Amharic → Oromo",
  EN_OR: "English → Oromo",
}

export default function EditorPage({ params }: { params: Promise<{ segmentId: string }> }) {
  const { segmentId } = use(params)
  const [segment, setSegment] = useState<Segment | null>(null)
  const [target, setTarget] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const startTime = useRef(Date.now())
  const ai = useAIDraft(segmentId)

  useEffect(() => {
    fetch(`/api/segments/${segmentId}`)
      .then((r) => r.json())
      .then((s) => {
        setSegment(s)
        setTarget(s.targetText ?? "")
      })
  }, [segmentId])

  async function save() {
    if (!segment) return
    setSaving(true)
    const timeSpentMs = Date.now() - startTime.current
    await fetch(`/api/segments/${segmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetText: target,
        previousTarget: segment.targetText ?? "",
        timeSpentMs,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSegment((s) => (s ? { ...s, targetText: target } : null))
    startTime.current = Date.now()
  }

  function handleAcceptSuggestion(text: string) {
    const timeSpentMs = Date.now() - startTime.current
    ai.acceptDraft(text, timeSpentMs)
    setTarget(text)
    setSegment((s) => (s ? { ...s, targetText: text } : null))
    ai.clear()
  }

  if (!segment) return <div className="p-8 text-zinc-400">Loading…</div>

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link
          href={`/dashboard/projects/${segment.projectId}`}
          className="text-zinc-400 text-sm hover:text-zinc-700"
        >
          ← Project
        </Link>
        <span className="text-sm text-zinc-400">{LP_LABELS[segment.languagePair]}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            segment.trustTier === "GOLD"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {segment.trustTier.toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
            Source (read-only)
          </div>
          <div
            className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 min-h-[200px] text-sm leading-relaxed"
            style={{ fontFamily: "'Noto Sans Ethiopic', 'Noto Sans', sans-serif" }}
          >
            {segment.sourceText}
          </div>
        </div>

        <TargetPanel key={segment.id} initialContent={segment.targetText} onChange={setTarget} />
      </div>

      <AIAssistPanel
        loading={ai.loading}
        suggestion={ai.result?.suggestion ?? null}
        error={ai.error}
        onRequest={ai.requestDraft}
        onAccept={handleAcceptSuggestion}
        onDismiss={ai.clear}
      />

      <div className="flex items-center gap-4 mt-4 flex-wrap">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save translation"}
        </Button>
        {saved && <span className="text-sm text-green-600">Saved</span>}
        {segment.targetText && (
          <>
            <a
              href={`/api/export/pdf/${segmentId}`}
              className="text-sm text-zinc-500 underline hover:text-zinc-900"
            >
              Export PDF
            </a>
            <a
              href={`/api/export/docx/${segmentId}`}
              className="text-sm text-zinc-500 underline hover:text-zinc-900"
            >
              Export Word
            </a>
          </>
        )}
      </div>
    </div>
  )
}
