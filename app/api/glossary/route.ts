import { auth } from "@/auth"
import { db } from "@/lib/db/client"
import type { LanguagePair } from "@/lib/generated/prisma/enums"
import { NextResponse } from "next/server"
import { z } from "zod"

const createSchema = z.object({
  sourceTerm: z.string().min(1),
  targetTerm: z.string().min(1),
  languagePair: z.enum(["AM_EN", "EN_AM", "AM_OR", "EN_OR"]),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const lp = searchParams.get("languagePair") as LanguagePair | null
  const terms = await db.glossaryTerm.findMany({
    where: { shopId: session.user.shopId, ...(lp ? { languagePair: lp } : {}) },
    orderBy: { sourceTerm: "asc" },
  })
  return NextResponse.json(terms)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const term = await db.glossaryTerm.create({
    data: {
      ...parsed.data,
      languagePair: parsed.data.languagePair as LanguagePair,
      shopId: session.user.shopId,
    },
  })
  return NextResponse.json(term, { status: 201 })
}
