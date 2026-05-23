# ARCHITECTURE.md

A project manager for software teams. Orcha builds two-week schedules for
each engineer by running a Monte Carlo Tree Search over the team's tickets,
work-week calendars, and time-offs, then keeps that schedule live as work
progresses.

This file is the entry point for anyone (human or AI) landing in the repo
cold. It explains what the pieces are, how they fit together, and where to
start when a task crosses service boundaries.

> **Lineage.** Orcha was previously closed-source under the names Briga
> (2021) and TwoWeeks (2024). The 2026 open-source release unified the
> naming. If you find any stale references to the old names, it's a bug —
> please open an issue.

---

## The five services

```
                                       ┌────────────────────────┐
        browser ──── HTTPS ──────────► │  frontend (Vite)       │ ── nginx in prod
                                       └──────────┬─────────────┘
                                                  │ GraphQL + WS
                                                  ▼
   ┌────────────────────────┐   HTTP   ┌──────────────────────────┐
   │ support                │ ───────► │  backend                 │
   │ (embed.js + iframe)    │          │  - Apollo / Express      │
   └────────────────────────┘          │  - cron (BullMQ)         │
                                       │  - hocuspocus (WS, CRDT) │
                                       └─┬──────────┬─────────────┘
                                         │          │
                            Prisma       │          │  HTTP
                                         ▼          ▼
                                    ┌────────┐  ┌──────────────────┐
                                    │ Postgres│  │ ai (MCTS)       │
                                    └────────┘  │ FastAPI / Python │
                                       ▲        └──────────────────┘
                                       │
                                    ┌────────┐
                                    │ Redis  │  (sessions, BullMQ, hocuspocus pubsub)
                                    └────────┘
```

### `backend/` — the heart

Node + TypeScript. Apollo Server on Express, Prisma over Postgres, BullMQ
on Redis. It's the only service that owns the data.

Three runtime targets share this codebase (see `backend/Dockerfile`):

- **backend** — GraphQL API on port 4000 + Express routes for non-GraphQL
  endpoints (file uploads, support intake, push-notification subscribe,
  email confirmation, `/alive`). Entry: `src/server.ts`.
- **cron** — BullMQ worker for scheduled jobs. Entry: `src/cron.ts`. Jobs
  live in `src/cron/jobs/`: `nightlyEstimateTickets`,
  `onDemandEstimateTickets`, `autoResolveIssues`, `buildDemo`, plus
  several second-resolution repeating jobs (`autoClockOut`, `workDayEmail`,
  `startReminder`, `autoResumeTask` — see `src/cron/queues.ts`).
- **hocuspocus** — Yjs/CRDT WebSocket server on port 38268, backs the
  TipTap collaborative editors used for ticket descriptions, project notes,
  and documentation pages. Entry: `src/hocuspocus/server.ts`.

The schema is in `backend/prisma/schema.prisma` (~1900 lines). The domain
is organized as **Organization → User/Role → Project → Ticket**, with
`ScheduleItem` (one slot of work), `Workflow`/`WorkflowState` (per-product
status pipelines), `Issue` (support tickets from the support widget),
`Documentation` (public docs site), and `Notification` as the major
satellites. `src/models/` mirrors this layout with one folder per aggregate.

Type bridge to the frontend: `yarn types` regenerates the GraphQL types
that the frontend consumes via the Yarn workspace.

### `ai/` — the MCTS scheduler

Python + FastAPI on port 8000. **This is the distinctive piece.** It is
stateless: the backend POSTs the team's tickets, schedules, and started
work; the AI returns a per-employee timeline.

Three endpoints in `ai/app/main.py`:

| Endpoint                        | Time budget   | Returns                                        |
| ------------------------------- | ------------- | ---------------------------------------------- |
| `POST /scheduler/estimate`      | 60s, 2k sims  | `List[ScheduleSnapshot]` (snapshot per task)   |
| `POST /scheduler/estimate/quick`| 20s, 2k sims  | same shape, faster cutoff for on-demand        |
| `POST /scheduler/events`        | 60s, 5k sims  | `List[ScheduleBusyBlock]` (calendar-style)     |

