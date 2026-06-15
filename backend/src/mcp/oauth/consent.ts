/**
 * Backend-rendered consent surface for the OAuth /authorize step.
 *
 * Because Orcha's session cookie is httpOnly, the backend is the only party that
 * can read login state — so consent is rendered here, not in the SPA. The decision
 * posts SAME-ORIGIN so the session cookie rides along even under the dev
 * `sameSite: "lax"` policy (a cross-site frontend POST would drop it). Keeping it
 * here also means a self-hoster gets the whole flow with no extra frontend build.
 *
 * The page lets the user confirm three things before approving: WHO is asking
 * (the client), which Role/organization the connection acts as (a `<select>` when
 * they hold more than one), and how much access it gets (read vs read+write — the
 * scopes made real in #79, offered bounded by what the client requested).
 *
 * Styling is a self-contained inline stylesheet that evokes the app's auth
 * screens (Inter, the `brand` blue, a centered card) — a backend page can't pull
 * the SPA's Tailwind bundle, and one file with no asset dependency is the lowest-
 * entropy way to stay on-brand.
 *
 * Exports:
 *  - renderConsent(params): the consent HTML page (pure; no I/O).
 *  - ConsentParams, ConsentRoleOption, ConsentScopeChoice: its inputs.
 *  - scopeLabel(scope): the human label for a canonical scope (the view's vocabulary).
 */

import { SCOPE_READ_WRITE } from "./scopes";

// One Role the connection could act as. `value` is the roleId posted back.
export interface ConsentRoleOption {
  value: number;
  label: string; // "<organization> / <role>"
  selected: boolean;
}

// One access level the user may grant. `value` is the canonical scope string.
export interface ConsentScopeChoice {
  value: string; // "read" | "read write"
  label: string;
  selected: boolean;
}

export interface ConsentParams {
  clientName: string;
  roles: ConsentRoleOption[]; // always ≥ 1; a single role renders as static text
  scopeChoices: ConsentScopeChoice[]; // 1 (read-only request) or 2
  requestToken: string; // opaque handle to the pending authorize request
  decisionPath: string; // same-origin POST target
}

// The human label for a canonical scope. Lives in the view, not scopes.ts, so the
// domain module stays free of presentation strings.
export function scopeLabel(scope: string): string {
  return scope === SCOPE_READ_WRITE ? "Read + write" : "Read only";
}

// Minimal HTML-escape for the few interpolated, possibly client-supplied values.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The Role control: a real chooser only when there's a real choice. A single role
// renders as static text plus a hidden input, so the POST always carries a roleId
// without offering a decision that isn't one.
function renderRoleField(roles: ConsentRoleOption[]): string {
  if (roles.length === 1) {
    const only = roles[0];
    return `<input type="hidden" name="roleId" value="${only.value}">
      <p class="role-static">Acting as <strong>${escapeHtml(only.label)}</strong></p>`;
  }
  const options = roles
    .map(
      (r) =>
        `<option value="${r.value}"${r.selected ? " selected" : ""}>${escapeHtml(
          r.label,
        )}</option>`,
    )
    .join("");
  return `<label class="field-label" for="roleId">Act as</label>
      <select id="roleId" name="roleId" class="select">${options}</select>`;
}

// The access-level control: one radio per offered scope, the requested one checked.
function renderScopeField(choices: ConsentScopeChoice[]): string {
  const radios = choices
    .map(
      (c, i) =>
        `<label class="radio"><input type="radio" name="scope" value="${escapeHtml(
          c.value,
        )}"${c.selected || (choices.length === 1 && i === 0) ? " checked" : ""}> ${escapeHtml(
          c.label,
        )}</label>`,
    )
    .join("");
  return `<span class="field-label">Access</span>
      <div class="radios">${radios}</div>`;
}

export function renderConsent(params: ConsentParams): string {
  const client = escapeHtml(params.clientName);
  const token = escapeHtml(params.requestToken);
  const action = escapeHtml(params.decisionPath);
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorize ${client}</title>
  <style>
    :root { --brand: #48ADF4; --brand-700: #0B76C1; --ink: #334155; --muted: #64748b; --line: #e2e8f0; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #f8fafc; color: var(--ink);
      font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    .card { width: 100%; max-width: 26rem; margin: 1.5rem; background: #fff; border: 1px solid var(--line);
      border-radius: 0.75rem; box-shadow: 0 10px 25px -10px rgba(15,23,42,0.25); padding: 2rem; }
    .brand { font-family: "Comfortaa", system-ui, sans-serif; font-weight: 700; color: var(--brand);
      letter-spacing: -0.01em; margin: 0 0 1.25rem; }
    h1 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; margin: 0 0 0.25rem; }
    .lede { color: var(--muted); margin: 0 0 1.5rem; font-size: 0.95rem; }
    .field { margin-bottom: 1.25rem; }
    .field-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 0.4rem; }
    .role-static { margin: 0; font-size: 0.95rem; }
    .select { width: 100%; padding: 0.55rem 0.65rem; border: 1px solid var(--line); border-radius: 0.5rem;
      font: inherit; color: var(--ink); background: #fff; }
    .radios { display: flex; flex-direction: column; gap: 0.5rem; }
    .radio { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; cursor: pointer; }
    .actions { display: flex; gap: 0.75rem; margin-top: 1.75rem; }
    button { flex: 1; padding: 0.6rem 1rem; border-radius: 0.5rem; font: inherit; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; }
    .approve { background: var(--brand); color: #fff; }
    .approve:hover { background: var(--brand-700); }
    .deny { background: #fff; color: var(--ink); border-color: var(--line); }
    .deny:hover { background: #f1f5f9; }
  </style>
</head>
<body>
  <main class="card">
    <p class="brand">Orcha</p>
    <h1>${client} wants to access your Orcha workspace</h1>
    <p class="lede">Approve to let it act on your behalf with the access you choose below.</p>
    <form method="post" action="${action}">
      <input type="hidden" name="request" value="${token}">
      <div class="field">${renderRoleField(params.roles)}</div>
      <div class="field">${renderScopeField(params.scopeChoices)}</div>
      <div class="actions">
        <button class="approve" type="submit" name="decision" value="approve">Approve</button>
        <button class="deny" type="submit" name="decision" value="deny">Deny</button>
      </div>
    </form>
  </main>
</body></html>`;
}
