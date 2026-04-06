import { convert } from "html-to-text";

import { assertSafeExternalUrl } from "@/lib/network-safety";
import { buildPdfFromText } from "@/lib/pdf-text-render";

export const runtime = "nodejs";

const MAX_HTML_LENGTH = 1_200_000;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const urlInput = String(formData.get("url") ?? "").trim();
    const htmlInput = String(formData.get("html") ?? "").trim();
    const title = String(formData.get("title") ?? "HTML to PDF").trim() || "HTML to PDF";

    let html = htmlInput;
    let sourceLabel = "Raw HTML";

    if (!html && !urlInput) {
      return Response.json(
        { error: "Provide either a URL or HTML content." },
        { status: 400 }
      );
    }

    if (!html && urlInput) {
      const safeUrl = assertSafeExternalUrl(urlInput);
      const response = await fetch(safeUrl, {
        headers: { "User-Agent": "pdf-forge-clone/1.0" }
      });

      if (!response.ok) {
        return Response.json(
          { error: `Could not fetch page (${response.status}).` },
          { status: 400 }
        );
      }

      html = await response.text();
      sourceLabel = safeUrl;
    }

    if (!html) {
      return Response.json({ error: "No HTML content found." }, { status: 400 });
    }

    if (html.length > MAX_HTML_LENGTH) {
      return Response.json(
        { error: "HTML content is too large. Keep it under 1.2 MB." },
        { status: 400 }
      );
    }

    const textContent = convert(html, {
      wordwrap: 120,
      selectors: [{ selector: "a", options: { ignoreHref: true } }]
    });

    const pdfBytes = await buildPdfFromText({
      title,
      text: `Source: ${sourceLabel}\n\n${textContent || "No readable text found."}`
    });

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="html-to-pdf.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate PDF from HTML.";

    return Response.json({ error: message }, { status: 500 });
  }
}
