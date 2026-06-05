import { describe, expect, it } from "vitest"

describe("apiClient", () => {
  it("is defined", async () => {
    const { default: client } = await import("./client")
    expect(client).toBeDefined()
    expect(client.defaults.timeout).toBe(15000)
  })
})
