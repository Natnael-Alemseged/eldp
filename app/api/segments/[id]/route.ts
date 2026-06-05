import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { levenshteinDistance, logValidationEvent } from "@/lib/validation/events"
import { NextResponse } from "next/server"
import { z } from "zod"

const patchSchema = z.object({
  targetText: z.string().optional(),
  previousTarget: z.string().optional(),
  timeSpentMs: z.number().optional(),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const segment = await db.segment.findFirst({
    where: { id, project: { shopId: session.user.shopId } },
    include: { edits: { orderBy: { createdAt: "desc" }, take: 5 } },
  })
  if (!segment) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(segment)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { id } = await params
  const segment = await db.segment.findFirst({
    where: { id, project: { shopId: session.user.shopId } },
  })
  if (!segment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await db.segment.update({
    where: { id },
    data: { targetText: parsed.data.targetText },
  })

  if (parsed.data.targetText !== undefined && parsed.data.previousTarget !== undefined) {
    const editDist = levenshteinDistance(parsed.data.previousTarget, parsed.data.targetText)
    await logValidationEvent({
      segmentId: id,
      eventType: "correction_made",
      languagePair: segment.languagePair,
      timeSpentMs: parsed.data.timeSpentMs,
      editDistance: editDist,
    })
  }

  return NextResponse.json(updated)
}
