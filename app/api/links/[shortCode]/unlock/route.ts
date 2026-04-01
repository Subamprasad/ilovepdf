import { NextResponse } from "next/server";

import { recordClick } from "@/lib/analytics";
import { db } from "@/lib/db";
import { assertRateLimit } from "@/lib/rate-limit";
import { getClientIp, hashValue } from "@/lib/security";

type UnlockRouteProps = {
  params: Promise<{
    shortCode: string;
  }>;
};

export async function POST(request: Request, context: UnlockRouteProps) {
  try {
    const { shortCode } = await context.params;
    const ip = getClientIp(request) ?? "anonymous";
    assertRateLimit(`unlock:${shortCode}:${ip}`);

    const link = await db.link.findUnique({
      where: {
        shortCode
      },
      select: {
        id: true,
        originalUrl: true,
        isActive: true,
        expiresAt: true,
        passwordHash: true
      }
    });

    if (!link || !link.isActive) {
      return NextResponse.json({ ok: false, error: "Short link not found." }, { status: 404 });
    }

    if (link.expiresAt && link.expiresAt <= new Date()) {
      return NextResponse.json({ ok: false, error: "This short link has expired." }, { status: 410 });
    }

    if (link.passwordHash) {
      const body = (await request.json()) as { password?: string };
      const password = body.password?.trim();

      if (!password) {
        return NextResponse.json({ ok: false, error: "Password is required." }, { status: 400 });
      }

      if (hashValue(password) !== link.passwordHash) {
        return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
      }
    }

    await recordClick(link.id, request.headers);

    return NextResponse.json({
      ok: true,
      data: {
        redirectTo: link.originalUrl
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to unlock this link." }, { status: 500 });
  }
}
