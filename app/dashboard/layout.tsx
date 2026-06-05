import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/projects", label: "Projects" },
    { href: "/dashboard/glossary", label: "Glossary" },
    { href: "/dashboard/tmx", label: "Import TMX" },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-zinc-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-zinc-700">
          <p className="text-sm font-semibold tracking-wide">ELDP</p>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{session.user.email}</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-colors text-zinc-200"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-700">
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-700 text-left transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-zinc-50">{children}</main>
    </div>
  )
}
