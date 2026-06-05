import fs from "node:fs"
import path from "node:path"
import puppeteer from "puppeteer"

function buildSegmentHTML(sourceText: string, targetText: string, languagePair: string): string {
  const fontPath = path.join(process.cwd(), "public/fonts/NotoSansEthiopic-Regular.ttf")
  const fontB64 = fs.existsSync(fontPath) ? fs.readFileSync(fontPath).toString("base64") : null
  const fontFace = fontB64
    ? `@font-face { font-family: 'NotoEthiopic'; src: url('data:font/ttf;base64,${fontB64}') format('truetype'); }`
    : ""

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  ${fontFace}
  body { font-family: 'NotoEthiopic', 'Noto Sans Ethiopic', Arial, sans-serif; margin: 40px; font-size: 14px; line-height: 1.6; }
  .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-family: Arial, sans-serif; }
  .source { background: #f8f8f8; padding: 16px; border-radius: 4px; margin-bottom: 20px; }
  .target { background: #fff; border: 1px solid #ddd; padding: 16px; border-radius: 4px; }
  .footer { font-size: 10px; color: #aaa; margin-top: 24px; font-family: Arial, sans-serif; }
</style>
</head>
<body>
  <div class="label">Source</div>
  <div class="source">${escapeHtml(sourceText)}</div>
  <div class="label">Translation</div>
  <div class="target">${escapeHtml(targetText)}</div>
  <div class="footer">Language pair: ${escapeHtml(languagePair)} · Ethiopian Legal Document Platform</div>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function exportSegmentPDF(
  sourceText: string,
  targetText: string,
  languagePair: string,
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(buildSegmentHTML(sourceText, targetText, languagePair), {
      waitUntil: "load",
    })
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
