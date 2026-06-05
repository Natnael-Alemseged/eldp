import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const project = await db.project.findFirst({
    where: { id, shopId: session.user.shopId },
    include: { segments: { orderBy: { createdAt: "desc" } } },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}
