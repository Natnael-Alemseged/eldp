import { auth } from "@/auth"
import type { LanguagePair } from "@/lib/generated/prisma/enums"
import { logValidationEvent } from "@/lib/validation/events"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  segmentId: z.string(),
  eventType: z.string(),
  languagePair: z.enum(["AM_EN", "EN_AM", "AM_OR", "EN_OR"]),
  timeSpentMs: z.number().optional(),
  editDistance: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  await logValidationEvent({
    ...parsed.data,
    languagePair: parsed.data.languagePair as LanguagePair,
  })
  return new NextResponse(null, { status: 204 })
}
