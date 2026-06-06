# Collab-stack teardown (Yjs / Tiptap / hocuspocus) — design

**Parent PRD:** #36, issue #45. **ADR:** `docs/adr/0007-markdown-bodies-source-of-truth-over-collaborative-crdt.md`.
**Branch:** slice PR into integration branch `feat/36-markdown-bodies` (NOT `main`).

Final slice of PRD #36. Markdown bodies are live end-to-end (#39–#42, #44, #57,
#60), and #43 (SSE presence) was closed as deferred — the 3-way merge is the
safety net, and a per-instance presence light would be unreliable in
multi-instance prod. Nothing reaches the collaborative stack anymore; this
slice removes it whole: the hocuspocus service, its deployment footprint, the
Yjs/Tiptap dependency tree, and the JWT access-token queries that gated the old
WebSocket channel.

## What discovery established

The kill list below was verified by tracing every import chain, not by trusting
the issue text. Two findings shape the scope:

- **No database work.** The `TicketText` / `ProjectText` / `DocumentationPageText`
  tables already store pure Markdown (`markdown` + `version`, no Yjs bytes
  column) and are the *live* body store behind `markdown/bodyRepository.ts`.
  The schema does not change; only the hocuspocus fetch/store hooks that also
  wrote to these tables die.
- **The Tiptap utility chain is fully dead code.** Its only live consumer chain
  ends inside the hocuspocus store hooks: `utils/tiptap.ts` →
  `notifyMentionedUsersInTicket/Project` (called only from
  `hocuspocus/*/store*.ts`; mention notifications now flow through
  `markdown/analysis.ts`), and `hocuspocus/getText.ts` →
  `getIndexableContentFromTipTapJson` (zero callers since #44/#56 re-wired
  search to Markdown). `markdown/analysis.ts` and `markdown/render.ts` mention
  these utilities in comments only, as the things they replaced.

## Kill list

### Code (backend)

- `src/hocuspocus/` — entire directory: server entry, config, fetch/store hooks
  for the three text types, `documentToken.ts`, `getText.ts`, `helper.ts`, and
  its stale `pm2.config.js`.
- `src/utils/tiptap.ts` + `src/utils/__tests__/tiptap.spec.ts` — all five
  exports unreachable after the above.
- `src/utils/yjs.ts` — hocuspocus-only.
- `src/scripts/MigrateTicketToTiptap.ts` — legacy one-off migration into the
  format we are deleting.
- `notifyMentionedUsersInTicket` / `notifyMentionedUsersInProject` in
  `src/models/notification/createNotification.ts` (and the now-unused
  `getMentions` import).
- `getIndexableContentFromTipTapJson` in `src/models/ticket/helper.ts` (and its
  `getTextFromTipTapJson` import).
- The four JWT access-token GraphQL queries and their `DocumentToken` imports:
  - `ticketTextAccessToken` (`models/ticket/resolvers/ticket.resolver.ts`)
  - `projectTextAccessToken` + its duplicate `projectAccessToken`
    (`models/project/resolvers/project.resolver.ts`)
  - `documentationPageAccessToken`
    (`models/documentation/resolvers/documentationPage.resolver.ts`)
- Stale comment referencing hocuspocus in `src/notifications/endpoints.ts`.

