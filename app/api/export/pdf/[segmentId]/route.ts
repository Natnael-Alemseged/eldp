import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import { exportSegmentPDF } from "@/lib/export/pdf"
import { logValidationEvent } from "@/lib/validation/events"
import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: Promise<{ segmentId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { segmentId } = await params
  const segment = await db.segment.findFirst({
    where: { id: segmentId, project: { shopId: session.user.shopId } },
  })
  if (!segment?.targetText) {
    return NextResponse.json({ error: "Segment not found or missing translation" }, { status: 404 })
  }

  const pdf = await exportSegmentPDF(segment.sourceText, segment.targetText, segment.languagePair)

  await logValidationEvent({
    segmentId,
    eventType: "export_requested",
    languagePair: segment.languagePair,
    metadata: { format: "pdf" },
  })

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="segment-${segmentId}.pdf"`,
    },
  })
}
