"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface Project {
  id: string
  name: string
}

export default function TMXPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((p) => {
        setProjects(p)
        if (p.length > 0) setProjectId(p[0].id)
      })
  }, [])

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !projectId) return
    setLoading(true)
    setError("")
    setResult(null)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("projectId", projectId)
    const res = await fetch("/api/tmx/import", { method: "POST", body: fd })
    setLoading(false)
    if (res.ok) {
      setResult(await res.json())
    } else {
      setError("Import failed. Check the file format (must be valid TMX).")
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Import TMX</h1>
      <p className="text-zinc-500 text-sm mb-6">
        Import an industry-standard Translation Memory eXchange (.tmx) file to seed your translation
        memory.
      </p>

      <form
        onSubmit={handleImport}
        className="bg-white border border-zinc-200 rounded-xl p-6 max-w-md"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="tmx-project" className="block text-sm font-medium mb-1">
              Project
            </label>
            {projects.length > 0 ? (
              <select
                id="tmx-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-zinc-400">
                No projects yet.{" "}
                <a href="/dashboard/projects" className="underline">
                  Create one first.
                </a>
              </p>
            )}
          </div>
          <div>
            <label htmlFor="tmx-file" className="block text-sm font-medium mb-1">
              TMX file
            </label>
            <input
              id="tmx-file"
              type="file"
              accept=".tmx,text/xml,application/xml"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              Imported {result.imported} segments.
              {result.skipped > 0 ? ` ${result.skipped} skipped (unknown language pair).` : ""}
            </div>
          )}
          <Button type="submit" disabled={loading || !file || !projectId}>
            {loading ? "Importing…" : "Import"}
          </Button>
        </div>
      </form>
    </div>
  )
}
