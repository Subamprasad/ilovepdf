import { PDFDocument } from "pdf-lib";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const order = String(formData.get("order") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (!order.trim()) {
      return Response.json(
        { error: "Please provide a page order, for example 3,1,2,4-6." },
        { status: 400 }
      );
    }

    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    const sourcePdf = await PDFDocument.load(sourceBytes);
    const pageCount = sourcePdf.getPageCount();
    const orderedPages = parsePageSelection(order, pageCount, { dedupe: false });

    const outputPdf = await PDFDocument.create();
    const copiedPages = await outputPdf.copyPages(
      sourcePdf,
      orderedPages.map((page) => page - 1)
    );
    copiedPages.forEach((page) => outputPdf.addPage(page));

    const outputBytes = await outputPdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="organized.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to organize this PDF.";

    return Response.json({ error: message }, { status: 500 });
  }
}
