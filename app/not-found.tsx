import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-full border border-slate-900/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Page not found
      </div>
      <h1 className="mt-6 font-display text-5xl text-slate-900">This dashboard route does not exist.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
        The requested page could not be found. Return to the finance dashboard to continue exploring your data.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
