import { PDFDocument } from "pdf-lib";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

function toSafeMargin(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.min(Math.max(parsed, 0), 500);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ranges = String(formData.get("ranges") ?? "all").trim().toLowerCase();
    const marginTop = toSafeMargin(formData.get("marginTop"));
    const marginRight = toSafeMargin(formData.get("marginRight"));
    const marginBottom = toSafeMargin(formData.get("marginBottom"));
    const marginLeft = toSafeMargin(formData.get("marginLeft"));

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(sourceBytes);
    const pageCount = pdfDoc.getPageCount();
    const selectedPages =
      ranges === "all"
        ? Array.from({ length: pageCount }, (_, index) => index + 1)
        : parsePageSelection(ranges, pageCount);

    for (const pageNumber of selectedPages) {
      const page = pdfDoc.getPage(pageNumber - 1);
      const { width, height } = page.getSize();

      const cropWidth = Math.max(width - marginLeft - marginRight, 30);
      const cropHeight = Math.max(height - marginTop - marginBottom, 30);
      const cropX = Math.min(marginLeft, width - 30);
      const cropY = Math.min(marginBottom, height - 30);

      page.setCropBox(cropX, cropY, cropWidth, cropHeight);
    }

    const outputBytes = await pdfDoc.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cropped.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to crop this PDF.";

    return Response.json({ error: message }, { status: 500 });
  }
}
