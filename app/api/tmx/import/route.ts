import { auth } from "@/auth"
import { importTMX } from "@/lib/tmx/importer"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const projectId = formData.get("projectId") as string | null

  if (!file || !projectId) {
    return NextResponse.json({ error: "file and projectId required" }, { status: 400 })
  }

  const xml = await file.text()
  const result = await importTMX(xml, projectId, session.user.shopId, file.name)

  return NextResponse.json(result, { status: 201 })
}
