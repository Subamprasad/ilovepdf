"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { CreateLinkResponse } from "@/lib/types";

type ResultState = Extract<CreateLinkResponse, { ok: true }>["data"] | null;
type FeatureKey = "customAlias" | "password" | "expiration" | "qr";
type FeatureState = Record<FeatureKey, boolean>;

const INITIAL_FEATURES: FeatureState = {
  customAlias: true,
  password: false,
  expiration: false,
  qr: true
};

const FEATURE_OPTIONS: Array<{
  key: FeatureKey;
  code: string;
  label: string;
  description: string;
  color: string;
}> = [
  {
    key: "customAlias",
    code: "CL",
    label: "Custom Link",
    description: "Use your own slug for branded URLs.",
    color: "bg-[#1d4ed8]/20 text-[#1d4ed8]"
  },
  {
    key: "password",
    code: "PP",
    label: "Password Protection",
    description: "Require a password before redirect.",
    color: "bg-[#0f766e]/20 text-[#0f766e]"
  },
  {
    key: "expiration",
    code: "EX",
    label: "Set Expiration",
    description: "Auto-disable this link at a set time.",
    color: "bg-[#6d28d9]/20 text-[#6d28d9]"
  },
  {
    key: "qr",
    code: "QR",
    label: "Generate QR Code",
    description: "Create a downloadable QR instantly.",
    color: "bg-[#b45309]/20 text-[#b45309]"
  }
];

