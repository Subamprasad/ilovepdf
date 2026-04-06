import { PDFDocument } from "pdf-lib";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let parser: PDFParse | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const password = String(formData.get("password") ?? "").trim();

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    parser = new PDFParse({ data: sourceBytes, password: password || undefined });
    const screenshots = await parser.getScreenshot({
      scale: 1.5,
      imageBuffer: true,
      imageDataUrl: false
    });

    if (!screenshots.pages.length) {
      return Response.json(
        { error: "No pages were decoded from this file." },
        { status: 400 }
      );
    }

    const outputPdf = await PDFDocument.create();

    for (const pageShot of screenshots.pages) {
      const embedded = await outputPdf.embedPng(pageShot.data);
      const page = outputPdf.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: embedded.width,
        height: embedded.height
      });
    }

    const unlockedBytes = await outputPdf.save();

    return new Response(Buffer.from(unlockedBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="unlocked.pdf"',
        "Cache-Control": "no-store",
        "X-Unlock-Mode": "rasterized"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to unlock this PDF. Check password or file integrity.";

    return Response.json({ error: message }, { status: 500 });
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
