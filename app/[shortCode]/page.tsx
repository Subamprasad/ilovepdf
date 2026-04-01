import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { PasswordUnlockForm } from "@/components/password-unlock-form";
import { recordClick } from "@/lib/analytics";
import { db } from "@/lib/db";

type RedirectPageProps = {
  params: Promise<{
    shortCode: string;
  }>;
};

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = await params;
  const link = await db.link.findUnique({
    where: {
      shortCode
    }
  });

  if (!link || !link.isActive) {
    notFound();
  }

  if (link.expiresAt && link.expiresAt <= new Date()) {
    notFound();
  }

  if (link.passwordHash) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-12">
        <PasswordUnlockForm shortCode={shortCode} />
      </main>
    );
  }

  const requestHeaders = await headers();
  await recordClick(link.id, requestHeaders);

  redirect(link.originalUrl as never);
}
