import { parseTMX } from "@/lib/tmx/parser"
import { describe, expect, it } from "vitest"

const SAMPLE_TMX = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <header srclang="en"/>
  <body>
    <tu>
      <tuv xml:lang="en"><seg>The tenant shall pay rent.</seg></tuv>
      <tuv xml:lang="am"><seg>ተከራዩ ኪራዩን ይከፍላል።</seg></tuv>
    </tu>
    <tu>
      <tuv xml:lang="en"><seg>Security deposit required.</seg></tuv>
      <tuv xml:lang="am"><seg>ዋስትና ተቀማጭ ያስፈልጋል።</seg></tuv>
    </tu>
  </body>
</tmx>`

describe("parseTMX", () => {
  it("parses two translation units", () => {
    const units = parseTMX(SAMPLE_TMX)
    expect(units).toHaveLength(2)
  })
  it("extracts source and target text", () => {
    const units = parseTMX(SAMPLE_TMX)
    expect(units[0].sourceText).toBe("The tenant shall pay rent.")
    expect(units[0].targetText).toBe("ተከራዩ ኪራዩን ይከፍላል።")
  })
  it("identifies source and target languages", () => {
    const units = parseTMX(SAMPLE_TMX)
    expect(units[0].sourceLang).toBe("en")
    expect(units[0].targetLang).toBe("am")
  })
  it("returns empty for invalid XML", () => {
    expect(parseTMX("<invalid>")).toHaveLength(0)
  })
})
