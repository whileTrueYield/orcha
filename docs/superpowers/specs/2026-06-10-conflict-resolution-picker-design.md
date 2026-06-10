# Readable merge-conflict resolution (side-by-side picker) — design

**ADR:** `docs/adr/0007-markdown-bodies-source-of-truth-over-collaborative-crdt.md`.
**Issue:** none yet. **Branch:** TBD off `main`.

## Problem

When `saveDocumentBody` returns a 409, today's UI seeds the **git-markered Markdown**
(`<<<<<<< ours … ======= … >>>>>>> theirs`) straight into the Crepe WYSIWYG editor.
Those marker characters are *also* Markdown syntax, so Crepe mis-parses them:

- `=======` on its own line is a **setext H1 underline** → the whole "ours" block renders
  as one giant heading.
- `>>>>>>>` reads as nested **blockquotes** (the vertical bars beside "theirs").
- Stray bold/strikethrough is more of the same collision.

The result is unreadable and unusable, especially for a non-technical user. You cannot
reliably render conflict-markered Markdown through a Markdown WYSIWYG editor — the fix is
to never put markers in the editor at all.

## Scope decisions (confirmed with user)

- **Side-by-side picker.** On conflict, hide the editor and show a dedicated resolver built
  from structured conflict regions (not markered text).
- **Plain-monospace panels.** Each side ("Your version" / "Their version") renders as raw
  Markdown source in a monospace block — unambiguous about exactly what will be saved.
- **Choices in v1:** Keep yours / Keep theirs / Keep both. **No free-form manual editing**
  in v1 (add later if needed).
- **STABLE context** (unchanged surrounding text) renders as muted normal text, only the
  clashing panels are monospace.
- **"Keep both"** order is yours-then-theirs.

## Core idea

Conflict-markered Markdown never reaches Crepe. The backend already walks an ordered list of
diff3 regions inside `merge()`; it just collapses them into the `markered` string and an
unused `conflicts` array. We surface the **ordered region list** as the single structured
source the picker consumes; the user picks a side per clashing region; the frontend
reassembles clean Markdown and saves it through the normal `saveDocumentBody` path against
the conflict's `version`.

## 1. Data model — the enabling change

A region is one of two shapes, discriminated **explicitly** (empty arrays are ambiguous — a
side can legitimately be empty when one writer deleted lines):

```graphql
enum ConflictRegionKind { STABLE CONFLICT }

type ConflictRegion {
  kind: ConflictRegionKind!
  lines:  [String!]!   # STABLE: the unchanged lines;  [] for CONFLICT
  ours:   [String!]!   # CONFLICT: your side;          [] for STABLE
  theirs: [String!]!   # CONFLICT: their side;         [] for STABLE
}

type DocumentBodyConflict {
  markdown: String!              # markered text — KEPT (REST 409 body still uses it)
  version: Int!
  regions: [ConflictRegion!]!    # NEW
}
```

`regions` is added as the canonical ordered representation; `markered` stays (the `/v1` REST
surface still uses it for its `409` body). The internal **`conflicts` array is kept** — it is
asserted directly by `merge.spec`, so removing it would churn working tests for no gain. The
GraphQL surface exposes only `regions` (+ `markdown`/`version`); `conflicts` stays internal.

**Plumbing:** `markdown/merge.ts` (return `regions`) → `markdown/bodyRepository.ts`
(`SaveResult` conflict branch) → `models/documentBody/writeDocumentBody.ts` (map onto the
conflict shape) → `models/documentBody/entity.ts` (new `ConflictRegion` type + `regions`
field). The `saveDocumentBody.resolver` is unchanged (shape passthrough). REST is untouched.

## 2. Reassembly (pure — the part to test hardest)

Walk regions in order; for `STABLE` append `lines`, for `CONFLICT` append the chosen side
(`both` = `ours` then `theirs`); `join("\n")`. This is the exact inverse of how `merge` split
the body on `"\n"`, so a "keep yours everywhere" resolution round-trips to your version woven
with their stable text, byte-for-byte. The same reassembly logic is what the frontend runs on
the user's choices.

## 3. Components

- **`components/Markdown/ConflictResolver.tsx`** (new, isolated, no Crepe):
  - Props: `{ regions, saving, onResolve(markdown), onCancel }`.
  - State: a `choice` (`"ours" | "theirs" | "both"`) per CONFLICT region, keyed by index.
  - Renders regions in order: STABLE → muted context; CONFLICT → two monospace panels with
    Keep yours / Keep theirs / Keep both.
  - "Resolve & Save" is enabled only once **every** CONFLICT region has a choice; on click it
    reassembles the Markdown and calls `onResolve`.
  - Fully unit-testable in jsdom (no editor dependency).

- **`components/Markdown/DocumentBody.tsx`** (modified):
  - Replace the "seed markered text into Crepe + amber banner" path with: store
    `conflictRegions` in state. While set, render `<ConflictResolver>` **instead of** the
    `MarkdownEditor`.
  - `onResolve(markdown)` → call `save` with `baseVersion = conflict.version`. Success exits
    conflict mode and reseeds the editor with the clean saved body (reuses the existing
    "reseed when persisted differs" logic). A fresh conflict during that save simply re-enters
    the resolver with new regions.
  - The markered string is no longer fed to the editor anywhere.

## 4. Flow

edit → Save → 409 → editor hidden, resolver shown → pick a side per clash → Resolve & Save →
clean body persisted (fast-forward against `conflict.version`) → back to the normal editor
showing the merged result.

## 5. Testing

- `markdown/__tests__/merge.spec` (backend): regions reassemble to ours / theirs / both
  correctly, including an empty-side (deletion) region.
- `models/documentBody/__tests__/saveDocumentBody.spec`: conflict result includes the ordered
  regions.
- `components/Markdown/__tests__/ConflictResolver.spec` (frontend): reassembly correctness;
  "Resolve & Save" disabled until all clashes chosen; emits the expected Markdown.
- `pages/ticket/TicketView/__tests__/TicketBody.spec`: a conflict now renders the resolver
  (not a markered editor seed); resolving saves with `conflict.version`.

## Out of scope (v1)

- Free-form manual editing of a conflicting region.
- Showing the common-ancestor (`base`) text in the UI (available via history).
- Three-way visual diff/highlighting within a panel.
