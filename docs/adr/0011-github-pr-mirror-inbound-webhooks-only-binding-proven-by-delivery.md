# GitHub PR mirror: inbound webhooks only, no App in v1, binding proven by a verified delivery

We are adding a **read-only mirror** of GitHub pull requests onto Tickets: a PR
whose head branch or title contains a Ticket's **Ticket ref** (`PRODUCT-localId`,
e.g. `BUGS-1`) is surfaced under that Ticket in a new **Changes** tab. GitHub
never drives Orcha state in v1 — no status transitions, no logged work, no
write-back. The mirror only reflects what already happened on GitHub.

The load-bearing decision is the **ingestion model**. A GitHub App is the
"proper" integration (it grants both webhooks and API access in one install, and
is the eventual home for backfill and write-back), and **an App phase is on the
roadmap**. We are nonetheless building v1 on **inbound webhooks only**, with *no*
GitHub API calls and no App:

- A **Repository link** binds one repo (`owner/name`) to exactly one
  Organization. It is created **pending**, and Orcha hands back a per-link
  webhook URL (`/github/webhook/:token`, opaque random token) plus an HMAC
  secret.
- The link becomes **active only when a valid signed webhook delivery arrives** —
  the repo full-name is read from the *verified* payload, not from what the user
  typed. Because installing a webhook requires repo-admin rights, a verified
  delivery **is** proof of control.
- **Only an active link reserves a repo** globally (`activeRepoFullName String?
  @unique` — null while pending, so Postgres nulls don't collide and unlimited
  pending links per repo are fine; set inside a transaction that checks no active
  link already holds it).
- Incoming `pull_request` events (`opened, edited, reopened, closed,
  ready_for_review, converted_to_draft`; `ping` triggers activation) are
  HMAC-verified, then the link set for the PR is **re-derived** from the current
  branch + title and reconciled against the Ticket refs that resolve *within the
  bound org*. State mirrored: `OPEN | MERGED | CLOSED` + `isDraft`.

The webhook secret is stored encrypted with **AES-256-GCM** via a new generic
`crypto.ts` primitive (32-byte key from `ORCHA_ENCRYPTION_KEY`, per-record
nonce) — the codebase's first encryption-at-rest, deliberately built generic
because the App phase will reuse it for installation tokens.

## Why

- **A read-only mirror does not need an App's blast radius.** The whole v1 is
  "show me the PRs touching this Ticket." That requires receiving events, not
  calling GitHub. Webhooks alone close the entire vertical (receive → verify →
  parse ref → resolve-in-tenant → store → render) with the smallest possible
  surface: no OAuth installation flow, no JWT-signed app auth, no installation
  token rotation.
- **A verified delivery is a free, airtight proof of control.** The naive 1:1
  `repo → org` binding has a squatting hole: a bad actor could claim
  `facebook/react` first and lock out the true owner. Anchoring reservation to a
  *signed delivery* — which only a repo admin can produce — makes squatting
  impossible **by construction**, with no extra mechanism. Pending links reserve
  nothing.
- **The Ticket ref already carries the product code, so binding belongs at the
  org, not the product.** `BUGS-1` self-routes to the `BUGS` product. Org-level
  binding lets one repo (monorepo, or a service split across products) feed many
  products for free; product-level binding would throw that routing information
  away, break monorepos, and add a constraint that buys nothing.
- **Re-deriving the link set keeps the mirror honest.** The promise of a mirror
  is that it reflects reality; an append-only link set would show refs a PR no
  longer mentions. Re-derivation costs one set-reconcile per event and the head
  branch is immutable on an open PR, so only title edits churn it.
- **Encryption-at-rest is an investment we'll need anyway.** The App phase must
  store installation tokens that come *from* GitHub and cannot be derived. Paying
  for a generic AES-256-GCM primitive now, on a low-stakes symmetric secret, is
  cheaper than retrofitting it later — and it keeps GitHub credentials out of the
  OAuth token tables, which are Orcha-as-authorization-server (inbound) and must
  not be conflated with this outbound direction.

## Considered options

- **Lead with the GitHub App.** Rejected for v1: it drags an installation OAuth
  flow, app-private-key JWT signing, installation-token storage/rotation, and
  *per-deployment App registration* (painful for self-hosters) into a feature
  whose v1 only displays PRs. It remains the right home for the App phase
  (backfill, check runs, write-back) — deferred, not dismissed.
- **Store the GitHub credential in the existing `OAuthAccessToken` tables.**
  Rejected: those are inbound (third parties getting tokens to call Orcha); this
  is outbound (Orcha holding a repo's webhook secret). Conflating them pollutes a
  security-sensitive surface.
- **Reserve the repo at link creation (on the typed name).** Rejected: that is
  exactly the squatting hole. Reservation must follow a verified delivery.
- **Derive the webhook secret from a master key instead of storing it.**
  Considered (zero secret-at-rest, the more elegant option *in isolation*).
  Rejected because the App phase needs real encryption-at-rest regardless;
  building the generic primitive now serves both and avoids two mechanisms.
- **Bind repos at the Product level.** Rejected: more limiting, not less — see
  Why. The product code in the ref already does product routing.
- **Append-only link set.** Rejected: lets the tab show stale refs, breaking the
  mirror's one promise.
- **Capture loose commits / branches / CI checks in v1.** Deferred: PRs are the
  reviewable, stateful unit. Commits (a second, stateless entity) and CI status
  (a second decoupled event stream correlated by head SHA) enrich a row without
  changing the model — textbook v1.1 adds.
- **Backfill existing open PRs on connect.** Rejected for v1: it forces an
  authenticated GitHub API call, nudging toward the App. `pull_request` payloads
  carry full current state on every edit, so the mirror self-heals forward;
  forward-only is the honest v1 scope.

## Consequences

- New **Repository link** model (org-scoped, `activeRepoFullName String? @unique`,
  encrypted `webhookSecretEnc`, pending/active lifecycle) and a **Linked pull
  request** model (`(repo, prNumber)` upsert key, many-to-many to Ticket, state +
  `isDraft`, guarded by payload `updated_at` against stale/out-of-order
  deliveries). Additive migrations, no backfill.
- A new unauthenticated, HMAC-verified route `POST /github/webhook/:token`
  (distinct from the bearer-authenticated `/v1` surface), feeding a BullMQ job
  for processing.
- First **encryption-at-rest** primitive (`crypto.ts`, AES-256-GCM,
  `ORCHA_ENCRYPTION_KEY`). Rotation is deferred (single key v1); the blob format
  leaves room for a key-version prefix. The App phase reuses this for
  installation tokens.
- **Forward-only:** PRs that predate a link's activation stay invisible until
  their next event. Accepted as v1 scope.
- New **Changes** tab on the Ticket view (`TicketView.tsx` — tab + state union +
  switch case). Read-only; shows PR state, title, author login, link out. GitHub
  user → Role mapping deferred.
- Glossary updated (`CONTEXT.md`) with **Ticket ref**, **Repository link**, and
  **Linked pull request**, and the explicit *avoid* that a Repository link is not
  a **Connected app** (opposite direction).
