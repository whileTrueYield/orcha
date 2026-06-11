# Collab-Stack Teardown (#45) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the dead Yjs / Tiptap / hocuspocus collaborative-editing stack — code, dependencies, deployment footprint, and JWT access-token queries.

**Architecture:** Pure teardown, no new code. Markdown bodies (`backend/src/markdown/`, `models/documentBody/`) replaced this stack in #39–#44; discovery (see spec) verified every deletion below is an unreachable dead subgraph. The DB schema does NOT change — the `*Text` tables are the live Markdown store. Tests are "existing suites stay green," not new tests; TDD does not apply to deletions.

**Tech Stack:** TypeScript, Express/Pothos backend (mocha via `make test-backend` — NEVER raw jest), React frontend (`make test-frontend`), docker-compose dev env (user-managed — never run docker commands; ask the user to run in-container commands via `! <cmd>`).

**Spec:** `docs/superpowers/specs/2026-06-06-collab-stack-teardown-design.md`

**Branch:** create `feat/45-collab-teardown` off `feat/36-markdown-bodies`; PR back INTO `feat/36-markdown-bodies` (squash), NOT `main`.

**Environment notes (hard rules):**
- Dev env is Docker with auto-reload, managed by the user. Never run `docker ...` yourself.
- Frontend typecheck runs in-container: ask the user to type
  `! docker exec orcha-frontend sh -c 'cd /orcha && npx tsc --noEmit -p tsconfig.json'`
- `.env` and `.env.prod` are untracked local files: edit them so the user's env keeps working, but they cannot be committed.

---

### Task 1: Create the slice branch

- [ ] **Step 1: Branch off the integration branch**

```bash
cd /Users/sms/Code/orcha
git checkout feat/36-markdown-bodies && git pull
git checkout -b feat/45-collab-teardown
```

---

### Task 2: Delete the dead backend source files

**Files:**
- Delete: `backend/src/hocuspocus/` (entire directory — server, config, fetch/store hooks, `documentToken.ts`, `getText.ts`, `helper.ts`, stale `pm2.config.js`)
- Delete: `backend/src/utils/tiptap.ts`
- Delete: `backend/src/utils/__tests__/tiptap.spec.ts`
- Delete: `backend/src/utils/yjs.ts`
- Delete: `backend/src/scripts/MigrateTicketToTiptap.ts`

- [ ] **Step 1: Remove the files**

```bash
git rm -r backend/src/hocuspocus
git rm backend/src/utils/tiptap.ts backend/src/utils/__tests__/tiptap.spec.ts backend/src/utils/yjs.ts backend/src/scripts/MigrateTicketToTiptap.ts
```

- [ ] **Step 2: Confirm the expected breakage is exactly two import sites**

```bash
grep -rn "hocuspocus\|utils/tiptap\|utils/yjs" backend/src --include="*.ts"
```

Expected: exactly six hits, all fixed in Tasks 3–6:
- `src/models/notification/createNotification.ts:4` (`getMentions` import — Task 3)
- `src/models/ticket/helper.ts:30` (`getTextFromTipTapJson` import — Task 4)
- three `DocumentToken` imports from `hocuspocus/documentToken` in `ticket.resolver.ts`, `project.resolver.ts`, `documentationPage.resolver.ts` (Task 5)
- `src/notifications/endpoints.ts:16` (comment only — Task 6)

No commit yet — backend doesn't compile until Tasks 3–5 land. Tasks 2–7 form one commit.

---

### Task 3: Remove dead mention-notification functions

**Files:**
- Modify: `backend/src/models/notification/createNotification.ts`

