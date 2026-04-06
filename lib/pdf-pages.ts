export function parsePageSelection(
  input: string,
  pageCount: number,
  options?: { dedupe?: boolean }
): number[] {
  const raw = input.replace(/\s+/g, "");
  const dedupe = options?.dedupe ?? true;

  if (!raw) {
    throw new Error("Page ranges cannot be empty.");
  }

  const selectedPages: number[] = [];
  const seen = dedupe ? new Set<number>() : null;

  for (const token of raw.split(",")) {
    if (!token) {
      continue;
    }

    const [startText, endText] = token.split("-");
    const start = Number(startText);
    const end = endText ? Number(endText) : start;

    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error(`Invalid range token "${token}".`);
    }

    const from = Math.min(start, end);
    const to = Math.max(start, end);

    if (from < 1 || to > pageCount) {
      throw new Error(`Range "${token}" is outside 1-${pageCount}.`);
    }

    for (let pageNumber = from; pageNumber <= to; pageNumber += 1) {
      if (!seen || !seen.has(pageNumber)) {
        seen?.add(pageNumber);
        selectedPages.push(pageNumber);
      }
    }
  }

  if (selectedPages.length === 0) {
    throw new Error("No valid pages were selected.");
  }

  return selectedPages;
}
