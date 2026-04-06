import { PDFDocument } from "pdf-lib";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ranges = String(formData.get("ranges") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "The uploaded file must be a PDF." },
        { status: 400 }
      );
    }

    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    const sourcePdf = await PDFDocument.load(sourceBytes);
    const pageCount = sourcePdf.getPageCount();
    const pagesToKeep = parsePageSelection(ranges, pageCount);

    const outputPdf = await PDFDocument.create();
    const copiedPages = await outputPdf.copyPages(
      sourcePdf,
      pagesToKeep.map((pageNumber) => pageNumber - 1)
    );

    copiedPages.forEach((page) => outputPdf.addPage(page));

    const outputBytes = await outputPdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="split.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to split the PDF with the selected ranges.";

    return Response.json({ error: message }, { status: 500 });
  }
}
