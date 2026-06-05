import {
  ETHIOPIAN_MONTHS,
  ethiopianToGregorian,
  formatEthiopianDate,
  gregorianToEthiopian,
} from "@/lib/ethiopian/calendar"
import { describe, expect, it } from "vitest"

describe("Ethiopian calendar", () => {
  it("exports 13 month names starting with Meskerem", () => {
    expect(ETHIOPIAN_MONTHS).toHaveLength(13)
    expect(ETHIOPIAN_MONTHS[0]).toBe("Meskerem")
    expect(ETHIOPIAN_MONTHS[12]).toBe("Pagume")
  })

  it("converts Sep 11 2023 GC → Meskerem 1 2016 EC", () => {
    const ec = gregorianToEthiopian(new Date(2023, 8, 11))
    expect(ec).toEqual({ year: 2016, month: 1, day: 1 })
  })

  it("converts Meskerem 1 2016 EC → Sep 11 2023 GC", () => {
    const gc = ethiopianToGregorian({ year: 2016, month: 1, day: 1 })
    expect(gc.getFullYear()).toBe(2023)
    expect(gc.getMonth()).toBe(8)
    expect(gc.getDate()).toBe(11)
  })

  it("formats EC date as string", () => {
    expect(formatEthiopianDate({ year: 2016, month: 1, day: 1 })).toBe("1 Meskerem 2016 EC")
  })
})
