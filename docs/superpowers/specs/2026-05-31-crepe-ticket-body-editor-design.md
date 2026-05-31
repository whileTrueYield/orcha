# #41 — Crepe (Milkdown) ticket body editor — design

**Issue:** #41 (`gh issue view 41`). **Parent PRD:** #36. **ADR:** `docs/adr/0007-markdown-bodies-source-of-truth-over-collaborative-crdt.md`.
**Branch:** `feat/41-crepe-editor` → integration branch `feat/36-markdown-bodies` (NOT `main`).

This is the first **frontend** slice of PRD #36. It replaces the collaborative Tiptap/Yjs editor on the **ticket body surface only** with a Crepe (Milkdown) Markdown editor that reads and writes through the #40 body API. Project and documentation editors are untouched here; physical removal of Tiptap/Yjs/hocuspocus dependencies is #45.

## Scope decisions (confirmed with user)

- **Ticket body only.** Project (`ExplorerEditorY.tsx`) and documentation (`DocumentationPageView.tsx`) keep the Tiptap mount for now.
- **Explicit Save button** (not autosave).
- **409 conflict UX:** banner + load the git-markered Markdown into the editor for manual resolution, then re-save against the returned version.
- **`Ticket.description` cleanup:** strip it from every query/fragment that still selects it and from the create mutation; delete the read-only previews those fed. Best-effort slice — a human-review pass catalogues anything worth restoring (per the issue).

## The contract this consumes (from #40, already merged)

GraphQL, served at `VITE_GRAPHQL_URI`:

- Read: `ticket(id) { body { markdown version } stage }`.
- Write: `saveDocumentBody(documentType: TICKET, documentId, markdown, baseVersion) { body { markdown version } conflict { markdown version } warnings { kind reference matches } }`.
- Optimistic concurrency: read `version`, send it as `baseVersion`. Match fast-forwards; stale 3-way merges; genuine overlap returns `conflict` (markered Markdown + the current `version` to rebase onto) and writes nothing. `warnings` are unresolved `@name` / `#123` references.
- Bodies are stored canonical (remark normalizes, e.g. trailing newline) — the editor's saved output comes back normalized.

## Verified Crepe API (`@milkdown/crepe`, not yet installed)

Confirmed against the Milkdown docs (`using-crepe` guide) and package source (`crepe.ts` / `builder.ts`):

```ts
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css"; // base, imported first
import "@milkdown/crepe/theme/frame.css";        // a theme — frame|crepe|nord (+ *-dark); default `frame`, swappable

const crepe = new Crepe({
  root,             // Node | selector | null
  defaultValue,     // initial markdown string
  // features, featureConfigs — Partial<Record<CrepeFeature, boolean>> / per-feature config (defaults are fine for core)
});

await crepe.create();                 // async
const md = crepe.getMarkdown();       // SYNC — returns the current markdown string
crepe.setReadonly(true);              // toggle editable
crepe.on((listener) => {
  listener.markdownUpdated((ctx, markdown, prevMarkdown) => { /* ... */ });
});
await crepe.destroy();                // async
```

There is **no `setMarkdown`** — content is seeded once at construction. Replacing content (the 409 case, and the initial load) is done by **remounting** the editor with a new `defaultValue`.

## Components

### `frontend/src/components/Markdown/MarkdownEditor.tsx` — presentational Crepe wrapper

- Lazy-loaded (`React.lazy`) so Crepe (heavy, ESM) is a separate Vite chunk, mirroring the existing `TipTapCollabLazy` pattern.
- Props: `{ value: string; readOnly?: boolean; onDirty?: () => void }`. A `ref` (via `forwardRef` + `useImperativeHandle`) exposes `{ getMarkdown(): string }`.
- Mounts on a `div` ref in `useEffect`: `new Crepe({ root, defaultValue: value })` → `await create()`; cleanup `await destroy()`. The effect is keyed so a change to `value` (initial load, or markered text after a 409) **remounts** cleanly — no double-init, no leak (satisfies the lifecycle AC). Uncontrolled internally: the parent never re-renders Crepe per keystroke.
- Registers `crepe.on(l => l.markdownUpdated((_ctx, md) => { latestRef.current = md; onDirty?.() }))`. The wrapper keeps the latest markdown in a ref (seeded from `value`); the imperative `getMarkdown()` returns `latestRef.current`. (`crepe.getMarkdown()` is an equivalent fallback; using the listener value avoids any reliance on calling into the editor at Save time.)

**Why imperative `getMarkdown()` over lifting markdown to React state:** keeps Crepe uncontrolled and avoids a parent re-render on every keystroke. The container only needs the markdown at Save time.

