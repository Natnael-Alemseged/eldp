import { randomUUID } from "node:crypto"

export class SessionVault {
  private valueToToken = new Map<string, string>()
  private tokenToValue = new Map<string, string>()

  constructor(readonly sessionId: string) {}

  getOrCreateToken(value: string): string {
    const existing = this.valueToToken.get(value)
    if (existing) return existing
    const token = `[PII_${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}]`
    this.valueToToken.set(value, token)
    this.tokenToValue.set(token, value)
    return token
  }

  tokenize(text: string): string {
    let result = text
    for (const [value, token] of [...this.valueToToken.entries()].sort(
      (a, b) => b[0].length - a[0].length,
    )) {
      result = result.split(value).join(token)
    }
    return result
  }

  detokenize(text: string): string {
    let result = text
    for (const [token, value] of this.tokenToValue.entries()) {
      result = result.split(token).join(value)
    }
    return result
  }

  getTokenMap(): Record<string, string> {
    return Object.fromEntries(this.tokenToValue)
  }
}