export function CreateLinkForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureState>(INITIAL_FEATURES);
  const [submittedFeatures, setSubmittedFeatures] = useState<FeatureState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const activeFeatureCount = Object.values(selectedFeatures).filter(Boolean).length;
  const showQrInResult = Boolean(result && submittedFeatures?.qr);

  useEffect(() => {
    let isMounted = true;

    async function generateQrCode() {
      if (!showQrInResult || !result) {
        setQrCodeDataUrl(null);
        return;
      }

      const qrCode = await import("qrcode");
      const dataUrl = await qrCode.toDataURL(result.shortUrl, {
        width: 240,
        margin: 1
      });

      if (isMounted) {
        setQrCodeDataUrl(dataUrl);
      }
    }

    void generateQrCode();

    return () => {
      isMounted = false;
    };
  }, [result, showQrInResult]);

  useEffect(() => {
    if (!selectedFeatures.customAlias) {
      setCustomAlias("");
    }

    if (!selectedFeatures.password) {
      setPassword("");
    }

    if (!selectedFeatures.expiration) {
      setExpiresAt("");
    }
  }, [selectedFeatures.customAlias, selectedFeatures.expiration, selectedFeatures.password]);

  function toggleFeature(feature: FeatureKey) {
    setSelectedFeatures((previous) => ({
      ...previous,
      [feature]: !previous[feature]
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originalUrl,
          customAlias: selectedFeatures.customAlias ? customAlias : "",
          password: selectedFeatures.password ? password : "",
          expiresAt: selectedFeatures.expiration ? expiresAt || null : null
        })
      });

      const payload: CreateLinkResponse = await response.json();

      if (!payload.ok) {
        setError(payload.error);
        setResult(null);
        return;
      }

      setResult(payload.data);
      setSubmittedFeatures(selectedFeatures);
      setOriginalUrl("");
      setCustomAlias("");
      setPassword("");
      setExpiresAt("");
    } catch {
      setError("Something went wrong while creating the short link.");
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-[30px] border border-[#1f2c3f]/20 bg-white/95 p-6 shadow-card backdrop-blur-sm sm:p-8"
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#1f2c3f]/10 bg-[#f7fafc] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1f2c3f]">Optional Features</p>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1f2c3f]/55">
                {activeFeatureCount} selected
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {FEATURE_OPTIONS.map((feature) => (
                <button
                  key={feature.key}
                  type="button"
                  onClick={() => toggleFeature(feature.key)}
                  aria-pressed={selectedFeatures[feature.key]}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedFeatures[feature.key]
                      ? "border-[#1f2c3f]/30 bg-white shadow-sm"
                      : "border-[#1f2c3f]/10 bg-transparent hover:border-[#1f2c3f]/25 hover:bg-white/75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${feature.color}`}>
                        {feature.code}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#1f2c3f]">{feature.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[#1f2c3f]/65">{feature.description}</p>
                    </div>
                    <div
                      className={`mt-1 h-5 w-5 rounded-full border ${
                        selectedFeatures[feature.key]
                          ? "border-[#1f2c3f] bg-[#1f2c3f]"
                          : "border-[#1f2c3f]/30 bg-transparent"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="originalUrl" className="mb-2 block text-sm font-semibold text-ink/70">
              Long URL
            </label>
            <input
              id="originalUrl"
              type="url"
              required
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=abc123"
              className="w-full rounded-2xl border border-ink/15 bg-sand px-4 py-4 text-base text-ink outline-none transition focus:border-coral"
            />
          </div>

          {selectedFeatures.customAlias ? (
            <div>
              <label htmlFor="customAlias" className="mb-2 block text-sm font-semibold text-ink/70">
                Custom alias
              </label>
              <input
                id="customAlias"
                type="text"
                value={customAlias}
                onChange={(event) => setCustomAlias(event.target.value)}
                placeholder="summer-launch"
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral"
              />
            </div>
          ) : null}

          {selectedFeatures.password ? (
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink/70">
                Link password
              </label>
              <input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral"
              />
            </div>
          ) : null}

          {selectedFeatures.expiration ? (
            <div>
              <label htmlFor="expiresAt" className="mb-2 block text-sm font-semibold text-ink/70">
                Expiration date
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral"
              />
            </div>
          ) : null}

          <div className="rounded-2xl border border-ink/10 bg-[#f7fafc] px-4 py-3 text-xs text-[#1f2c3f]/70">
            Live setup:{" "}
            {selectedFeatures.customAlias && customAlias.trim() ? `/${customAlias.trim()}` : "auto code"} |{" "}
            {selectedFeatures.password ? "password on" : "password off"} |{" "}
            {selectedFeatures.expiration ? "expiration on" : "expiration off"} |{" "}
            {selectedFeatures.qr ? "QR on" : "QR off"}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1f2c3f] px-5 py-4 text-base font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Shorten URL"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-ink">{error}</div>
      ) : null}

      {result ? (
        <section className="rounded-[28px] border border-pine/15 bg-pine p-6 text-white shadow-card sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">Your short link is ready</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="rounded-full bg-white/15 px-3 py-1 text-white/80">
              {result.passwordProtected ? "Password protected" : "No password"}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-white/80">
              {result.expiresAt ? `Expires ${new Date(result.expiresAt).toLocaleString()}` : "No expiration"}
            </span>
          </div>
          <div className="mt-4 grid gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Short URL</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all text-lg font-semibold">{result.shortUrl}</span>
                <button
                  type="button"
                  onClick={() => copyText(result.shortUrl)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-pine transition hover:bg-sand"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Manage URL</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all text-sm font-medium">{result.manageUrl}</span>
                <button
                  type="button"
                  onClick={() => copyText(result.manageUrl)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-pine transition hover:bg-sand"
                >
                  Copy
                </button>
              </div>
              <p className="mt-3 text-sm text-white/70">
                Save this private manage link now. It is the only way to edit or disable the short URL later.
              </p>
            </div>

            {submittedFeatures?.qr ? (
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">QR Code</p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-xl bg-white p-2">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt="QR code for short URL"
                        width={160}
                        height={160}
                        unoptimized
                      />
                    ) : (
                      <div className="h-40 w-40 animate-pulse rounded-lg bg-sand/70" />
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-white/80">Scan or share this QR for quick access.</p>
                    {qrCodeDataUrl ? (
                      <a
                        href={qrCodeDataUrl}
                        download={`${result.shortCode}-qr.png`}
                        className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-pine transition hover:bg-sand"
                      >
                        Download PNG
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
