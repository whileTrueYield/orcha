/**
 * The OAuth scope vocabulary for the Orcha MCP authorization server, and the one
 * mapping every grant path shares: a granted scope → the read-only capability the
 * `resolveRole` seam already enforces.
 *
 * Two scopes, deliberately minimal:
 *  - `read`  — read tools only.
 *  - `write` — write/transition tools; implies `read`.
 *
 * `write` without `read` is meaningless (you cannot write a ticket you cannot
 * read), so the only canonical granted scopes are `read` or `read write`. Keeping
 * the vocabulary AND the read-only derivation here means no grant path re-derives
 * "a token without write is read-only": the provider (authorize), the token mint,
 * and discovery all speak through this one module, so scope and capability can
 * never drift.
 *
 * Exports:
 *  - SUPPORTED_SCOPES: advertised in AS metadata (`scopes_supported`).
 *  - grantedScopeFromRequest(requested): the canonical scope an authorize request
 *    is granted (defaults to full read+write when none is requested).
 *  - isReadOnlyScope(scope): the single scope → `readOnly` mapping the mint paths
 *    use, uniform with the PAT `readOnly` flag.
 *  - offeredScopes(requestedScope): the canonical scopes the consent screen may
 *    let a user pick — bounded by the request, since consent narrows, never widens.
 *  - isGrantableScope(chosen, requestedScope): whether a chosen scope is one the
 *    request actually offered (the decision-route guard against a widened grant).
 */

export const READ_SCOPE = "read";
export const WRITE_SCOPE = "write";

// Canonical granted-scope strings. `write` always implies `read`.
export const SCOPE_READ = READ_SCOPE;
export const SCOPE_READ_WRITE = `${READ_SCOPE} ${WRITE_SCOPE}`;

// Advertised in AS discovery metadata; order is the canonical read-before-write.
export const SUPPORTED_SCOPES = [READ_SCOPE, WRITE_SCOPE];

/**
 * The canonical scope an authorize request is granted.
 *
 * A request that asks for `write` (with or without `read`) is granted full
 * read+write; anything else is granted read-only. A request with no scope at all
 * defaults to full read+write — preserving the pre-scope connect behavior and
 * matching what the consent screen will pre-select. The slice that lets a user
 * *narrow* the grant in the consent UI is the next one (#80); this slice only
 * makes the dimension real and enforced.
 */
export function grantedScopeFromRequest(requested?: string[]): string {
  if (!requested || requested.length === 0) return SCOPE_READ_WRITE;
  return requested.includes(WRITE_SCOPE) ? SCOPE_READ_WRITE : SCOPE_READ;
}

/**
 * The single scope → capability mapping: a granted scope without `write` resolves
 * read-only, onto the same `readOnly` flag a read-only PAT carries — so the
 * existing write-tool refusal (`writeAs`) enforces it with no new per-tool logic.
 */
export function isReadOnlyScope(scope: string): boolean {
  return !scope.split(" ").includes(WRITE_SCOPE);
}

/**
 * The canonical scopes the consent screen offers, bounded by what the client
 * requested: `read` is always offered, `read write` only when the request
 * included write — consent can narrow a grant but never widen it past the ask.
 */
export function offeredScopes(requestedScope: string): string[] {
  return isReadOnlyScope(requestedScope)
    ? [SCOPE_READ]
    : [SCOPE_READ, SCOPE_READ_WRITE];
}

/**
 * Whether a user-chosen scope is one the request actually offered — the
 * decision-route guard that rejects a forged/widened grant. Defined as
 * membership in `offeredScopes`, so the offer and the check can never disagree.
 */
export function isGrantableScope(
  chosen: string,
  requestedScope: string,
): boolean {
  return offeredScopes(requestedScope).includes(chosen);
}
