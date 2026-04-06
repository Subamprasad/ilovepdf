import { PDFDocument, degrees as toDegrees } from "pdf-lib";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

const ALLOWED_ROTATIONS = new Set([90, 180, 270]);

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const angle = Number(formData.get("degrees"));
    const ranges = String(formData.get("ranges") ?? "all").trim().toLowerCase();

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (!ALLOWED_ROTATIONS.has(angle)) {
      return Response.json(
        { error: "Rotation angle must be 90, 180, or 270." },
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

    for (const pageNumber of selectedPages) {
      const page = pdfDoc.getPage(pageNumber - 1);
      const currentAngle = normalizeAngle(page.getRotation().angle);
      const nextAngle = normalizeAngle(currentAngle + angle);
      page.setRotation(toDegrees(nextAngle));
    }

    const outputBytes = await pdfDoc.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="rotated.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to rotate this file.";

    return Response.json({ error: message }, { status: 500 });
  }
}
