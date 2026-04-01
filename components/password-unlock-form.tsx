"use client";

import { useState } from "react";

type PasswordUnlockFormProps = {
  shortCode: string;
};

export function PasswordUnlockForm({ shortCode }: PasswordUnlockFormProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/links/${shortCode}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password
        })
      });

      const payload = (await response.json()) as
        | {
            ok: true;
            data: { redirectTo: string };
          }
        | {
            ok: false;
            error: string;
          };

      if (!payload.ok) {
        setError(payload.error);
        return;
      }

      window.location.assign(payload.data.redirectTo);
    } catch {
      setError("Unable to unlock this link right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-ink/10 bg-white p-6 shadow-card sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/55">Password protected</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Enter password to continue</h1>
      <p className="mt-3 text-sm leading-7 text-ink/70">
        This short link is locked by its owner. Enter the password to open the destination URL.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="unlock-password" className="mb-2 block text-sm font-semibold text-ink/70">
            Password
          </label>
          <input
            id="unlock-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-coral"
          />
        </div>

        {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-coral disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Unlocking..." : "Unlock link"}
        </button>
      </form>
    </section>
  );
}
