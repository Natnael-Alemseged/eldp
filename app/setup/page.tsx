"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

const FIELDS = [
  { key: "shopName", label: "Shop name", type: "text" },
  { key: "adminName", label: "Your name", type: "text" },
  { key: "adminEmail", label: "Email", type: "email" },
  { key: "adminPassword", label: "Password (8+ chars)", type: "password" },
] as const

type FieldKey = (typeof FIELDS)[number]["key"]

export default function SetupPage() {
  const router = useRouter()
  const [form, setForm] = useState<Record<FieldKey, string>>({
    shopName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(typeof data.error === "string" ? data.error : "Setup failed")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-zinc-200 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Create your shop</h1>
        <p className="text-sm text-zinc-500 mb-6">Set up your translation workspace</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium mb-1">
                {label}
              </label>
              <input
                id={key}
                type={type}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required
                className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating…" : "Create shop"}
          </Button>
        </form>
        <p className="text-sm text-center text-zinc-500 mt-4">
          Have an account?{" "}
          <a href="/login" className="underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
