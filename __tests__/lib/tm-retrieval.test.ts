import { type TMEntry, findExactMatch, normalizeForTM } from "@/lib/tm/retrieval"
import { describe, expect, it } from "vitest"

const entries: TMEntry[] = [
  {
    segmentId: "s1",
    sourceText: "The tenant shall pay rent monthly.",
    targetText: "ተከራዩ ኪራዩን በወር ይከፍላል።",
    score: 1.0,
  },
  {
    segmentId: "s2",
    sourceText: "Security deposit required.",
    targetText: "ዋስትና ተቀማጭ ያስፈልጋል።",
    score: 1.0,
  },
]

describe("normalizeForTM", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalizeForTM("The Tenant, shall Pay!")).toBe("the tenant shall pay")
  })
})

describe("findExactMatch", () => {
  it("finds exact match", () => {
    const result = findExactMatch("The tenant shall pay rent monthly.", entries)
    expect(result?.segmentId).toBe("s1")
  })
  it("finds normalized match ignoring case and punctuation", () => {
    const result = findExactMatch("the tenant shall pay rent monthly", entries)
    expect(result?.segmentId).toBe("s1")
  })
  it("returns null when no match", () => {
    expect(findExactMatch("No matching text here", entries)).toBeNull()
  })
})
