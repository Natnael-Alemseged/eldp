import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { NextResponse } from "next/server"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const projects = await db.project.findMany({
    where: { shopId: session.user.shopId },
    include: { _count: { select: { segments: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(projects)
}

const createSchema = z.object({ name: z.string().min(1) })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const project = await db.project.create({
    data: { name: parsed.data.name, shopId: session.user.shopId },
  })
  return NextResponse.json(project, { status: 201 })
}
