export function formatETB(amount: number): string {
  return `ETB ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

export function parseETB(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.]/g, ""))
}
