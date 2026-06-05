import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const shopId = session.user.shopId

  const [totalSegments, totalEdits, acceptedEdits, events] = await Promise.all([
    db.segment.count({ where: { project: { shopId } } }),
    db.segmentEdit.count({ where: { segment: { project: { shopId } } } }),
    db.segmentEdit.count({ where: { segment: { project: { shopId } }, accepted: true } }),
    db.validationEvent.findMany({
      where: { segment: { project: { shopId } } },
      select: { eventType: true, editDistance: true, timeSpentMs: true, languagePair: true },
    }),
  ])

  const withDist = events.filter(
    (e): e is typeof e & { editDistance: number } => e.editDistance !== null,
  )
  const withTime = events.filter(
    (e): e is typeof e & { timeSpentMs: number } => e.timeSpentMs !== null,
  )

  const avgEditDist =
    withDist.reduce((s, e) => s + e.editDistance, 0) / Math.max(1, withDist.length)
  const avgTimeMs = withTime.reduce((s, e) => s + e.timeSpentMs, 0) / Math.max(1, withTime.length)

  const byLang: Record<string, number> = {}
  for (const e of events) {
    byLang[e.languagePair] = (byLang[e.languagePair] ?? 0) + 1
  }

  return NextResponse.json({
    totalSegments,
    suggestionAcceptanceRate: totalEdits > 0 ? acceptedEdits / totalEdits : 0,
    avgEditDistance: Math.round(avgEditDist),
    avgTimePerSegmentMs: Math.round(avgTimeMs),
    languageDistribution: byLang,
  })
}
