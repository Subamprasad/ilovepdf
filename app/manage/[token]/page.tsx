import { notFound } from "next/navigation";

import { ManageLinkForm } from "@/components/manage-link-form";
import { db } from "@/lib/db";
import { buildShortUrl } from "@/lib/urls";
import { hashValue } from "@/lib/security";

type ManagePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ManagePage({ params }: ManagePageProps) {
  const { token } = await params;
  const link = await db.link.findUnique({
    where: {
      manageTokenHash: hashValue(token)
    }
  });

  if (!link) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 sm:px-8 lg:px-10">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/50">Manage short link</p>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Update where your short URL goes.</h1>
        <p className="max-w-2xl text-base leading-7 text-ink/70">
          This private page is your control center for the link. Keep the manage URL safe because it works
          like ownership for anonymous links.
        </p>
      </div>

      <ManageLinkForm
        manageToken={token}
        initialOriginalUrl={link.originalUrl}
        shortUrl={buildShortUrl(link.shortCode)}
        clickCount={link.clickCount}
        createdAt={link.createdAt.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })}
        isActive={link.isActive}
        hasPassword={Boolean(link.passwordHash)}
        initialExpiresAt={link.expiresAt ? link.expiresAt.toISOString().slice(0, 16) : ""}
      />
    </main>
  );
}