### `frontend/src/pages/ticket/TicketView/TicketBody.tsx` — container (replaces `TicketDescription.tsx`)

- `useQuery(GET_TICKET_BODY)`; holds `baseVersion` in state (seeded from `body.version`).
- Renders `<MarkdownEditor value={body.markdown} readOnly={archived} ref={editorRef} onDirty={...} />`, a **Save** button (enabled when dirty, hidden when archived), a status line, and a (conditionally shown) conflict banner.
- **Save:** `saveDocumentBody({ documentType: "TICKET", documentId, markdown: await editorRef.getMarkdown(), baseVersion })`.
  - success → `baseVersion = body.version`; clear dirty; "Saved"; if `warnings.length`, show a non-blocking notice listing the unresolved references.
  - 409 (`conflict` non-null) → remount the editor with `conflict.markdown`; `baseVersion = conflict.version`; show the banner: *"This body was edited elsewhere. Resolve the `<<<<<<<` / `=======` / `>>>>>>>` markers and Save again."*
- Archived (`stage === ARCHIVED`) → editor read-only, Save hidden. The backend 403s archived writes regardless; the UI just reflects it.

### GraphQL operations + hand-written types

- `GET_TICKET_BODY` query and `SAVE_DOCUMENT_BODY` mutation (co-located with `TicketBody`).
- Extend `frontend/src/types/graphql.ts` **by hand** (no codegen in this repo): `DocumentBody`, `DocumentBodyType` enum, `SaveDocumentBodyResult`, `MentionWarning`, and `Ticket.body`. Remove `Ticket.description` from the types.

## Removals & breakage cleanup

`Ticket.description` was deleted from the backend schema, so any Apollo query still selecting it now errors. Required for the app to run:

- `TicketView` renders `TicketBody` instead of `TicketDescription`; remove `description` from `TicketViewFragment`; stop using `ticketTextAccessToken` on this surface.
- Strip `description` from: `TicketList` (`GetTickets`), `ScheduleTickets` (scheduled + unscheduled queries), `TicketEditForm`/`DraftTicketEditForm` fragments, dashboard/favorite ticket rows, `EstimateStateModal`. Remove the `description` arg from `CREATE_TICKET_MUTATION` (the backend `createTicket` no longer accepts it; the body is edited after creation in the new editor).
- Delete the read-only description previews those fed (best-effort; human review catalogues replacements).
- **Do not touch** `ImportTicket` — backend `importTickets` still accepts a `description`.
- **Do not** remove Tiptap/Yjs/hocuspocus deps or the backend `ticketTextAccessToken` query — that is #45. Project & docs editors still use them.

## Explicitly out of scope

- **#42** — mention pills / Excalidraw embed / emoji **node views**. Stored `:mention[name]{#id type="user"}` / `:ticket[#n]{id=…}` directives render as raw-ish text in Crepe core until #42. Acceptable for the core slice.
- **#43** SSE presence. **#44** documentation bodies (a live legacy `body` column coexists with `documentationPageText`; reconciling them is #44). **#45** dependency teardown + dead-frontend removal.

## Testing

- **Jest + Testing Library** on `TicketBody`, with the `MarkdownEditor`/Crepe module **mocked** (a stub that records the seeded `value` and returns a settable markdown via the ref). Apollo `MockedProvider` for the query + mutation. Cases:
  - loads `body.markdown` into the editor at the loaded version;
  - Save sends `baseVersion` equal to the loaded version and the editor's current markdown;
  - success updates `baseVersion` to the returned version and surfaces `warnings`;
  - 409 loads `conflict.markdown` into the editor, sets `baseVersion` to `conflict.version`, and shows the banner.
- **Crepe itself is not unit-tested** in jsdom (real `contenteditable`, ESM). The issue's **manual in-app verification** covers actual editing and the formatting round-trip (headings, lists, task lists, bold/italic/code, links, images).
- No backend changes in this slice; the backend gate is unaffected.

## Risks / notes

- **ESM + jsdom:** Crepe is ESM and DOM-heavy. Lazy-loading isolates it to its own chunk (Vite handles ESM). Frontend Jest runs jsdom — hence Crepe is mocked in tests, not mounted.
- **Frontend toolchain** (establish during impl): `yarn --cwd frontend test` (Jest), `yarn --cwd frontend start` (Vite dev). Frontend points at the backend via `VITE_GRAPHQL_URI`.
- **Best-effort slice:** the issue states a human review pass will catalogue anything broken/missing after the migration; we do not chase every `description`-derived UX detail here.