These two functions were called only from the deleted hocuspocus store hooks. Mention notifications now flow through `markdown/analysis.ts` (#57).

- [ ] **Step 1: Remove the import (line 4)**

```ts
import { getMentions } from "../../utils/tiptap";
```

- [ ] **Step 2: Remove both functions** — from the comment `// notify users mentioned in the ticket's description` above `notifyMentionedUsersInTicket` through the closing `}` of `notifyMentionedUsersInProject` (currently lines ~108–164). Both blocks look like:

```ts
// notify users mentioned in the ticket's description
export async function notifyMentionedUsersInTicket(
  ticketId: number,
  organizationId: number,
  authorId: number,
  document: string | {},
) {
  const mentions = getMentions(document);
  ...
  return [];
}
```

- [ ] **Step 3: Prune now-unused imports** — check each remaining import in the file (`logger`, `NotificationCategory`, `NotificationTarget`, lodash helpers) still has a use site:

```bash
grep -n "logger\.\|NotificationCategory\.\|NotificationTarget\." backend/src/models/notification/createNotification.ts
```

Remove any import with zero remaining uses.

---

### Task 4: Remove dead Tiptap text extraction in ticket helper

**Files:**
- Modify: `backend/src/models/ticket/helper.ts`

- [ ] **Step 1: Remove the import (line 30)**

```ts
import { getTextFromTipTapJson } from "../../hocuspocus/getText";
```

- [ ] **Step 2: Remove the zero-caller function (lines ~1009–1023)**

```ts
export function getIndexableContentFromTipTapJson(json: string | null): string {
  if (!json) {
    return "";
  }

  const content = JSON.parse(json);
  try {
    return getTextFromTipTapJson({ default: content });
  } catch (error) {
    logger.error(error);
  }

  return "";
}
```

- [ ] **Step 3: Check `logger` is still used elsewhere in the file** (it's a large helper; almost certainly yes). If not, remove its import.

```bash
grep -cn "logger\." backend/src/models/ticket/helper.ts
```

---

### Task 5: Remove the four JWT access-token queries

**Files:**
- Modify: `backend/src/models/ticket/resolvers/ticket.resolver.ts`
- Modify: `backend/src/models/project/resolvers/project.resolver.ts`
- Modify: `backend/src/models/documentation/resolvers/documentationPage.resolver.ts`

Body access needs no replacement: `saveDocumentBody`/body reads already authorize per-resolver (#40). These tokens gated only the deleted WebSocket channel.

- [ ] **Step 1: ticket.resolver.ts** — remove the `ticketTextAccessToken` query: the block starting at the comment banner

```ts
// ---------------------------------------------------------------------------
// Query: ticketTextAccessToken
//
// Returns a JWT for the TipTap collaborative editor websocket.
// Valid for 15 minutes.
// ---------------------------------------------------------------------------

builder.queryField("ticketTextAccessToken", (t) =>
```

through its closing `);` (currently lines ~103–155).

- [ ] **Step 2: project.resolver.ts** — remove BOTH `projectTextAccessToken` and its duplicate `projectAccessToken`: two consecutive banner-plus-`builder.queryField(...)` blocks (currently lines ~164–211), ending just before the `// Query: exportTickets` banner.

- [ ] **Step 3: documentationPage.resolver.ts** — remove the `documentationPageAccessToken` query: the block starting at the banner

```ts
// ---------------------------------------------------------------------------
// Query — access token for the collaborative Yjs editor
```

through its closing `);` (currently lines ~52–95).

- [ ] **Step 4: Prune now-unused imports in all three files** — candidates: `DocumentToken` (from `../../../hocuspocus/documentToken` — MUST go, the module is deleted), `jwt` (`jsonwebtoken`), `config`, `logger`. For each:

```bash
grep -n "jwt\.\|DocumentToken\|config\.\|logger\." backend/src/models/ticket/resolvers/ticket.resolver.ts backend/src/models/project/resolvers/project.resolver.ts backend/src/models/documentation/resolvers/documentationPage.resolver.ts
```

Remove imports with zero remaining uses in their file. Keep any that other resolvers in the same file still use.

---

### Task 6: Fix the stale comment in notifications/endpoints.ts

**Files:**
- Modify: `backend/src/notifications/endpoints.ts:16-18`

- [ ] **Step 1: Replace the comment**

Old:

```ts
// This needs to be called by hocuspocus and graphql backend
// therefore we can't import config from one or the other
// and just expect these env variable to be defined.
```

New:

```ts
// Reads env directly (not ./config) so this module can be imported
// without the full config bootstrap and its env-var guards.
```

---

### Task 7: Remove WS plumbing from config.ts, deps from package.json, then verify backend

**Files:**
- Modify: `backend/src/config.ts`
- Modify: `backend/package.json`
- Regenerates: `backend/yarn.lock`, root `yarn.lock`

- [ ] **Step 1: config.ts — remove the two interface fields (lines 22–23)**

```ts
  apiWsUri: string;
  apiWsPort: number;
```

- [ ] **Step 2: config.ts — remove from `testEnv` (lines 68, 75)**

```ts
  ORCHA_WS_BACKEND_PORT: "38268",
  ORCHA_API_WS_URI: "ws://api.example.com:38268",
```

- [ ] **Step 3: config.ts — remove from the runtime `env` object (lines 93, 100)**

```ts
      ORCHA_WS_BACKEND_PORT: process.env.ORCHA_WS_BACKEND_PORT || "38268",
      ORCHA_API_WS_URI: process.env.ORCHA_API_WS_URI,
```

- [ ] **Step 4: config.ts — remove the two fail-loud guards (lines 137–143)**

```ts
if (!env.ORCHA_WS_BACKEND_PORT) {
  throw Error("ORCHA_WS_BACKEND_PORT env variable is undefined");
}

if (!env.ORCHA_API_WS_URI) {
  throw Error("ORCHA_API_WS_URI env variable is undefined");
}
```

- [ ] **Step 5: config.ts — remove the two config-object fields (lines 186–187)**

```ts
  apiWsUri: env.ORCHA_API_WS_URI,
  apiWsPort: parseInt(env.ORCHA_WS_BACKEND_PORT),
```

- [ ] **Step 6: package.json — remove dependencies**

From `dependencies` (lines 17–22, 28–40, 111–112):

```
"@hocuspocus/extension-database", "@hocuspocus/extension-logger",
"@hocuspocus/extension-redis", "@hocuspocus/extension-throttle",
"@hocuspocus/server", "@hocuspocus/transformer",
"@tiptap/core", "@tiptap/extension-color", "@tiptap/extension-image",
"@tiptap/extension-link", "@tiptap/extension-mention",
"@tiptap/extension-task-item", "@tiptap/extension-task-list",
"@tiptap/extension-text-align", "@tiptap/extension-text-style",
"@tiptap/html", "@tiptap/pm", "@tiptap/starter-kit", "@tiptap/suggestion",
"y-prosemirror", "yjs"
```

From `devDependencies` (lines 184–186, 190):

```
"prosemirror-model", "prosemirror-state", "prosemirror-view", "y-protocols"
```

From `scripts` (line 127):

```
"dev:hocuspocus": "dotenv -e .env.development -- nodemon src/hocuspocus/server.ts",
```

- [ ] **Step 7: Regenerate lockfiles**

```bash
yarn --cwd backend install   # regenerates backend/yarn.lock (Makefile does this routinely on host)
yarn install                  # syncs root workspace yarn.lock
```

- [ ] **Step 8: Backend typecheck**

```bash
yarn --cwd backend build
```

Expected: clean `tsc -p tsconfig.build.json` exit. Any error about a missing import means a prune step in Tasks 3–5 was missed — fix there, don't patch around it.

- [ ] **Step 9: Backend tests**

```bash
make test-backend
```

Expected: PASS (the deleted `tiptap.spec.ts` no longer runs; everything else green).

- [ ] **Step 10: Commit (Tasks 2–7)**

```bash
git add -A backend yarn.lock
git commit -m "Remove hocuspocus service, Tiptap/Yjs code and deps (#45)"
```

---

### Task 8: Regenerate the GraphQL schema and frontend types

**Files:**
- Regenerates: `backend/schema.graphql`, `frontend/src/types/graphql.ts`

- [ ] **Step 1: Regenerate**

```bash
yarn --cwd backend types
```

(Exports the Pothos SDL with runtime deps stubbed — no env or DB needed — then runs graphql-codegen into `frontend/src/types/graphql.ts`.)

- [ ] **Step 2: Verify the token fields are gone**

```bash
grep -n "ticketTextAccessToken\|projectTextAccessToken\|projectAccessToken\|documentationPageAccessToken" backend/schema.graphql frontend/src/types/graphql.ts
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add backend/schema.graphql frontend/src/types/graphql.ts
git commit -m "Regenerate GraphQL schema/types without access-token queries (#45)"
```

---

### Task 9: Frontend cleanup (y-protocols, WS env var), then verify frontend

**Files:**
- Modify: `frontend/package.json` (remove `"y-protocols": "^1.0.1"` from devDependencies, line 151)
- Modify: `frontend/.env.development` (remove line 4: `VITE_API_WS_URI=ws://localhost:38268`)
- Regenerates: `frontend/yarn.lock`, root `yarn.lock`

**DO NOT TOUCH** the `resolutions` blocks in `frontend/package.json` or root `package.json` — the prosemirror pins are the Milkdown/Crepe single-ProseMirror dedupe fix, not collab leftovers. Removing them re-breaks the editor.

- [ ] **Step 1: Edit the two files** (remove the devDependency line and the env line).

- [ ] **Step 2: Regenerate `frontend/yarn.lock` with the yarn-classic temp-dir dance** (project gotcha — host yarn must not resolve against the workspace):

```bash
TMP=$(mktemp -d)
cp frontend/package.json frontend/yarn.lock "$TMP"
(cd "$TMP" && yarn install --ignore-scripts)
cp "$TMP/yarn.lock" frontend/yarn.lock
rm -rf "$TMP"
yarn install   # sync root workspace yarn.lock
```

The compose watcher rebuilds the frontend container on the lock change — that's the user's env doing its job; don't interfere.

- [ ] **Step 3: Frontend typecheck (in-container — ask the user to run it)**

Ask the user to type:

```
! docker exec orcha-frontend sh -c 'cd /orcha && npx tsc --noEmit -p tsconfig.json'
```

Expected: clean exit.

- [ ] **Step 4: Frontend tests**

```bash
make test-frontend
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/yarn.lock frontend/.env.development yarn.lock
git commit -m "Drop stale y-protocols dep and WS env var from frontend (#45)"
```

---

### Task 10: Remove the deployment footprint

**Files:**
- Modify: `docker-compose.yaml` (delete the `hocuspocus:` service, lines ~268–310)
- Modify: `docker-compose.prod.yaml` (delete the `hocuspocus:` service incl. all Traefik `/ws` labels, lines ~295–333)
- Modify: `backend/Dockerfile-dev` (delete the final `FROM prisma AS hocuspocus` stage, lines ~58–65)
- Modify: `.do/app.yaml` (delete the `/ws` ingress rule, lines ~36–43, and the `# -- Hocuspocus (WebSocket CRDT collaboration) --` service component, lines ~167–201)
- Modify: `.env.dev`, `.env.example`, `.env.prod.example` (tracked) and `.env`, `.env.prod` (local, untracked): remove the `__DOCKER_ORCHA_WS_BACKEND_PORT=38268` line
- Modify: `backend/.env.development`: remove `ORCHA_WS_BACKEND_PORT=38268` (line 13) and `ORCHA_API_WS_URI=ws://localhost:${ORCHA_WS_BACKEND_PORT}` (line 22)

- [ ] **Step 1: docker-compose.yaml** — delete the whole block from `  hocuspocus:` (after the `ai` service's `develop:` block) to just before `  support:`. It starts:

```yaml
  hocuspocus:
    container_name: orcha-hocuspocus
    build:
      context: ./backend
      dockerfile: Dockerfile-dev
      target: hocuspocus
```

- [ ] **Step 2: docker-compose.prod.yaml** — same: delete from `  hocuspocus:` to just before `  support:`, including the eight `traefik.http.*hocuspocus*` label lines and the `# Route /ws/* to hocuspocus` comment.

- [ ] **Step 3: backend/Dockerfile-dev** — delete the trailing stage:

```dockerfile
FROM prisma AS hocuspocus
ADD nodemon.json nodemon.json
ADD tsconfig.json tsconfig.json
COPY src src/

EXPOSE 38268

CMD ["yarn", "run", "nodemon", "src/hocuspocus/server.ts"]
```

- [ ] **Step 4: .do/app.yaml** — delete the ingress rule:

```yaml
    - match:
        authority:
          exact: api.orcha.run
        path:
          prefix: /ws
      component:
        name: hocuspocus
```

and the whole `- name: hocuspocus` service entry (from the `# -- Hocuspocus (WebSocket CRDT collaboration) --` comment to just before `# -- MCTS AI scheduler ...`).

- [ ] **Step 5: env files** — remove the lines listed above from all six files (edit `.env` / `.env.prod` too so the user's local env stays consistent; they just can't be committed).

- [ ] **Step 6: Sanity-check no deploy file still references the stack**

```bash
grep -rn "hocuspocus\|WS_BACKEND\|API_WS" docker-compose.yaml docker-compose.prod.yaml backend/Dockerfile-dev backend/Dockerfile .do/ .env.dev .env.example .env.prod.example backend/.env.development frontend/.env.development pm2.config.js ecosystem.config.js 2>/dev/null
```

Expected: no matches.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yaml docker-compose.prod.yaml backend/Dockerfile-dev .do/app.yaml .env.dev .env.example .env.prod.example backend/.env.development
git commit -m "Remove hocuspocus deployment footprint: compose, Dockerfile, DO spec, env (#45)"
```

---

### Task 11: Update the docs

**Files:**
- Modify: `ARCHITECTURE.md` (lines 31, 42, 61–63, 112, 190, 225)
- Modify: `AGENTS.md` (lines 15, 26)

- [ ] **Step 1: ARCHITECTURE.md**

- Line 31: remove `│  - hocuspocus (WS, CRDT) │` from the service diagram (re-align the box edges).
- Line 42: `Redis │ (sessions, BullMQ, hocuspocus pubsub)` → `Redis │ (sessions, BullMQ)`.
- Lines 61–63: delete the `**hocuspocus** — Yjs/CRDT WebSocket server...` bullet.
- Line 112: drop `Hocuspocus provider for live collaboration` (and the stale TipTap mention if still present) from the frontend stack sentence — the editor is Milkdown Crepe over Markdown (ADR 0007).
- Line 190: delete the `- Hocuspocus:     ws://localhost:38268` dev-URL line.
- Line 225: rewrite the paragraph claiming `hocuspocus channel pushes the change to other viewers` — body edits are saved as Markdown via `saveDocumentBody` with optimistic concurrency + 3-way merge; no live push.

- [ ] **Step 2: AGENTS.md**

- Line 15: delete the `| **hocuspocus** | service | ...` row from the service table.
- Line 26: `backend/src/ — API, cron, hocuspocus source (TypeScript)` → `backend/src/ — API and cron source (TypeScript)`.

- [ ] **Step 3: Commit**

```bash
git add ARCHITECTURE.md AGENTS.md
git commit -m "Docs: drop hocuspocus from architecture and agents docs (#45)"
```

---

### Task 12: Final verification (paired)

- [ ] **Step 1: Repo-wide grep sweep**

```bash
grep -rniE "hocuspocus|y-prosemirror|@tiptap|@hocuspocus|\byjs\b" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=dist . | grep -v "docs/superpowers\|docs/adr\|docs/prd" | grep -v "yarn.lock"
```

Expected: zero hits in `src/`, manifests, compose files, Dockerfiles, `.do/`. Historical references in specs/ADRs/PRDs are fine (excluded above). If `yarn.lock` still mentions the packages, Step 7 of Task 7 / Step 2 of Task 9 didn't regenerate — redo them.

- [ ] **Step 2: Full suites once more**

```bash
make test-backend
make test-frontend
```

Expected: both PASS.

- [ ] **Step 3: Paired in-app check (user drives)**

Ask the user to bounce the dev env (their call, e.g. `docker compose up -d --remove-orphans` to drop the orphaned hocuspocus container) and then together verify:

- Ticket body: open, edit, save — works; no console errors; no network requests to `:38268` or `/ws`.
- Project body and documentation page: same.
- Comments still render Markdown.

- [ ] **Step 4: PR**

Only when the user asks: PR `feat/45-collab-teardown` → `feat/36-markdown-bodies` (squash-merge), referencing #45.

**Deploy-time note for the user (out of band):** the live DO app still runs the hocuspocus component; it gets deleted at next deploy through your usual flow — never `doctl apps update --spec` (wipes env vars).
