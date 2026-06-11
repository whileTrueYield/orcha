# Read-only Markdown surfaces — design

**Parent PRD:** #36. **ADR:** `docs/adr/0007-markdown-bodies-source-of-truth-over-collaborative-crdt.md`.
**Branch:** slice PR into integration branch `feat/36-markdown-bodies` (NOT `main`).

Post-#42 follow-up slice (user-flagged): the Crepe editor and the directive node
plugins only serve the main body *editors* so far. Several surfaces render
body-like Markdown as blank or plain text. This slice gives every read-only
body surface a real Markdown render, reusing the editor stack.

## Decision: Crepe-readonly everywhere, two plugin presets

Considered and rejected:

- **Dedicated remark→React renderer** (`react-markdown` + directive component
  mapping): lighter per instance, but a second render path that must track the
  editor's typography and directive handling forever, plus a new dependency.
- **Hybrid** (Crepe for the ticket modal, renderer for comments): two read
  paths *and* the same body rendering differently in different places.

Chosen: **one render path** — a readonly Crepe instance everywhere, with the
per-comment weight addressed by a *light plugin preset* (no Excalidraw mount,
no `TicketCard`, no autocomplete). Crepe's BlockEdit feature is already
disabled globally for exactly this purpose.

Accepted trade-off: a ticket with many comments mounts many ProseMirror
instances. If that hurts in practice, lazy-mount-on-scroll is the escape hatch
(`// IDEA:` at the mount site), not a render-path change.

## Components

### 1. `MarkdownView.tsx` (new, `components/Markdown/`)

Sibling of `MarkdownEditor` — the read half of a predictable split: editors
edit, views view. Same mount/destroy lifecycle as `MarkdownEditor` (async
`create()`, error state re-thrown for `EditorErrorBoundary`), minus everything
edit-related: no `markdownUpdated` listener, no imperative handle, no `onDirty`.

```ts
interface Props {
  value: string;                 // Markdown source; remounts on change
  variant: "full" | "light";    // plugin preset (below)
  className?: string;
}
```

- Always `crepe.setReadonly(true)`.
- Crepe features OFF: `BlockEdit` (already off), `Toolbar` (no formatting
  toolbar on text selection), `Placeholder` (an empty view shows nothing).
  Verified against Milkdown 7.21.1 source: `Crepe.Feature.Toolbar` /
  `.Placeholder` exist (`packages/crepe/src/feature/index.ts:17`).
- Renders nothing (returns `null`) when `value` is empty/whitespace — callers
  don't need their own guard.
- Each usage site wraps it in `EditorErrorBoundary`.

### 2. `directiveViewerPlugins` — the light preset (`editorNodes.ts`)

| Plugin | full (`directiveEditorPlugins`) | light (`directiveViewerPlugins`) |
| --- | --- | --- |
| `directiveRemark` | ✓ | ✓ |
| `legacyDirectiveDowngrade` | ✓ | ✓ |
| `mentionSchema` / `emojiSchema` | ✓ | ✓ |
| soft-break preservation (`remark-breaks`) | — | ✓ |
| ticket: schema | `ticketSchema` | same `ticketSchema` |
| ticket: view | `TicketEmbed` (full `TicketCard`) | `TicketInlineEmbed` (light, below) |
| excalidraw: schema | `excalidrawSchema` | same `excalidrawSchema` |
| excalidraw: view | `ExcalidrawEmbed` (live drawing) | static chip (below) |
| `directiveAutocomplete` | ✓ | — (readonly) |

Both presets register schemas for both block directives — an unregistered
block directive crashes Milkdown's parser (hard-earned #42 gotcha). Only the
`$view` bindings differ, which the schema/view split in `ticketNode.tsx` /
`excalidrawNode.tsx` already supports.

### 3. `TicketInlineEmbed.tsx` (new, `components/Markdown/nodes/`)