The algorithm (`ai/app/libs/scheduler/mcts_scheduler.py`):

1. Build a `TaskTree` from tickets (respecting `ancestors`/`successors`
   dependencies and started-task priority).
2. Each simulation walks the tree, placing tasks into each employee's
   `EmployeeSchedule` until exhausted.
3. **Score = busy_time / (busy_time + free_time)** averaged across
   employees. Fewer idle gaps wins.
4. UCB-based selection + back-propagation, capped by `simulations` or
   `timeLimit` — whichever comes first.
5. The best-scoring rollout is returned as the snapshot.

Started tickets are promoted to the front of the priority list, and their
descendants get re-parented around them. See
`prioritize_started_task()` in `mcts_scheduler.py`.

Worth knowing: the AI has no memory. Every request is a fresh tree. The
backend orchestrates *when* to call it via the cron jobs above.

### `frontend/` — the app

Vite + React 18 + TypeScript. Apollo Client for data, Redux Toolkit for
local UI state (one folder per slice in `src/actions/` + `src/reducers/`),
TipTap for rich text, Hocuspocus provider for live collaboration, Nivo for
the charts in `pages/report/`, Excalidraw for drawings,
@headlessui/react + Tailwind for primitives.

Pages map directly to features — `pages/schedule/`, `pages/ticket/`,
`pages/project/`, `pages/dashboard/`, `pages/onboarding/`, `pages/billing/`,
etc. Generated GraphQL types live in `src/generated/`.

Production build is served by nginx (`frontend/nginx.conf` + the
`production` target in `frontend/Dockerfile`).

### `support/` — the embeddable support widget

A two-part package:

- `support/lib/orcha-support.ts` → bundled by webpack into
  `orcha-support.js`, the script third-party sites embed. It injects a
  launcher button and an iframe.
- `support/src/` → the React app loaded inside that iframe (contact form,
  documentation search, screenshot upload).

Submissions hit `POST /support` on the backend, which writes them as
`Issue` rows visible inside the project manager. So a customer's bug
report on their website lands as a ticket in their team's Orcha workspace.

### MinIO — local S3 emulation

A MinIO container provides S3-compatible object storage so file uploads
and documentation publishing work out of the box without an AWS account.
Two buckets are created on first boot by the `minio-init` one-shot
container: `orcha-uploads` (user file uploads) and `orcha-docs`
(published documentation pages).

The backend uses two env vars to route S3 traffic:

- `ORCHA_S3_ENDPOINT` — the internal Docker-network endpoint
  (`http://minio:9000`) used for server-side operations like `putObject`.
- `ORCHA_S3_PUBLIC_ENDPOINT` — the host-accessible endpoint
  (`http://localhost:9000`) used when generating presigned POST URLs that
  browsers will submit directly.

For production with real AWS, remove both env vars and the backend falls
back to the standard AWS SDK credential chain and endpoints. CloudFront
invalidation is skipped when no `DOCUMENTATION_DISTRIBUTION_ID` is
configured.

The MinIO console is at http://localhost:9001 (login with the
`MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` from your `.env`).

### Root — orchestration

The previous closed-source repo separated the orchestrator into its own
submodule. The monorepo merges it: `docker-compose.yaml` and `Makefile`
live at the root and reference the four service directories directly.

`Makefile` provides the dev UX: `make` boots the stack, `make watch`
hot-reloads on file change, `make ssh-<service>` opens a shell into a
container, `make db-init` / `db-push` / `db-reset` handle schema. Logs
are at http://localhost:10350 via Dozzle, Prisma Studio at
http://localhost:5555.

Today the compose only describes **dev**. A production deployment story
(IaC, image distribution, real hostnames, backups, observability) is the
open work — see "What's missing for deployable" at the bottom.

---

## Local dev cheat-sheet

```sh
make                       # first run: copies .env, boots everything, runs migrations
make watch                 # rebuild on file change (Docker Compose alpha feature)
```

Useful URLs once up:

