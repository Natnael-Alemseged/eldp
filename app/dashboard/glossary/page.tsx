"use client"

import { Button } from "@/components/ui/button"
import { useCallback, useEffect, useState } from "react"

interface Term {
  id: string
  sourceTerm: string
  targetTerm: string
  languagePair: string
  notes?: string
}

const LP_LABELS: Record<string, string> = {
  AM_EN: "Amharic → English",
  EN_AM: "English → Amharic",
  AM_OR: "Amharic → Oromo",
  EN_OR: "English → Oromo",
}

export default function GlossaryPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [form, setForm] = useState({
    sourceTerm: "",
    targetTerm: "",
    languagePair: "AM_EN",
    notes: "",
  })
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch("/api/glossary")
    if (res.ok) setTerms(await res.json())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function addTerm(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    await fetch("/api/glossary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm((f) => ({ ...f, sourceTerm: "", targetTerm: "", notes: "" }))
    setAdding(false)
    load()
  }

  async function deleteTerm(id: string) {
    await fetch(`/api/glossary/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Glossary</h1>

      <form
        onSubmit={addTerm}
        className="bg-white border border-zinc-200 rounded-xl p-5 mb-6 max-w-2xl"
      >
        <p className="text-sm font-medium mb-3">Add term</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            id="source-term"
            value={form.sourceTerm}
            onChange={(e) => setForm((f) => ({ ...f, sourceTerm: e.target.value }))}
            placeholder="Source term"
            required
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
          />
          <input
            id="target-term"
            value={form.targetTerm}
            onChange={(e) => setForm((f) => ({ ...f, targetTerm: e.target.value }))}
            placeholder="Target term"
            required
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
          />
        </div>
        <div className="flex gap-3 mb-3">
          <select
            value={form.languagePair}
            onChange={(e) => setForm((f) => ({ ...f, languagePair: e.target.value }))}
            className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
          >
            {Object.entries(LP_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={adding} size="sm">
          Add term
        </Button>
      </form>

      <div className="max-w-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-2 pr-4 font-medium text-zinc-500">Source</th>
              <th className="text-left py-2 pr-4 font-medium text-zinc-500">Target</th>
              <th className="text-left py-2 pr-4 font-medium text-zinc-500">Pair</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.id} className="border-b border-zinc-100">
                <td
                  className="py-2 pr-4"
                  style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
                >
                  {t.sourceTerm}
                </td>
                <td
                  className="py-2 pr-4"
                  style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
                >
                  {t.targetTerm}
                </td>
                <td className="py-2 pr-4 text-zinc-400 text-xs">{LP_LABELS[t.languagePair]}</td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => deleteTerm(t.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {terms.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-zinc-400">
                  No terms yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
