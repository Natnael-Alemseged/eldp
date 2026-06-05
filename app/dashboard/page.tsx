import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-zinc-500 mb-8">Welcome back, {session?.user?.name}</p>

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        {[
          {
            label: "Projects",
            href: "/dashboard/projects",
            desc: "Manage translation projects and segments",
          },
          { label: "Glossary", href: "/dashboard/glossary", desc: "Maintain your legal term base" },
          { label: "Import TMX", href: "/dashboard/tmx", desc: "Import translation memory files" },
        ].map(({ label, href, desc }) => (
          <a
            key={href}
            href={href}
            className="block bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-400 transition-colors"
          >
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-zinc-500 mt-1">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
