import { db } from "@/lib/db/client"
import type { LanguagePair } from "@/lib/generated/prisma/enums"
import { parseTMX } from "./parser"

const LANG_PAIR_MAP: Record<string, LanguagePair> = {
  "en-am": "EN_AM",
  "am-en": "AM_EN",
  "am-or": "AM_OR",
  "en-or": "EN_OR",
}

export async function importTMX(
  xml: string,
  projectId: string,
  shopId: string,
  filename: string,
): Promise<{ imported: number; skipped: number }> {
  const units = parseTMX(xml)
  let imported = 0
  let skipped = 0

  for (const unit of units) {
    const pairKey = `${unit.sourceLang}-${unit.targetLang}`
    const languagePair = LANG_PAIR_MAP[pairKey]
    if (!languagePair) {
      skipped++
      continue
    }

    await db.segment.create({
      data: {
        sourceText: unit.sourceText,
        targetText: unit.targetText,
        languagePair,
        projectId,
        provenance: `tmx:${filename}`,
        anonymized: false,
      },
    })
    imported++
  }

  await db.tMXImport.create({
    data: { shopId, filename, segmentCount: imported },
  })

  return { imported, skipped }
}
