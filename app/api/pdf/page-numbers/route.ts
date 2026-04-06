import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { parsePageSelection } from "@/lib/pdf-pages";

export const runtime = "nodejs";

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const VALID_POSITIONS = new Set<Position>([
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
]);

function resolveCoordinates(
  position: Position,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
  margin: number
) {
  const isTop = position.startsWith("top");
  const y = isTop ? pageHeight - margin - fontSize : margin;

  if (position.endsWith("left")) {
    return { x: margin, y };
  }
  if (position.endsWith("center")) {
    return { x: (pageWidth - textWidth) / 2, y };
  }
  return { x: pageWidth - margin - textWidth, y };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ranges = String(formData.get("ranges") ?? "all").trim().toLowerCase();
    const startAt = Number(formData.get("startAt") ?? 1);
    const fontSize = Number(formData.get("fontSize") ?? 14);
    const margin = Number(formData.get("margin") ?? 24);
    const positionInput = String(formData.get("position") ?? "bottom-center");

    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Please upload a PDF file." }, { status: 400 });
    }

    if (!Number.isFinite(startAt) || startAt < 0) {
      return Response.json(
        { error: "Starting number must be 0 or greater." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(fontSize) || fontSize < 8 || fontSize > 72) {
      return Response.json(
        { error: "Font size must be between 8 and 72." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(margin) || margin < 0 || margin > 150) {
      return Response.json(
        { error: "Margin must be between 0 and 150." },
        { status: 400 }
      );
    }

    if (!VALID_POSITIONS.has(positionInput as Position)) {
      return Response.json(
        { error: "Invalid page-number position." },
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
    let currentNumber = startAt;

    for (const pageNumber of selectedPages) {
      const page = pdfDoc.getPage(pageNumber - 1);
      const text = String(currentNumber);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const { width, height } = page.getSize();
      const { x, y } = resolveCoordinates(
        positionInput as Position,
        width,
        height,
        textWidth,
        fontSize,
        margin
      );

      page.drawText(text, {
        x,
        y,
        font,
        size: fontSize,
        color: rgb(0.16, 0.16, 0.2)
      });

      currentNumber += 1;
    }

    const outputBytes = await pdfDoc.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="page-numbers.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to add page numbers.";

    return Response.json({ error: message }, { status: 500 });
  }
}
