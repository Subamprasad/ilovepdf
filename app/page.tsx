import { CreateLinkForm } from "@/components/create-link-form";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
      <section className="grid flex-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink/60 shadow-sm">
            Anonymous link shortener
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
              Short links without the account drama.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              Paste any long URL, get a compact short link, and manage it later with a private secret URL.
              No signup, no dashboard, no friction.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-sm">
              <div className="inline-flex rounded-xl bg-[#1d4ed8]/15 p-3 text-[#1d4ed8]">
                <span aria-hidden className="text-xs font-bold tracking-wider">CL</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">Custom Link</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Pick your own alias so branded links stay clean, memorable, and easy to share.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-sm">
              <div className="inline-flex rounded-xl bg-[#0f766e]/15 p-3 text-[#0f766e]">
                <span aria-hidden className="text-xs font-bold tracking-wider">PP</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">Password Protection</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Lock sensitive links with a password so only intended viewers can access them.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-sm">
              <div className="inline-flex rounded-xl bg-[#7e22ce]/15 p-3 text-[#7e22ce]">
                <span aria-hidden className="text-xs font-bold tracking-wider">EX</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">Set Expiration</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Configure automatic expiry for campaign links, temporary offers, or private drops.
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-sm">
              <div className="inline-flex rounded-xl bg-[#b45309]/15 p-3 text-[#b45309]">
                <span aria-hidden className="text-xs font-bold tracking-wider">QR</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink">Generate QR Code</p>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Every short URL now includes a downloadable QR code for print, posters, and packaging.
              </p>
            </div>
          </div>
        </div>

        <CreateLinkForm />
      </section>
    </main>
  );
}
