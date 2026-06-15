/**
 * Open-redirect guard for the OAuth login handoff.
 *
 * After login, the user may need to bounce back to the backend's /oauth/consent
 * (a DIFFERENT origin from this SPA), so we must do a full-page navigation to an
 * absolute URL — which makes validating it essential. Only an absolute URL on the
 * configured API origin whose path is exactly /oauth/consent is allowed; anything
 * else returns null and the normal in-app redirect is used.
 *
 * Exports: resolveReturnTo(search, apiOrigin) -> safe absolute URL | null.
 */
export function resolveReturnTo(
  search: string,
  apiOrigin: string,
): string | null {
  const raw = new URLSearchParams(search).get("returnTo");
  if (!raw) return null;
  let candidate: URL;
  let api: URL;
  try {
    candidate = new URL(raw);
    api = new URL(apiOrigin);
  } catch {
    return null;
  }
  if (candidate.origin !== api.origin) return null;
  if (candidate.pathname !== "/oauth/consent") return null;
  return candidate.toString();
}
