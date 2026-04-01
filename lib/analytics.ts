import { db } from "@/lib/db";
import { getClientIp, hashValue } from "@/lib/security";

export async function recordClick(linkId: string, requestHeaders: Headers) {
  const referrer = requestHeaders.get("referer");
  const userAgent = requestHeaders.get("user-agent");
  const ip = getClientIp(
    new Request("http://localhost", {
      headers: requestHeaders
    })
  );

  await db.$transaction([
    db.link.update({
      where: { id: linkId },
      data: {
        clickCount: {
          increment: 1
        }
      }
    }),
    db.clickEvent.create({
      data: {
        linkId,
        referrer,
        userAgent,
        ipHash: ip ? hashValue(ip) : null
      }
    })
  ]);
}
