import { auth } from "@/auth"
import { getModelAdapter } from "@/lib/ai/router"
import { db } from "@/lib/db/client"
import { lookupTMMatches } from "@/lib/tm/retrieval"
import { logValidationEvent } from "@/lib/validation/events"
import { NextResponse } from "next/server"

const LANG_NAMES: Record<string, string> = {
  AM: "Amharic",
  EN: "English",
  OR: "Afaan Oromoo",
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const segment = await db.segment.findFirst({
    where: { id, project: { shopId: session.user.shopId } },
  })
  if (!segment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const tmMatches = await lookupTMMatches(
    segment.sourceText,
    session.user.shopId,
    segment.languagePair,
  )

  const tmContext =
    tmMatches.length > 0
      ? `\nRelevant translation memory:\n${tmMatches
          .map((m) => `  Source: ${m.sourceText}\n  Target: ${m.targetText}`)
          .join("\n\n")}`
      : ""

  const [srcCode, tgtCode] = segment.languagePair.split("_")
  const srcLang = LANG_NAMES[srcCode] ?? srcCode
  const tgtLang = LANG_NAMES[tgtCode] ?? tgtCode

  const prompt = `Translate this ${srcLang} legal text to ${tgtLang}. Produce formal legal language only. Return the translation and nothing else.${tmContext}

Source text:
${segment.sourceText}`

  const adapter = getModelAdapter()
  let suggestion: string
  try {
    suggestion = await adapter.complete(prompt, { maxTokens: 1024 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const isRateLimit = msg.includes("429") || msg.toLowerCase().includes("quota")
    return NextResponse.json(
      {
        error: isRateLimit ? "AI rate limit — retry in a moment" : "AI service error",
        detail: msg,
      },
      { status: isRateLimit ? 429 : 502 },
    )
  }

  const edit = await db.segmentEdit.create({
    data: {
      segmentId: id,
      aiSuggestion: suggestion,
      reviewerEmail: session.user.email ?? "",
      accepted: false,
    },
  })

  await logValidationEvent({
    segmentId: id,
    eventType: "suggestion_shown",
    languagePair: segment.languagePair,
    metadata: { editId: edit.id, provider: adapter.provider, model: adapter.model },
  })

  return NextResponse.json({
    editId: edit.id,
    suggestion,
    provider: adapter.provider,
    model: adapter.model,
  })
}
