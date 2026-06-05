export interface TMEntry {
  segmentId: string
  sourceText: string
  targetText: string
  score: number
}

export function normalizeForTM(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function findExactMatch(source: string, entries: TMEntry[]): TMEntry | null {
  const norm = normalizeForTM(source)
  return entries.find((e) => normalizeForTM(e.sourceText) === norm) ?? null
}

export async function lookupTMMatches(
  sourceText: string,
  shopId: string,
  languagePair: string,
  limit = 5,
): Promise<TMEntry[]> {
  const { db } = await import("@/lib/db/client")
  const segments = await db.segment.findMany({
    where: {
      project: { shopId },
      languagePair: languagePair as never,
      targetText: { not: null },
    },
    select: { id: true, sourceText: true, targetText: true },
    take: 200,
  })

  const entries: TMEntry[] = segments
    .filter((s): s is typeof s & { targetText: string } => s.targetText !== null)
    .map((s) => ({
      segmentId: s.id,
      sourceText: s.sourceText,
      targetText: s.targetText,
      score: 1.0,
    }))

  const exact = findExactMatch(sourceText, entries)
  if (exact) return [{ ...exact, score: 1.0 }]

  const norm = normalizeForTM(sourceText)
  const sourceWords = new Set(norm.split(" ").filter(Boolean))

  const scored = entries
    .map((e) => {
      const eWords = new Set(normalizeForTM(e.sourceText).split(" ").filter(Boolean))
      const intersection = [...sourceWords].filter((w) => eWords.has(w)).length
      const union = new Set([...sourceWords, ...eWords]).size
      return { ...e, score: union > 0 ? intersection / union : 0 }
    })
    .filter((e) => e.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored
}
