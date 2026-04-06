import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (!files.length) {
      return Response.json(
        { error: "Upload at least one JPG or PNG image." },
        { status: 400 }
      );
    }

    const outputPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mime = file.type.toLowerCase();

      const image =
        mime === "image/png"
          ? await outputPdf.embedPng(bytes)
          : mime === "image/jpeg" || mime === "image/jpg"
            ? await outputPdf.embedJpg(bytes)
            : null;

      if (!image) {
        return Response.json(
          { error: "Only JPG and PNG files are accepted." },
          { status: 400 }
        );
      }

      const page = outputPdf.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
      });
    }

    const outputBytes = await outputPdf.save();

    return new Response(Buffer.from(outputBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images-to-pdf.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate PDF from the uploaded images.";

    return Response.json({ error: message }, { status: 500 });
  }
}
