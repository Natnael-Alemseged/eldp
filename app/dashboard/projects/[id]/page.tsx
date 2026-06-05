"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { use, useCallback, useEffect, useState } from "react"

interface Segment {
  id: string
  sourceText: string
  targetText?: string
  languagePair: string
  trustTier: string
}

interface Project {
  id: string
  name: string
  segments: Segment[]
}

const LP_LABELS: Record<string, string> = {
  AM_EN: "Amharic → English",
  EN_AM: "English → Amharic",
  AM_OR: "Amharic → Oromo",
  EN_OR: "English → Oromo",
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [source, setSource] = useState("")
  const [lp, setLp] = useState("AM_EN")
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`)
    if (res.ok) setProject(await res.json())
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function addSegment(e: React.FormEvent) {
    e.preventDefault()
    if (!source.trim()) return
    setAdding(true)
    await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText: source, languagePair: lp, projectId: id }),
    })
    setSource("")
    setAdding(false)
    load()
  }

  if (!project) return <div className="p-8 text-zinc-400">Loading…</div>

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/projects" className="text-zinc-400 text-sm hover:text-zinc-700">
          ← Projects
        </Link>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
      </div>

      <form onSubmit={addSegment} className="flex gap-3 mb-8 max-w-2xl items-start">
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Paste source text to add a new segment…"
          rows={3}
          className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
        />
        <div className="flex flex-col gap-2 shrink-0">
          <select
            value={lp}
            onChange={(e) => setLp(e.target.value)}
            className="border border-zinc-300 rounded-lg px-2 py-2 text-sm"
          >
            {Object.entries(LP_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={adding}>
            Add
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-2 max-w-2xl">
        {project.segments.map((s) => (
          <Link
            key={s.id}
            href={`/dashboard/editor/${s.id}`}
            className="block bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">{LP_LABELS[s.languagePair]}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  s.trustTier === "GOLD"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {s.trustTier.toLowerCase()}
              </span>
            </div>
            <p
              className="text-sm line-clamp-2"
              style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
            >
              {s.sourceText}
            </p>
            {s.targetText && (
              <p
                className="text-sm text-zinc-500 mt-1 line-clamp-1"
                style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
              >
                → {s.targetText}
              </p>
            )}
          </Link>
        ))}
        {project.segments.length === 0 && (
          <p className="text-zinc-400 text-sm">No segments yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}
