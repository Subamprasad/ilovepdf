"use client";

import { FormEvent, useMemo, useState } from "react";

type ToolKey =
  | "merge"
  | "split"
  | "compress"
  | "organize"
  | "rotate"
  | "watermark"
  | "pageNumbers"
  | "crop"
  | "jpgToPdf"
  | "pdfToJpg"
  | "wordToPdf"
  | "pdfToWord"
  | "htmlToPdf"
  | "unlock";

type ToolStatus = "live" | "coming-soon";

type ToolConfig = {
  key: ToolKey;
  title: string;
  description: string;
  group: string;
  status: ToolStatus;
  endpoint?: string;
  cta?: string;
  fallbackName?: string;
};

const GROUPS = [
  "All",
  "Workflows",
  "Organize PDF",
  "Optimize PDF",
  "Convert PDF",
  "Edit PDF",
  "PDF Security",
  "PDF Intelligence"
];

const TOOLS: ToolConfig[] = [
  {
    key: "merge",
    title: "Merge PDF",
    description: "Combine multiple files in your preferred order.",
    group: "Workflows",
    status: "live",
    endpoint: "/api/pdf/merge",
    cta: "Merge Files",
    fallbackName: "merged.pdf"
  },
  {
    key: "split",
    title: "Split PDF",
    description: "Extract specific pages using ranges.",
    group: "Workflows",
    status: "live",
    endpoint: "/api/pdf/split",
    cta: "Split Pages",
    fallbackName: "split.pdf"
  },
  {
    key: "compress",
    title: "Compress PDF",
    description: "Optimize internal PDF structure to reduce size.",
    group: "Optimize PDF",
    status: "live",
    endpoint: "/api/pdf/compress",
    cta: "Compress PDF",
    fallbackName: "compressed.pdf"
  },
  {
    key: "organize",
    title: "Organize PDF",
    description: "Reorder, keep, or duplicate pages with a custom sequence.",
    group: "Organize PDF",
    status: "live",
    endpoint: "/api/pdf/organize",
    cta: "Organize",
    fallbackName: "organized.pdf"
  },
  {
    key: "rotate",
    title: "Rotate PDF",
    description: "Rotate all pages or only selected ranges.",
    group: "Edit PDF",
    status: "live",
    endpoint: "/api/pdf/rotate",
    cta: "Rotate",
    fallbackName: "rotated.pdf"
  },
  {
    key: "watermark",
    title: "Watermark",
    description: "Stamp diagonal watermark text on selected pages.",
    group: "Edit PDF",
    status: "live",
    endpoint: "/api/pdf/watermark",
    cta: "Add Watermark",
    fallbackName: "watermarked.pdf"
  },
  {
    key: "pageNumbers",
    title: "Page Numbers",
    description: "Add page numbers with custom position and start value.",
    group: "Edit PDF",
    status: "live",
    endpoint: "/api/pdf/page-numbers",
    cta: "Add Numbers",
    fallbackName: "page-numbers.pdf"
  },
  {
    key: "crop",
    title: "Crop PDF",
    description: "Crop margins for selected pages.",
    group: "Edit PDF",
    status: "live",
    endpoint: "/api/pdf/crop",
    cta: "Crop PDF",
    fallbackName: "cropped.pdf"
  },
  {
    key: "jpgToPdf",
    title: "JPG to PDF",
    description: "Convert JPG or PNG images into one PDF.",
    group: "Convert PDF",
    status: "live",
    endpoint: "/api/pdf/jpg-to-pdf",
    cta: "Convert to PDF",
    fallbackName: "images-to-pdf.pdf"
  },
  {
    key: "pdfToJpg",
    title: "PDF to JPG",
    description: "Convert PDF pages into image files.",
    group: "Convert PDF",
    status: "coming-soon"
  },
  {
    key: "wordToPdf",
    title: "Word to PDF",
    description: "Convert DOCX files to PDF.",
    group: "Convert PDF",
    status: "coming-soon"
  },
  {
    key: "pdfToWord",
    title: "PDF to Word",
    description: "Convert PDFs to editable DOCX.",
    group: "Convert PDF",
    status: "coming-soon"
  },
  {
    key: "htmlToPdf",
    title: "HTML to PDF",
    description: "Generate PDFs from URLs or HTML.",
    group: "Convert PDF",
    status: "coming-soon"
  },
  {
    key: "unlock",
    title: "Unlock PDF",
    description: "Remove password protection with owner permission.",
    group: "PDF Security",
    status: "coming-soon"
  }
];

