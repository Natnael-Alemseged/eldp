import { detectPII } from "./patterns"
import { SessionVault } from "./session-vault"

const vaults = new Map<string, SessionVault>()

function getVault(sessionId: string): SessionVault {
  if (!vaults.has(sessionId)) vaults.set(sessionId, new SessionVault(sessionId))
  return vaults.get(sessionId) ?? new SessionVault(sessionId)
}

export interface AnonymizeResult {
  text: string
  tokenMap: Record<string, string>
}

export function anonymize(text: string, sessionId: string): AnonymizeResult {
  const vault = getVault(sessionId)
  const matches = detectPII(text).sort((a, b) => b.start - a.start)
  let result = text
  for (const match of matches) {
    const token = vault.getOrCreateToken(match.value)
    result = result.slice(0, match.start) + token + result.slice(match.end)
  }
  return { text: result, tokenMap: vault.getTokenMap() }
}

export function deanonymize(text: string, tokenMap: Record<string, string>): string {
  let result = text
  for (const [token, value] of Object.entries(tokenMap)) {
    result = result.split(token).join(value)
  }
  return result
}
