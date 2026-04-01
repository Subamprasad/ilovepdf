import { CreateLinkForm } from "@/components/create-link-form";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10 sm:px-8">
      <section className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <p className="inline-flex items-center rounded-full border border-[#1f2c3f]/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1f2c3f]/70 shadow-sm">
            LinkNova Pro
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-[#1f2c3f] sm:text-5xl">
            Smart URL Shortener
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#1f2c3f]/70 sm:text-base">
            Enable only the options you need. Password lock, expiration scheduling, and instant QR export all work in
            real time.
          </p>
        </div>
        <CreateLinkForm />
      </section>
    </main>
  );
}
