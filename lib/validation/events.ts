import { db } from "@/lib/db/client"
import type { LanguagePair } from "@/lib/generated/prisma/enums"

export type ValidationEventType =
  | "suggestion_shown"
  | "suggestion_accepted"
  | "correction_made"
  | "segment_saved"
  | "export_requested"
  | "tmx_imported"

export async function logValidationEvent(params: {
  segmentId: string
  eventType: ValidationEventType | string
  languagePair: LanguagePair
  timeSpentMs?: number
  editDistance?: number
  metadata?: Record<string, unknown>
}) {
  await db.validationEvent.create({
    data: {
      ...params,
      metadata: params.metadata as never,
    },
  })
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}
