import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    const inputBytes = new Uint8Array(await file.arrayBuffer());
    const sourcePdf = await PDFDocument.load(inputBytes);
    const outputPdf = await PDFDocument.create();

    const copiedPages = await outputPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices()
    );
    copiedPages.forEach((page) => outputPdf.addPage(page));

    const outputBytes = await outputPdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false
    });

    const bestBytes = outputBytes.length <= inputBytes.length ? outputBytes : inputBytes;

    return new Response(Buffer.from(bestBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
        "X-Original-Bytes": String(inputBytes.length),
        "X-Output-Bytes": String(bestBytes.length),
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to optimize this PDF.";

    return Response.json({ error: message }, { status: 500 });
  }
}
