import JSZip from "jszip";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { PDFParse } from "pdf-parse";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

function toInt(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export async function POST(request: Request) {
  let parser: PDFParse | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ranges = String(formData.get("ranges") ?? "all").trim().toLowerCase();
    const quality = Math.min(Math.max(toInt(formData.get("quality"), 85), 30), 100);
    const password = String(formData.get("password") ?? "").trim() || undefined;

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    parser = new PDFParse({ data, password });
    const info = await parser.getInfo();
    const totalPages = info.total;

    const partial =
      ranges === "all"
        ? Array.from({ length: totalPages }, (_, index) => index + 1)
        : parsePageSelection(ranges, totalPages);

    const screenshots = await parser.getScreenshot({
      partial,
      desiredWidth: 1600,
      imageBuffer: true,
      imageDataUrl: false
    });

    const jpgPages: Array<{ pageNumber: number; data: Buffer }> = [];

    for (const screenshot of screenshots.pages) {
      const sourceImage = await loadImage(Buffer.from(screenshot.data));
      const canvas = createCanvas(sourceImage.width, sourceImage.height);
      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, sourceImage.width, sourceImage.height);
      context.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);

      const jpgBuffer = canvas.toBuffer("image/jpeg", quality);
      jpgPages.push({ pageNumber: screenshot.pageNumber, data: jpgBuffer });
    }

    if (!jpgPages.length) {
      return Response.json(
        { error: "No pages were rendered from this PDF." },
        { status: 400 }
      );
    }

    if (jpgPages.length === 1) {
      return new Response(new Uint8Array(jpgPages[0].data), {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": 'attachment; filename="page-1.jpg"',
          "Cache-Control": "no-store"
        }
      });
    }

    const zip = new JSZip();
    for (const page of jpgPages) {
      zip.file(`page-${page.pageNumber}.jpg`, page.data);
    }
    const zipBytes = await zip.generateAsync({ type: "uint8array" });

    return new Response(new Uint8Array(zipBytes), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pdf-pages-jpg.zip"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to convert PDF to JPG.";

    return Response.json({ error: message }, { status: 500 });
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}
