import { detectPII } from "@/lib/anonymization/patterns"
import { anonymize, deanonymize } from "@/lib/anonymization/pipeline"
import { SessionVault } from "@/lib/anonymization/session-vault"
import { describe, expect, it } from "vitest"

describe("detectPII", () => {
  it("detects +251 phone number", () => {
    expect(detectPII("Call +251911234567").some((m) => m.type === "phone")).toBe(true)
  })
  it("detects local 09xx phone", () => {
    expect(detectPII("0911234567 is my number").some((m) => m.type === "phone")).toBe(true)
  })
  it("detects 12-digit Fayda ID", () => {
    expect(detectPII("ID: 123456789012").some((m) => m.type === "fayda_id")).toBe(true)
  })
  it("detects 13-digit bank account", () => {
    expect(detectPII("Account 1000123456789").some((m) => m.type === "bank_account")).toBe(true)
  })
  it("detects kebele reference", () => {
    expect(detectPII("Kebele 07 resident").some((m) => m.type === "kebele")).toBe(true)
  })
  it("returns empty for clean text", () => {
    expect(detectPII("The rent shall be paid monthly")).toHaveLength(0)
  })
})

describe("SessionVault", () => {
  it("creates a token and reverses it", () => {
    const vault = new SessionVault("s1")
    const token = vault.getOrCreateToken("+251911234567")
    expect(token).toMatch(/^\[PII_[A-F0-9]+\]$/)
    expect(vault.detokenize(token)).toBe("+251911234567")
  })
  it("returns same token for same value", () => {
    const vault = new SessionVault("s2")
    expect(vault.getOrCreateToken("abc")).toBe(vault.getOrCreateToken("abc"))
  })
})

describe("anonymize / deanonymize", () => {
  it("removes PII from text and restores it", () => {
    const { text, tokenMap } = anonymize("Contact +251911234567 re: lease", "sess1-test")
    expect(text).not.toContain("+251911234567")
    expect(deanonymize(text, tokenMap)).toContain("+251911234567")
  })
})
