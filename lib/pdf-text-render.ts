import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type BuildPdfOptions = {
  title?: string;
  text: string;
};

function wrapLine(text: string, maxWidth: number, measure: (value: string) => number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [""];
  }

  const lines: string[] = [];
  let current = words[0];

  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${current} ${words[index]}`;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[index];
    }
  }
  lines.push(current);
  return lines;
}

export async function buildPdfFromText({ title, text }: BuildPdfOptions) {
  const normalizedText = text.replace(/\r\n/g, "\n").trim() || "No text content found.";
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 44;
  const bodyFontSize = 11;
  const bodyLineHeight = 16;
  const maxWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  if (title?.trim()) {
    const safeTitle = title.trim();
    page.drawText(safeTitle, {
      x: margin,
      y,
      size: 18,
      font: titleFont,
      color: rgb(0.12, 0.14, 0.2)
    });
    y -= 30;
  }

  const paragraphs = normalizedText.split("\n");
  for (const paragraph of paragraphs) {
    const lines = paragraph.trim()
      ? wrapLine(paragraph, maxWidth, (value) => font.widthOfTextAtSize(value, bodyFontSize))
      : [""];

    for (const line of lines) {
      if (y <= margin + bodyLineHeight) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      page.drawText(line, {
        x: margin,
        y,
        size: bodyFontSize,
        font,
        color: rgb(0.16, 0.16, 0.18)
      });
      y -= bodyLineHeight;
    }

    y -= 6;
  }

  return pdf.save();
}
