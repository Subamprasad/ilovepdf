import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const text = String(formData.get("text") ?? "").trim();
    const ranges = String(formData.get("ranges") ?? "all").trim().toLowerCase();
    const fontSize = clamp(Number(formData.get("fontSize") ?? 48), 12, 200);
    const opacity = clamp(Number(formData.get("opacity") ?? 0.2), 0.05, 0.9);
    const angle = clamp(Number(formData.get("angle") ?? -35), -90, 90);

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (!text) {
      return Response.json(
        { error: "Watermark text cannot be empty." },
        { status: 400 }
      );
    }

    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(sourceBytes);
    const pageCount = pdfDoc.getPageCount();
    const selectedPages =
      ranges === "all"
        ? Array.from({ length: pageCount }, (_, index) => index + 1)
        : parsePageSelection(ranges, pageCount);

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const pageNumber of selectedPages) {
      const page = pdfDoc.getPage(pageNumber - 1);
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: fontSize,
        font,
        color: rgb(0.42, 0.42, 0.5),
        rotate: degrees(angle),
        opacity
      });
    }

    const outputBytes = await pdfDoc.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="watermarked.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to watermark this file.";

    return Response.json({ error: message }, { status: 500 });
  }
}
