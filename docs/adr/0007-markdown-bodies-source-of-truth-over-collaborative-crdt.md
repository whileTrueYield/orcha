# Document bodies: Markdown as source of truth, 3-way merge over collaborative CRDT

Ticket, project, and documentation bodies are moving from a real-time
collaborative CRDT stack (Tiptap + Yjs + hocuspocus, stored as Yjs binary) to
**plain Markdown as the literal source of truth**. Concurrent edits reconcile
with **git-style 3-way merge** (optimistic concurrency: a writer sends the base
version it started from; the server merges or returns a conflict), and a
lightweight **SSE presence** signal tells a user when someone else is in a body.
The web editor becomes **Crepe (Milkdown)**, a Markdown-native editor that runs
entirely in the browser; the server only stores and serves Markdown and does
text-level reconciliation. The editor sits behind a Markdown contract, so it is
swappable without touching storage or the API.

Custom content (the three mentions — role `@`, ticket `#`, emoji — and the
Excalidraw embed) is encoded with `remark-directive`
(`:mention[Name]{type=user id=…}`, `:ticket[#123]{id=…}`, `:emoji[name]`,
`:excalidraw[label]{id rev=N}`). The Excalidraw scene stays in its own `Drawing`
store, referenced by id. Free-form text colour is dropped; raw HTML and MDX are
not allowed in stored content.

This reverses the direction of the earlier external-API plan
([0006](0006-external-api-thin-rest-over-graphql-with-role-scoped-tokens.md)),
which assumed Yjs stayed canonical and Markdown was a derived projection.

## Why

- **Markdown is the AI-native format.** The public `/v1` API must let agents
  read and write document bodies as Markdown. Storing Markdown as the truth
  removes the fragile, correctness-critical CRDT→Markdown projection layer the
  API would otherwise need — what the agent reads and writes is the document,
  not a derived view.
- **We don't need real-time co-editing.** Orcha is a project-management tool;
  ticket and project bodies are edited one author at a time. Google-Docs-style
  multi-cursor collaboration was inherited complexity, not a product
  requirement. Optimistic concurrency + 3-way merge is the git-proven model for
  exactly this, and SSE presence keeps genuine conflicts in the rare tail.
- **Conflicts become inspectable.** A CRDT always merges, sometimes
  nonsensically; 3-way merge over Markdown text produces a predictable result
  and surfaces real overlaps as conflicts a human (or the LLM) can resolve.
- **Less to operate, less entropy.** Dropping the stack removes a whole service
  (the hocuspocus WebSocket server and its DigitalOcean component), the Yjs /
  y-prosemirror / hocuspocus / Tiptap-collaboration dependencies, the per-
  document JWT access tokens, and binary storage. Markdown history is diffable,
  giving a clear audit trail — including what an AI agent changed.
- **It's a clean-slate moment.** Orcha is pre-release with no production content,
  so the storage format changes with no data migration; only seed data is
  updated.

## Considered options

- **Keep Yjs canonical, Markdown as a round-trip-tested projection.** The prior
  plan. Rejected: it maintains two formats and a correctness-critical projection
  layer, still requires server-side CRDT↔Markdown conversion for the API, and
  keeps the hocuspocus service — all cost, little benefit once we accept that
  real-time co-editing isn't needed.
- **Migrate Tiptap v2→v3 for its official Markdown support.** Rejected for now:
  v3 is a broad migration of the whole editor + collaboration stack, and
  `@tiptap/markdown` is still beta. Out of scope; revisit only on editor merits.
- **A raw-Markdown source editor (CodeMirror).** Markdown-perfect but a code-
  style editing UX; poor fit for inline mentions, embeds, and images. Could
  return later as an optional "edit raw Markdown" toggle, not the primary editor.
- **Pessimistic locking instead of merge.** Rejected: locks fail in the cases
  that matter (stale locks, dropped connections, headless AI writes). Merge is
  the real safety net; presence is the soft UX layer on top of it.
- **A different markdown-native WYSIWYG (BlockNote, Lexical, Plate).** BlockNote's
  Markdown export is lossy; Lexical/Plate are full engine swaps with hand-written
  Markdown transformers. Crepe/Milkdown is Markdown-native and ProseMirror-based;
  its lack of full Node.js support doesn't bite because the server never runs the
  editor (it uses a plain `unified`/remark pipeline instead).

## Consequences

- Live multi-cursor co-editing and remote cursors are gone, replaced by presence
  + merge. Accepted for a PM tool.
- A conflict-resolution UX must exist for the rare overlapping-edit case.
- Custom nodes (mentions, Excalidraw) still need directive serializer rules and
  round-trip tests — the surviving slice of the conversion work.
- The web editor is swappable behind the Markdown contract; Crepe is the chosen
  starting bet, validated by a best-effort migration and a follow-up review.
- Mentions are resolved on write: an unambiguous `@name`/`#123` resolves to its
  id-bearing directive; an ambiguous or unknown one is left literal and reported
  as a warning — never silently guessed (consistent with the project's crash-
  early, no-silent-wrong-state philosophy).
- This unblocks the public `/v1` ticket body (Markdown in and out) and the write
  path, and removes the hocuspocus service, the CRDT/collaboration dependencies,
  and the document-access JWT queries.
- Delivered by PRD #36 as tracer slices (#37–#45): 3-way merge, Markdown
  analysis & mention resolution, body storage + repository, the body API,
  the Crepe editor and its custom nodes, SSE presence, the documentation/search
  re-wiring, and the teardown.
