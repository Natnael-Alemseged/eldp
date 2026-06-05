import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx"

export async function exportSegmentDOCX(
  sourceText: string,
  targetText: string,
  languagePair: string,
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Source", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [new TextRun({ text: sourceText, size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({ text: "Translation", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [new TextRun({ text: targetText, size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Language pair: ${languagePair}`, size: 18, color: "999999" }),
            ],
          }),
        ],
      },
    ],
  })
  return Packer.toBuffer(doc)
}
