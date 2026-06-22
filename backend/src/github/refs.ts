// Parses Ticket refs out of free text (a PR's head branch name and title).
//
// A Ticket ref is `PRODUCT-localId` (e.g. BUGS-1) — the product code that
// self-routes the ref to a product, plus the ticket's per-product localId. See
// CONTEXT.md (Ticket ref) and ADR 0011.
//
// Parsing is intentionally loose: we extract every plausible candidate and let
// resolution (against the bound org's products/tickets) decide which are real.
// A candidate is a word-boundary-anchored run starting with a letter, then
// letters/digits, a hyphen, and a run of digits. The product code is kept
// verbatim — resolution matches it case-insensitively.

export interface TicketRefMatch {
  productCode: string;
  localId: number;
}

const TICKET_REF_PATTERN = /\b([A-Za-z][A-Za-z0-9]*)-(\d+)\b/g;

export function parseTicketRefs(text: string | null | undefined): TicketRefMatch[] {
  if (!text) {
    return [];
  }

  const matches: TicketRefMatch[] = [];
  // Dedupe candidates that appear in both the branch and title (or twice in
  // one). Keys are case-insensitive on the product code so `bugs-1` and
  // `BUGS-1` collapse to one resolution attempt.
  const seen = new Set<string>();

  for (const match of text.matchAll(TICKET_REF_PATTERN)) {
    const productCode = match[1];
    const localId = parseInt(match[2], 10);
    const key = `${productCode.toUpperCase()}-${localId}`;

    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    matches.push({ productCode, localId });
  }

  return matches;
}
