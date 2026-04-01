import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { assertRateLimit } from "@/lib/rate-limit";
import {
  buildManageUrl,
  buildShortUrl,
  generateManageToken,
  generateShortCode,
  normalizeAlias,
  normalizeExpiresAt,
  normalizePassword,
  normalizeUrl
} from "@/lib/urls";
import { getClientIp, hashValue } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request) ?? "anonymous";
    assertRateLimit(`create:${ip}`);

    const body = (await request.json()) as {
      originalUrl?: string;
      customAlias?: string;
      password?: string;
      expiresAt?: string | null;
    };

    if (!body.originalUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "A destination URL is required."
        },
        { status: 400 }
      );
    }

    const originalUrl = normalizeUrl(body.originalUrl);
    const customAlias = body.customAlias ? normalizeAlias(body.customAlias) : null;
    const password = body.password ? normalizePassword(body.password) : null;
    const expiresAt = normalizeExpiresAt(body.expiresAt);
    const shortCode = customAlias ?? generateShortCode();
    const manageToken = generateManageToken();

    const createdLink = await db.link.create({
      data: {
        originalUrl,
        customAlias,
        shortCode,
        passwordHash: password ? hashValue(password) : null,
        expiresAt,
        manageTokenHash: hashValue(manageToken)
      }
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: createdLink.id,
        originalUrl: createdLink.originalUrl,
        shortCode: createdLink.shortCode,
        shortUrl: buildShortUrl(createdLink.shortCode),
        manageUrl: buildManageUrl(manageToken),
        expiresAt: createdLink.expiresAt?.toISOString() ?? null,
        passwordProtected: Boolean(createdLink.passwordHash),
        createdAt: createdLink.createdAt.toISOString()
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          error: "That alias is already taken. Try another one."
        },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create a short link right now."
      },
      { status: 500 }
    );
  }
}
