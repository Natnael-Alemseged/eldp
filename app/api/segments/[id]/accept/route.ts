import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { levenshteinDistance, logValidationEvent } from "@/lib/validation/events"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  editId: z.string(),
  finalText: z.string(),
  timeSpentMs: z.number().optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { id } = await params
  const segment = await db.segment.findFirst({
    where: { id, project: { shopId: session.user.shopId } },
  })
  if (!segment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const edit = await db.segmentEdit.findFirst({
    where: { id: parsed.data.editId, segmentId: id },
  })
  if (!edit) return NextResponse.json({ error: "Edit not found" }, { status: 404 })

  const editDist = edit.aiSuggestion
    ? levenshteinDistance(edit.aiSuggestion, parsed.data.finalText)
    : 0
  const wasAcceptedAsIs = editDist === 0

  await db.$transaction([
    db.segmentEdit.update({
      where: { id: parsed.data.editId },
      data: {
        accepted: wasAcceptedAsIs,
        humanCorrection: parsed.data.finalText,
        editDistance: editDist,
      },
    }),
    db.segment.update({
      where: { id },
      data: { targetText: parsed.data.finalText },
    }),
  ])

  await logValidationEvent({
    segmentId: id,
    eventType: wasAcceptedAsIs ? "suggestion_accepted" : "correction_made",
    languagePair: segment.languagePair,
    timeSpentMs: parsed.data.timeSpentMs,
    editDistance: editDist,
  })

  return NextResponse.json({ accepted: wasAcceptedAsIs, editDistance: editDist })
}
