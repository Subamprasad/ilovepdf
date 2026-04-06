function isPrivateIPv4(hostname: string) {
  if (/^127\./.test(hostname)) {
    return true;
  }
  if (/^10\./.test(hostname)) {
    return true;
  }
  if (/^192\.168\./.test(hostname)) {
    return true;
  }

  const match172 = hostname.match(/^172\.(\d+)\./);
  if (match172?.[1]) {
    const second = Number(match172[1]);
    return second >= 16 && second <= 31;
  }

  return false;
}

export function assertSafeExternalUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Please provide a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "::1" ||
    hostname === "0.0.0.0" ||
    isPrivateIPv4(hostname)
  ) {
    throw new Error("Local/private URLs are not allowed.");
  }

  return parsed.toString();
}