The light view for `::ticket{id}`: a compact one-line block — `TicketIdTag`
(product code + localId + status colours + milestone star, already in
`components/tags/`) followed by the ticket title. Small dedicated query (code,
localId, status, milestone, title); click dispatches `showTicketEditModal`
(same Redux path as `TicketEmbed`; no router dependency, per
`reactNodeView.tsx`). Same unavailable/loading fallbacks as `TicketEmbed`,
sized down.

### 4. Excalidraw chip view

The light view for `::excalidraw[label]{id}`: a static, non-interactive chip
showing a drawing glyph + the label. Must NOT import `ExcalidrawEmbed` or
anything that pulls the Excalidraw bundle into a mount — avoiding that mount
cost is the point of the light preset.

### 5. Soft-break preservation (`remark-breaks`)

Comments and notes are chat-like: Enter should read as a line break (GitHub
comment semantics), and legacy plain-text bodies rely on it. CommonMark
renders a lone `\n` as a space, so the **light preset only** adds
`remark-breaks` (unified collective) via `$remark`, turning soft breaks into
hard break nodes at parse time. Full-preset bodies keep standard CommonMark
behaviour — they are documents, not chat.

New frontend dependency: `remark-breaks`. Install per the established
procedure: edit host `frontend/package.json`, regenerate `frontend/yarn.lock`
with yarn classic in a temp dir; compose watch rebuilds on lock change.

### 6. Unknown-directive downgrade (added during verification)

remark-directive turns ANY `:word` in user text into a directive node
(":happy" in a comment), and Milkdown crashes on directives without a schema.
`legacyDirectives.ts` (inline ticket/excalidraw only) was generalised into
`directiveDowngrade.ts`: a pure, Milkdown-free, jest-tested transformer in
BOTH presets that rewrites every unknown directive (inline, leaf, container)
to plain text. This also fixes the same latent crash in the main body editor.

Verified during pairing: block `::ticket{…}` only works on its own line —
that is the ADR-0007 grammar, by design. Mid-sentence ticket references stay
literal; an inline `:ticket` node is a possible follow-up feature (editor view
exists — `TicketInlineEmbed` — but needs backend `resolveMentions` alignment).

## Surface wiring

| Surface | Today | Change |
| --- | --- | --- |
| `TicketEditForm.tsx` (modal) | body not shown at all | add `body { markdown }` to fragment; render `MarkdownView variant="full"` under the title |
| `DraftTicketEditForm.tsx` (modal) | body not shown at all | same |
| `CommentModule.tsx` | `PlainTextView` | `MarkdownView variant="light"` |
| `CommentReplyModule.tsx` | `PlainTextView` | `MarkdownView variant="light"` |
| `TicketNote.tsx` / `TicketNotes.tsx` | `PlainTextView` | `MarkdownView variant="light"` |
| `TicketClosingNote.tsx` (×2 call sites) | `PlainTextView` | `MarkdownView variant="light"` |
| `IssueActionSupportNote.tsx` | `PlainTextView` | `MarkdownView variant="light"` |
| `TeamView.tsx` (`team.description`) | `PlainTextView` | **unchanged** — metadata one-liner, not a body |

`PlainTextView` stays (TeamView remains a caller) but stops being the interim
body display.

## Out of scope

- Composers: comments and notes are still written in plain textareas. Display
  renders Markdown from now on, so `*`/`#` typed today will format — accepted;
  the composer upgrade is the follow-up slice.
- #43 SSE presence, #45 Yjs/Tiptap teardown, #44 richer published-doc rendering.
- Loose-`@name` resolution on comments (unchanged, per PR #57).

## Testing

- Headless: the light preset's remark/mapping behaviour where testable without
  a DOM editor (sibling of the existing `components/Markdown/__tests__`
  patterns), via `make test-frontend`.
- The Crepe boundary itself is untestable in jsdom (per `MarkdownEditor.tsx`);
  each surface is verified in-app, paired: modal body render, comment with
  mention + standalone `#123`, multi-line legacy comment (breaks preserved),
  transition note, issue support note, and a body containing an Excalidraw
  directive rendered as chip without mounting the drawing.
