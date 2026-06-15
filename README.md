# Orcha

A project manager that builds your team's schedule using Monte Carlo Tree
Search. Feed it tickets, estimates, and work-week calendars; the MCTS
explores thousands of assignment permutations and returns a complete
schedule — days, weeks, or months out — with 80%-confidence delivery
dates derived from the statistical distribution of simulations.

Think of the schedule as a quantum superposition: every ticket exists in
a cloud of possible timelines. As you finish work, other tasks collapse
into place — the schedule sharpens, confidence tightens, and ETAs that
were fuzzy last week become precise this week. The scheduler is stateless;
every run builds a fresh tree from the current state of the world.

![Delivery calendar — projected ETAs powered by MCTS](docs/screenshots/schedule-calendar.png)

<details>
<summary>More views: swimlanes and Gantt</summary>

![Per-engineer swimlanes](docs/screenshots/schedule-swimlanes.png)
![Gantt chart across projects](docs/screenshots/schedule-gantt.png)

</details>

**The scheduler respects the real world:** time-offs, work-week calendars,
per-person velocity biases, and a flexible priority engine that lets you
set priority at the project, tag, or individual ticket level. Want to see
what happens if you reprioritize a project? Run a simulation and compare
the impact on your current plan before committing to the change.

## Quickstart

```sh
git clone https://github.com/whileTrueYield/orcha.git && cd orcha
make        # copies .env, boots 7 containers in demo mode with sample data
```

Open http://localhost:3000.

**Requires:** Docker and Docker Compose. Nothing else.

### Development mode

```sh
make dev    # real auth, isolated DB, Mailpit email catcher, file watching
```

Unlike the demo, `make dev` runs with real authentication and email flows.
Registration and invitation emails are caught by Mailpit at
http://localhost:8025. The dev stack uses its own database and MinIO volumes
so it won't interfere with the demo instance.

## How it works

Five services in a monorepo, orchestrated by Docker Compose:

```
browser → frontend (Vite/React) → backend (Apollo/Prisma) → ai (FastAPI/MCTS)
                                        ↕                         ↕
                                    Postgres               stateless — no DB
                                    Redis
                                    MinIO (S3)
```

1. Users create tickets with estimates in the frontend.
2. The backend queues a scheduling request (BullMQ on Redis).
3. The cron worker POSTs the team's tickets, calendars, and time-offs to
   the MCTS scheduler.
4. The scheduler runs ~2k simulations in 60 seconds, scoring each by
   `busy_time / (busy_time + free_time)` averaged across engineers.
5. The best-scoring assignment comes back as per-engineer timelines.

The algorithm lives in `ai/app/libs/scheduler/mcts_scheduler.py`. The
architecture is documented in depth in [ARCHITECTURE.md](ARCHITECTURE.md).

## Other features

- Markdown rich-text editors (Milkdown Crepe) with 3-way-merge conflict handling
- Per-product workflow pipelines with customizable states
- Public documentation site builder (published to S3)
- Embeddable support widget that creates tickets in your workspace
- Push notifications, time tracking, project dashboards, reports

## Connect a coding agent (MCP)

Orcha exposes a remote [MCP](https://modelcontextprotocol.io) endpoint at `/mcp`
so a coding agent can ask "who am I?" and "what should I work on next?" and act
on its answer. It authenticates with the same Personal Access Token you'd use for the `/v1`
REST API — mint one from the **avatar menu → API Tokens**.

Point any MCP client at the endpoint with the token in an `Authorization`
header. For a Claude Code / Cursor-style `mcp.json`:

```json
{
  "mcpServers": {
    "orcha": {
      "type": "http",
      "url": "http://localhost:4000/mcp",
      "headers": {
        "Authorization": "Bearer orcha_pat_your_token_here"
      }
    }
  }
}
```

Once connected, the read surface an agent uses to orient itself and understand
its work is available:

- **`whoami`** — your role, the user and organization you act for, and whether
  your token is read-only.
- **`next_tickets`** — your work queue in scheduler (MCTS) priority order, each
  ticket paired with the next workflow state to advance it into.
- **`list_tickets`** — find tickets by project, status, stage, assignee, or
  search, paginated.
- **`get_ticket`** — a single ticket's full detail: estimate/ETA, workflow
  states with three-point estimates, dependency edges, and the Markdown body.
- **`get_ticket_body`** / **`get_project_body`** — just the Markdown body and
  its version (the version a later body write conditions on).
- **`list_projects`** — find projects by search or parent, paginated.
- **`get_project`** — a single project's detail and its parent/children edges.
- **`get_schedule`** — your own outstanding scheduled work and its ETAs.

And the write surface to act on what it finds:

- **`create_ticket`** / **`update_ticket`** — capture a new ticket, or patch an
  existing one's fields.
- **`transition_ticket`** — drive a ticket through its lifecycle: schedule it,
  start a workflow stage, advance to the next stage, or close/cancel it.
- **`update_ticket_body`** / **`update_project_body`** — write the Markdown body
  with optimistic concurrency: the write conditions on the version you read, and
  a concurrent edit comes back as a conflict to rebase on — never a silent
  overwrite.

Every tool is tenant-scoped to the token's role and returns LLM-shaped flat JSON.
A **read-only** token can call every read tool but is refused on the writes. The
connection is refused outright if the token is missing, malformed, or invalid.

## Development

```sh
make dev               # start dev stack with file watching
make demo              # start demo instance (seeded data, no auth)
make watch             # hot-reload on file changes (demo mode)
make types             # regenerate GraphQL types after schema changes
make ssh-backend       # shell into a running container
make help              # full command list
```

Useful URLs once up:

| Service        | URL                        | Mode     |
|----------------|----------------------------|----------|
| App            | http://localhost:3000       | both     |
| GraphQL API    | http://localhost:4000       | both     |
| MinIO Console  | http://localhost:9001       | both     |
| Prisma Studio  | http://localhost:5555       | both     |
| Logs (Dozzle)  | http://localhost:10350      | both     |
| Mailpit        | http://localhost:8025       | dev only |

## License

[FSL-1.1-MIT](LICENSE) — free to use and self-host. Converts to MIT two
years after each release. See [LICENSE-NOTES.md](LICENSE-NOTES.md) for the
plain-English summary.
