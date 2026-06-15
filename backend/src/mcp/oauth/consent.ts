/**
 * Backend-rendered consent surface for the OAuth /authorize step.
 *
 * Because Orcha's session cookie is httpOnly, the backend is the only party that
 * can read login state — so the minimal approve/deny consent is rendered here, not
 * in the SPA. The decision posts SAME-ORIGIN so the session cookie rides along even
 * under the dev `sameSite: "lax"` policy (a cross-site frontend POST would drop it).
 * The polished React consent UI is a later slice (#80); this is the tracer.
 *
 * Exports:
 *  - renderConsent(params): the minimal HTML page (pure; no I/O).
 *  - ConsentParams: its inputs.
 */

export interface ConsentParams {
  clientName: string;
  organizationName: string;
  roleName: string;
  requestToken: string; // opaque handle to the pending authorize request
  decisionPath: string; // same-origin POST target
}

// Minimal HTML-escape for the few interpolated, possibly client-supplied values.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderConsent(params: ConsentParams): string {
  const client = escapeHtml(params.clientName);
  const org = escapeHtml(params.organizationName);
  const role = escapeHtml(params.roleName);
  const token = escapeHtml(params.requestToken);
  const action = escapeHtml(params.decisionPath);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Authorize ${client}</title></head>
<body>
  <h1>${client} wants to access your Orcha workspace</h1>
  <p>Acting as <strong>${role}</strong> in <strong>${org}</strong> (read + write).</p>
  <form method="post" action="${action}">
    <input type="hidden" name="request" value="${token}">
    <button type="submit" name="decision" value="approve">Approve</button>
    <button type="submit" name="decision" value="deny">Deny</button>
  </form>
</body></html>`;
}
