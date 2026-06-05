import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
  targetTerm: z.string().min(1).optional(),
  notes: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const { id } = await params
  await db.glossaryTerm.updateMany({
    where: { id, shopId: session.user.shopId },
    data: parsed.data,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await db.glossaryTerm.deleteMany({ where: { id, shopId: session.user.shopId } })
  return new NextResponse(null, { status: 204 })
}
