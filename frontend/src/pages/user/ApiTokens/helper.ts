/**
 * Display helpers for the Personal Access Token UI.
 *
 * Exports:
 *  - TokenStatus / tokenStatus: the active | expired | revoked state machine
 *    that drives the status badge in the token list.
 *  - EXPIRY_OPTIONS: the never / 30 / 90 / 365-day choices for the create form,
 *    each carrying the `expiresInDays` value the createApiToken mutation wants
 *    (null = never expires = omit the argument).
 */

import { PersonalAccessToken } from "types/graphql";

export type TokenStatus = "active" | "expired" | "revoked";

// Revocation is a deliberate, terminal action, so it takes precedence over a
// passive expiry — a revoked token reads as "revoked" even if also past expiry.
export function tokenStatus(
  token: Pick<PersonalAccessToken, "revokedAt" | "expiresAt">,
  now: Date = new Date()
): TokenStatus {
  if (token.revokedAt) {
    return "revoked";
  }
  if (token.expiresAt && new Date(token.expiresAt) <= now) {
    return "expired";
  }
  return "active";
}

export interface ExpiryOption {
  label: string;
  // null means "never expires" — the createApiToken mutation receives no
  // expiresInDays and persists a null expiresAt.
  days: number | null;
}

export const EXPIRY_OPTIONS: ExpiryOption[] = [
  { label: "Never", days: null },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "365 days", days: 365 },
];