Body access needs no replacement check: `saveDocumentBody` / body reads already
authorize per-resolver (#40); the tokens gated only the removed WebSocket path.

### Code (frontend)

No collab code exists (removed in #40). Only follow-through:

- Regenerate `src/types/graphql.ts` after the backend queries are removed (the
  generated types still carry the token fields).
- Remove `VITE_API_WS_URI` from `.env.development`.

### Dependencies

- **Backend prod:** `@hocuspocus/extension-database`, `@hocuspocus/extension-logger`,
  `@hocuspocus/extension-redis`, `@hocuspocus/extension-throttle`,
  `@hocuspocus/server`, `@hocuspocus/transformer`, all thirteen `@tiptap/*`
  packages, `yjs`, `y-prosemirror`.
- **Backend dev:** `y-protocols`, `prosemirror-model`, `prosemirror-state`,
  `prosemirror-view` — these existed to satisfy the Tiptap/Yjs peer tree; no
  direct prosemirror imports remain outside the deleted code.
- **Frontend dev:** `y-protocols` (stale leftover).
- **KEEP all prosemirror `resolutions`** in root and frontend `package.json` —
  those are the Milkdown/Crepe dedupe pins (single-ProseMirror constraint), not
  collab leftovers. Removing them re-breaks the editor with nested-copy crashes.

Frontend manifest changes require the yarn-classic lockfile regen dance and a
compose rebuild — user-driven (they manage the dev environment).

### Deployment

- `docker-compose.yaml`: `hocuspocus` service (build target, ports, env, watch
  sync of `src/hocuspocus/`).
- `docker-compose.prod.yaml`: `hocuspocus` service incl. the Traefik `/ws`
  router, stripprefix middleware, and service labels.
- `backend/Dockerfile-dev`: the `hocuspocus` build stage.
- `.do/app.yaml`: the `hocuspocus` service component and the `/ws` ingress rule.
- `backend/package.json`: `dev:hocuspocus` script.
- `backend/src/config.ts`: `apiWsUri` / `apiWsPort`, the `ORCHA_WS_BACKEND_PORT`
  and `ORCHA_API_WS_URI` env plumbing, and their fail-loud startup guards.
- Every env/example file carrying those vars (`.env*`, compose `environment:`
  blocks, `__DOCKER_ORCHA_WS_BACKEND_PORT`).
- Sweep `SELF-HOSTING.md` and the setup script for `/ws` or hocuspocus
  references.

The **live** DigitalOcean app still runs a hocuspocus component. The repo spec
edit is in scope here; deleting the live component happens at deploy time
through the user's flow (never `doctl apps update --spec` — it wipes env vars).

### Documentation

- `ARCHITECTURE.md`: service diagram, Redis-purpose line, the hocuspocus
  service paragraph, the stale "Hocuspocus provider for live collaboration"
  frontend line, and the "hocuspocus channel pushes the change" paragraph.
- `AGENTS.md`: service table row, `backend/src/` layout line.

## What explicitly stays

- The three `*Text` Prisma models, their `*Revision` history tables, and all
  data — live Markdown body store.
- `markdown/`, `models/documentBody/` — the replacement stack.
- Frontend `readOnly` plumbing in `DocumentBody` / `MarkdownEditor` — current
  architecture (archive-driven), not collab residue.
- All prosemirror `resolutions` pins (Milkdown dedupe, see above).
- Redis — still used for sessions and BullMQ; only the hocuspocus pub/sub use
  disappears.

## Sequencing

1. Backend code deletions + dependency removal, in one pass (the deletions are
   one connected dead subgraph; removing code without deps or vice versa leaves
   the build broken either way).
2. Backend builds + `make test-backend` green.
3. Frontend: GraphQL type regen, `y-protocols` removal, lockfile dance,
   typecheck + `make test-frontend` green.
4. Deployment + docs sweep (compose, Dockerfile-dev, DO spec, env files,
   ARCHITECTURE/AGENTS/SELF-HOSTING).
5. User bounces dev compose (`--remove-orphans`) and confirms the app works:
   edit + save a ticket body, project body, documentation page.

## Verification

- `make test-backend` and `make test-frontend` pass; backend `tsc` build and
  frontend typecheck clean.
- `grep -ri "hocuspocus\|y-prosemirror\|@tiptap\|@hocuspocus" --exclude-dir=node_modules`
  over the repo returns only historical references (specs, ADRs, CHANGELOG-type
  docs) — zero hits in `src/`, manifests, compose files, or the DO spec.
  `yjs` is grepped as a word (`\byjs\b`) to avoid false positives.
- Paired in-app check (user drives): bodies load, edit, save; comments render;
  no console/network errors hunting for `/ws`.