- App:            http://localhost:3000
- API:            http://localhost:4000  (`/graphql`, `/alive`)
- Hocuspocus:     ws://localhost:38268
- Support iframe: http://localhost:3001
- AI:             http://ai:8000 *(only from inside the docker network)*
- MinIO Console:  http://localhost:9001  (S3 bucket browser)
- Prisma Studio:  http://localhost:5555
- Logs (Dozzle):  http://localhost:10350

Cross-cutting flows that bite if you forget them:

- Changed the Prisma schema? `make db-push` for iteration, then
  `make migrate` to bake a migration file before merging.
- Changed a GraphQL resolver? `make types` regenerates the frontend types.
- Changed `support/lib/orcha-support.ts`? `make build-support-js`
  recompiles the embeddable bundle.

---

## How a schedule actually gets built (end-to-end)

This is the one flow worth holding in your head because it touches every
service:

1. A user creates/edits tickets in the frontend → GraphQL mutation to the
   backend → Postgres.
2. The backend either:
   - reacts immediately via `onDemandEstimateTickets` (queued in BullMQ), or
   - waits for the next `nightlyEstimateTickets` cron tick (~every minute
     in dev, see `backend/src/cron/queues.ts`).
3. The cron worker builds a `ScheduledContext`: the team's `Role`s with
   their `workWeek` + `TimeOff`s + `timeZone`, plus all open tickets
   (with `ancestors`, `estimate`, `priority`, `started` flags).
4. It POSTs that to the AI's `/scheduler/estimate`. MCTS runs.
5. The AI returns per-task `ScheduleSnapshot`s. The backend writes them as
   `ScheduleItem` rows and bumps `Ticket.scheduledAt` / `eta`.
6. The frontend's open queries auto-refresh; if a doc is open the
   hocuspocus channel pushes the change to other viewers.

If a ticket has a deactivated assignee or is blocked,
`Organization.scheduleStatus` flips to `ASSIGNEE_DEACTIVATED` or `BLOCKED`
and the frontend surfaces the problem instead of pretending the schedule
is fine.

---

## Conventions and code-quality notes

- **Backend models** are one folder per aggregate under
  `backend/src/models/`, each typically containing `resolvers.ts`, an
  entity type, and any endpoints. Email templates live in `src/emails/`,
  templates for the hosted-docs site in `templates/`.
- **Frontend** keeps Redux logic in matching `actions/`/`reducers/`
  folders per domain; Apollo handles server state separately, so check
  both before assuming where a piece of state lives.
- Public-output Prisma fields are explicit; anything sensitive uses
  `/// @TypeGraphQL.omit(output: true, input: true)` (search the schema
  for that string).
- **Node 16** on the backend is pinned via Volta. This is old; an upgrade
  pass is overdue but has not been done.
- The codebase predates several conventions in `CONTRIBUTING.md`. Read
  neighbouring files before mimicking — patterns vary.

---

## What's missing for "deployable"

Still-open work for production readiness:

- **No production compose / IaC in-tree.** The current
  `docker-compose.yaml` binds to `localhost`, mounts dev secrets via
  `.env`, and uses dev image targets. A production variant (or a switch
  to a real orchestrator) is the big gap.
- **Secrets management.** Session secret, VAPID keys, AWS creds, Postgres
  credentials are all `.env`-loaded today. Production needs a secret
  store.
- **Image distribution.** No CI/CD in-tree publishes the four service
  images anywhere yet.
- **Frontend env baking.** The `build` target in `frontend/Dockerfile`
  takes API URLs as build ARGs. Pick a real production hostname strategy
  (build-time ARG vs runtime substitution).
- **DNS + TLS + reverse proxy.** Five public-ish surfaces today: app,
  api (HTTP), api (WS), support, upload CDN. Each needs a hostname, a
  cert, and a CORS + session-cookie domain that all agree.
- **Backups.** Postgres holds the entire product state. No automated
  backup job exists in this repo.
- **Observability.** Dozzle is dev-only. Production logging, metrics,
  and error tracking are unconfigured.

When working on deployability, start at the root `docker-compose.yaml`
and treat the dev compose as the spec — every env var it sets is
something prod needs to provide.