function getFileNameFromDisposition(disposition: string | null): string | null {
  if (!disposition) {
    return null;
  }

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] ?? null;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function toMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PdfCloneApp() {
  const [activeGroup, setActiveGroup] = useState<string>("All");
  const [activeToolKey, setActiveToolKey] = useState<ToolKey>("merge");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visibleTools = useMemo(
    () =>
      activeGroup === "All"
        ? TOOLS
        : TOOLS.filter((tool) => tool.group === activeGroup),
    [activeGroup]
  );

  const activeTool = useMemo(
    () => TOOLS.find((tool) => tool.key === activeToolKey) ?? TOOLS[0],
    [activeToolKey]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeTool.status !== "live" || !activeTool.endpoint) {
      setError("This tool is scheduled next. Select a Live tool for now.");
      setMessage(null);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(activeTool.endpoint, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        let errorText = "Could not process this file.";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            errorText = payload.error;
          }
        } catch {
          const fallback = await response.text();
          if (fallback) {
            errorText = fallback;
          }
        }
        throw new Error(errorText);
      }

      const blob = await response.blob();
      const fileNameFromServer = getFileNameFromDisposition(
        response.headers.get("content-disposition")
      );
      const fileName = fileNameFromServer ?? activeTool.fallbackName ?? "output.pdf";
      downloadBlob(blob, fileName);

      const originalBytes = Number(response.headers.get("x-original-bytes"));
      const outputBytes = Number(response.headers.get("x-output-bytes"));

      if (
        activeTool.key === "compress" &&
        Number.isFinite(originalBytes) &&
        Number.isFinite(outputBytes) &&
        originalBytes > 0
      ) {
        const saved = originalBytes - outputBytes;
        const savedPercent = Math.max((saved / originalBytes) * 100, 0);
        setMessage(
          `Done. Downloaded ${fileName}. Size: ${toMB(outputBytes)} from ${toMB(originalBytes)} (${savedPercent.toFixed(1)}% saved).`
        );
      } else {
        setMessage(`Done. Downloaded ${fileName}.`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Upload failed. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 pb-14 pt-5 sm:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.52)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="text-lg font-black tracking-tight text-slate-900">
            PDF Forge Clone
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">MERGE</span>
            <span className="rounded-full bg-slate-50 px-3 py-1">SPLIT</span>
            <span className="rounded-full bg-slate-50 px-3 py-1">COMPRESS</span>
            <span className="rounded-full bg-slate-50 px-3 py-1">CONVERT</span>
            <span className="rounded-full bg-slate-50 px-3 py-1">ALL TOOLS</span>
          </nav>
        </div>

        <h1 className="mt-5 text-center font-display text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Every tool you need to work with PDFs in one place
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          Fast tool switcher with real backend processing. Core workflows are
          fully wired and tested end-to-end for merge, split, optimize, convert,
          edit, and organize actions.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setActiveGroup(group)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                activeGroup === group
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-700"
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleTools.map((tool) => (
            <button
              key={tool.key}
              type="button"
              onClick={() => setActiveToolKey(tool.key)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeTool.key === tool.key
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-slate-900">{tool.title}</div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    tool.status === "live"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {tool.status === "live" ? "Live" : "Soon"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            {activeTool.title}
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {activeTool.group}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{activeTool.description}</p>

        {activeTool.status === "coming-soon" ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This feature needs specialized conversion/OCR engines and is queued
            for the next upgrade pass.
          </div>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {activeTool.key === "merge" && (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  PDF files (2 or more)
                </span>
                <input
                  name="files"
                  type="file"
                  required
                  multiple
                  accept="application/pdf"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                />
              </label>
            )}

            {activeTool.key === "split" && (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">PDF file</span>
                  <input
                    name="file"
                    type="file"
                    required
                    accept="application/pdf"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Ranges to keep
                  </span>
                  <input
                    name="ranges"
                    type="text"
                    required
                    placeholder="1-3,8,10-12"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
              </>
            )}

            {activeTool.key === "compress" && (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">PDF file</span>
                <input
                  name="file"
                  type="file"
                  required
                  accept="application/pdf"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                />
              </label>
            )}

            {activeTool.key === "organize" && (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">PDF file</span>
                  <input
                    name="file"
                    type="file"
                    required
                    accept="application/pdf"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    New page order
                  </span>
                  <input
                    name="order"
                    type="text"
                    required
                    placeholder="Example: 3,1,2,4-5"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
              </>
            )}

            {activeTool.key === "rotate" && (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">PDF file</span>
                  <input
                    name="file"
                    type="file"
                    required
                    accept="application/pdf"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Angle</span>
                  <select
                    name="degrees"
                    defaultValue="90"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  >
                    <option value="90">90 deg</option>
                    <option value="180">180 deg</option>
                    <option value="270">270 deg</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Pages (all or ranges)
                  </span>
                  <input
                    name="ranges"
                    type="text"
                    defaultValue="all"
                    placeholder="all or 1-2,5"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
              </>
            )}

            {activeTool.key === "watermark" && (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">PDF file</span>
                  <input
                    name="file"
                    type="file"
                    required
                    accept="application/pdf"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Watermark text
                  </span>
                  <input
                    name="text"
                    type="text"
                    required
                    defaultValue="CONFIDENTIAL"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Opacity</span>
                    <input
                      name="opacity"
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="0.9"
                      defaultValue="0.2"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Size</span>
                    <input
                      name="fontSize"
                      type="number"
                      min="12"
                      max="200"
                      defaultValue="48"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Angle</span>
                    <input
                      name="angle"
                      type="number"
                      min="-90"
                      max="90"
                      defaultValue="-35"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Pages (all or ranges)
                  </span>
                  <input
                    name="ranges"
                    type="text"
                    defaultValue="all"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
              </>
            )}

            {activeTool.key === "pageNumbers" && (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">PDF file</span>
                  <input
                    name="file"
                    type="file"
                    required
                    accept="application/pdf"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Start At</span>
                    <input
                      name="startAt"
                      type="number"
                      min="0"
                      defaultValue="1"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Size</span>
                    <input
                      name="fontSize"
                      type="number"
                      min="8"
                      max="72"
                      defaultValue="14"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Margin</span>
                    <input
                      name="margin"
                      type="number"
                      min="0"
                      max="150"
                      defaultValue="24"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Position</span>
                  <select
                    name="position"
                    defaultValue="bottom-center"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Pages (all or ranges)
                  </span>
                  <input
                    name="ranges"
                    type="text"
                    defaultValue="all"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
              </>
            )}

            {activeTool.key === "crop" && (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">PDF file</span>
                  <input
                    name="file"
                    type="file"
                    required
                    accept="application/pdf"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Top</span>
                    <input
                      name="marginTop"
                      type="number"
                      min="0"
                      max="500"
                      defaultValue="20"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Right</span>
                    <input
                      name="marginRight"
                      type="number"
                      min="0"
                      max="500"
                      defaultValue="20"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Bottom</span>
                    <input
                      name="marginBottom"
                      type="number"
                      min="0"
                      max="500"
                      defaultValue="20"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Left</span>
                    <input
                      name="marginLeft"
                      type="number"
                      min="0"
                      max="500"
                      defaultValue="20"
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                    />
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Pages (all or ranges)
                  </span>
                  <input
                    name="ranges"
                    type="text"
                    defaultValue="all"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-red-500 focus:ring-2"
                  />
                </label>
              </>
            )}

            {activeTool.key === "jpgToPdf" && (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  JPG or PNG files
                </span>
                <input
                  name="files"
                  type="file"
                  required
                  multiple
                  accept="image/jpeg,image/jpg,image/png"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 inline-flex w-fit items-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Processing..." : activeTool.cta ?? "Run"}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
