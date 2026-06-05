import { XMLParser } from "fast-xml-parser"

export interface TMXUnit {
  sourceText: string
  targetText: string
  sourceLang: string
  targetLang: string
}

export function parseTMX(xml: string): TMXUnit[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "_",
    isArray: (name) => ["tu", "tuv"].includes(name),
  })
  const doc = parser.parse(xml)
  const body = doc?.tmx?.body
  if (!body?.tu) return []

  const srcLang = (doc?.tmx?.header?._srclang ?? "en").toLowerCase()
  const tus: TMXUnit[] = []

  for (const tu of body.tu) {
    const tuvs: Array<Record<string, unknown>> = tu.tuv ?? []
    const langMap = new Map<string, string>()

    for (const tuv of tuvs) {
      const lang = ((tuv["_xml:lang"] as string) ?? (tuv._xml_lang as string) ?? "").toLowerCase()
      const seg = typeof tuv.seg === "string" ? tuv.seg.trim() : ""
      if (lang && seg) langMap.set(lang, seg)
    }

    const langs = [...langMap.keys()]
    if (langs.length < 2) continue

    const targetLang = langs.find((l) => l !== srcLang) ?? langs[1]
    tus.push({
      sourceText: langMap.get(srcLang) ?? "",
      targetText: langMap.get(targetLang) ?? "",
      sourceLang: srcLang,
      targetLang,
    })
  }

  return tus.filter((u) => u.sourceText && u.targetText)
}
