"use client";

import { useState } from "react";

type ManageLinkFormProps = {
  manageToken: string;
  initialOriginalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  isActive: boolean;
  hasPassword: boolean;
  initialExpiresAt: string;
};

export function ManageLinkForm({
  manageToken,
  initialOriginalUrl,
  shortUrl,
  clickCount,
  createdAt,
  isActive,
  hasPassword,
  initialExpiresAt
}: ManageLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState(initialOriginalUrl);
  const [active, setActive] = useState(isActive);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [newPassword, setNewPassword] = useState("");
  const [removePassword, setRemovePassword] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(hasPassword);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveChanges() {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/manage/${manageToken}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originalUrl,
          isActive: active,
          expiresAt: expiresAt || null,
          password: newPassword || undefined,
          clearPassword: removePassword
        })
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!payload.ok) {
        setError(payload.error ?? "Unable to save your changes.");
        return;
      }

      setMessage("Changes saved.");
      if (removePassword) {
        setPasswordEnabled(false);
      } else if (newPassword.trim()) {
        setPasswordEnabled(true);
      }
      setRemovePassword(false);
      setNewPassword("");
    } catch {
      setError("Unable to save your changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLink() {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/manage/${manageToken}`, {
        method: "DELETE"
      });

      const payload = (await response.json()) as { ok: boolean; error?: string };

      if (!payload.ok) {
        setError(payload.error ?? "Unable to delete this short link.");
        return;
      }

      setMessage("Short link deleted.");
      setActive(false);
    } catch {
      setError("Unable to delete this short link.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[28px] border border-ink/10 bg-white p-6 shadow-card sm:p-8">
      <div className="grid gap-4 rounded-2xl bg-sand p-5 text-sm text-ink/80 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Short URL</p>
          <p className="mt-2 break-all font-semibold text-ink">{shortUrl}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Clicks</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{clickCount}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Created</p>
          <p className="mt-2 font-semibold text-ink">{createdAt}</p>
        </div>
      </div>

      <div>
        <label htmlFor="manage-original-url" className="mb-2 block text-sm font-semibold text-ink/70">
          Destination URL
        </label>
        <input
          id="manage-original-url"
          type="url"
          value={originalUrl}
          onChange={(event) => setOriginalUrl(event.target.value)}
          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-4 text-base text-ink outline-none transition focus:border-coral"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-4 text-sm text-ink">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 rounded border-ink/20 text-coral focus:ring-coral"
        />
        Keep this short link active
      </label>

      <div>
        <label htmlFor="manage-expires-at" className="mb-2 block text-sm font-semibold text-ink/70">
          Expiration date (optional)
        </label>
        <input
          id="manage-expires-at"
          type="datetime-local"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-4 text-base text-ink outline-none transition focus:border-coral"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-ink/10 px-4 py-4">
        <p className="text-sm font-semibold text-ink">
          Password protection: <span className="text-ink/70">{passwordEnabled ? "Enabled" : "Disabled"}</span>
        </p>
        <label htmlFor="manage-password" className="block text-sm font-semibold text-ink/70">
          Set new password (optional)
        </label>
        <input
          id="manage-password"
          type="password"
          minLength={6}
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            if (event.target.value.trim()) {
              setRemovePassword(false);
            }
          }}
          placeholder="Leave empty to keep current setting"
          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral"
        />
        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={removePassword}
            onChange={(event) => {
              setRemovePassword(event.target.checked);
              if (event.target.checked) {
                setNewPassword("");
              }
            }}
            className="h-4 w-4 rounded border-ink/20 text-coral focus:ring-coral"
          />
          Remove password protection
        </label>
      </div>

      {message ? <p className="rounded-2xl bg-pine/10 px-4 py-3 text-sm text-pine">{message}</p> : null}
      {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isSaving}
          onClick={saveChanges}
          className="inline-flex items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={deleteLink}
          className="inline-flex items-center justify-center rounded-2xl border border-coral/30 px-5 py-3 text-sm font-semibold text-coral transition hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Delete short link
        </button>
      </div>
    </div>
  );
}
