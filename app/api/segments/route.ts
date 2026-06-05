import { auth } from "@/auth"
import { anonymize } from "@/lib/anonymization/pipeline"
import { db } from "@/lib/db/client"
import type { LanguagePair } from "@/lib/generated/prisma/enums"
import { logValidationEvent } from "@/lib/validation/events"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  sourceText: z.string().min(1),
  languagePair: z.enum(["AM_EN", "EN_AM", "AM_OR", "EN_OR"]),
  projectId: z.string(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const project = await db.project.findFirst({
    where: { id: parsed.data.projectId, shopId: session.user.shopId },
  })
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const sessionId = `${session.user.id ?? session.user.email}-${parsed.data.projectId}`
  const { text: anonSource } = anonymize(parsed.data.sourceText, sessionId)

  const segment = await db.segment.create({
    data: {
      sourceText: anonSource,
      languagePair: parsed.data.languagePair as LanguagePair,
      projectId: parsed.data.projectId,
      anonymized: true,
    },
  })

  await logValidationEvent({
    segmentId: segment.id,
    eventType: "segment_saved",
    languagePair: parsed.data.languagePair as LanguagePair,
  })

  return NextResponse.json(segment, { status: 201 })
}
