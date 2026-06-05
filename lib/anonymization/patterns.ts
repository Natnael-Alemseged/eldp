export interface PIIMatch {
  type: "phone" | "fayda_id" | "bank_account" | "kebele"
  value: string
  start: number
  end: number
}

const PATTERNS: Array<{ type: PIIMatch["type"]; regex: RegExp }> = [
  { type: "phone", regex: /(?:\+251|0)[79]\d{8}/g },
  { type: "fayda_id", regex: /(?<!\d)\d{12}(?!\d)/g },
  { type: "bank_account", regex: /(?<!\d)\d{13,16}(?!\d)/g },
  { type: "kebele", regex: /(?:kebele|ቀበሌ)\s*\d{1,3}/gi },
]

export function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = []
  for (const { type, regex } of PATTERNS) {
    const re = new RegExp(regex.source, regex.flags)
    let m = re.exec(text)
    while (m !== null) {
      matches.push({ type, value: m[0], start: m.index, end: m.index + m[0].length })
      m = re.exec(text)
    }
  }
  // Remove matches fully covered by a longer match at same/overlapping position
  return matches.filter(
    (m, i) =>
      !matches.some(
        (o, j) =>
          i !== j && o.start <= m.start && o.end >= m.end && o.value.length > m.value.length,
      ),
  )
}
