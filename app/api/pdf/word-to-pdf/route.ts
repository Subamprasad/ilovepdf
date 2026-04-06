import mammoth from "mammoth";

import { buildPdfFromText } from "@/lib/pdf-text-render";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json(
        { error: "Please upload a DOCX file." },
        { status: 400 }
      );
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".docx")) {
      return Response.json(
        { error: "Only DOCX files are supported." },
        { status: 400 }
      );
    }

    const fileBytes = Buffer.from(await file.arrayBuffer());
    const parsed = await mammoth.extractRawText({ buffer: fileBytes });
    const pdfBytes = await buildPdfFromText({
      title: "Word to PDF",
      text: parsed.value || "No readable text found in this DOCX file."
    });

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="word-to-pdf.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to convert DOCX to PDF.";

    return Response.json({ error: message }, { status: 500 });
  }
}
