/**
 * bodyDraftStorage — best-effort localStorage persistence for in-progress
 * document-body edits, so navigating away mid-edit and coming back doesn't lose
 * work. There is no backend draft; this is purely a client-side convenience.
 *
 * Each draft carries the `baseVersion` it was written against. On restore the
 * caller reseeds both the markdown AND that baseVersion, so the existing
 * optimistic-concurrency save (#40) still detects when the server moved on in
 * the meantime and routes it through the normal conflict flow instead of
 * silently clobbering newer content.
 *
 * Storage is best-effort by design: Safari private mode and quota exhaustion
 * make localStorage throw, and a failed draft cache must never take down the
 * editor. Reads degrade to "no draft"; writes and clears degrade to no-ops.
 *
 * Exports: BodyDraft, readBodyDraft, writeBodyDraft, clearBodyDraft.
 */
import { DocumentBodyType } from "types/graphql";

export interface BodyDraft {
  markdown: string;
  baseVersion: number;
}

const keyFor = (documentType: DocumentBodyType, documentId: number): string =>
  `orcha:body-draft:${documentType}:${documentId}`;

export function readBodyDraft(
  documentType: DocumentBodyType,
  documentId: number,
): BodyDraft | null {
  try {
    const raw = localStorage.getItem(keyFor(documentType, documentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BodyDraft>;
    // A malformed entry (hand-edited storage, older shape) is treated as no
    // draft rather than trusted — restoring a bad baseVersion would corrupt
    // the conflict accounting on the next save.
    if (
      typeof parsed.markdown !== "string" ||
      typeof parsed.baseVersion !== "number"
    ) {
      return null;
    }
    return { markdown: parsed.markdown, baseVersion: parsed.baseVersion };
  } catch {
    return null;
  }
}

export function writeBodyDraft(
  documentType: DocumentBodyType,
  documentId: number,
  draft: BodyDraft,
): void {
  try {
    localStorage.setItem(keyFor(documentType, documentId), JSON.stringify(draft));
  } catch {
    // Best-effort cache: see module header. Losing a draft write is acceptable;
    // crashing the editor over it is not.
  }
}

export function clearBodyDraft(
  documentType: DocumentBodyType,
  documentId: number,
): void {
  try {
    localStorage.removeItem(keyFor(documentType, documentId));
  } catch {
    // Best-effort cache: see module header.
  }
}
