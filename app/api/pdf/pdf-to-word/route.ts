import { Document, Packer, Paragraph } from "docx";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let parser: PDFParse | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const password = String(formData.get("password") ?? "").trim() || undefined;

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    parser = new PDFParse({ data, password });
    const textResult = await parser.getText();
    const cleanText = textResult.text.replace(/\r\n/g, "\n").trim();

    const lines = cleanText ? cleanText.split("\n") : ["No readable text found in this PDF."];
    const paragraphs = lines.map((line) => new Paragraph(line || " "));

    const doc = new Document({
      sections: [{ children: paragraphs }]
    });
    const docBytes = await Packer.toBuffer(doc);

    return new Response(Buffer.from(docBytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="pdf-to-word.docx"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to convert PDF to Word.";

    return Response.json({ error: message }, { status: 500 });
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
