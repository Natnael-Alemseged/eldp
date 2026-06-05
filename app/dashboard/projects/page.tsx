"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface Project {
  id: string
  name: string
  _count: { segments: number }
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch("/api/projects")
    if (res.ok) setProjects(await res.json())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function createProject(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setName("")
    setCreating(false)
    load()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Projects</h1>

      <form onSubmit={createProject} className="flex gap-2 mb-8 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <Button type="submit" disabled={creating}>
          Create
        </Button>
      </form>

      <div className="grid gap-3 max-w-2xl">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            className="block bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{p.name}</p>
              <span className="text-sm text-zinc-400">{p._count.segments} segments</span>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-zinc-400 text-sm">No projects yet. Create one above.</p>
        )}
      </div>
    </div>
  )
}
