# Readable Merge-Conflict Resolution (Side-by-Side Picker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unreadable "git-markered Markdown dumped into the WYSIWYG editor" conflict UX with a side-by-side picker built from structured conflict regions.

**Architecture:** The backend `merge()` already walks an ordered list of diff3 regions; we surface that list over GraphQL (each region is either STABLE text or a CONFLICT with `ours`/`theirs` lines). On a 409 the frontend hides Crepe and renders a `ConflictResolver` that lets the user pick a side per clash, reassembles clean Markdown, and saves it through the normal `saveDocumentBody` path against the conflict's version. Conflict markers never reach the Markdown editor.

**Tech Stack:** TypeScript, Pothos GraphQL (backend), node-diff3, React + Apollo (frontend), mocha (backend tests), jest + Testing Library (frontend tests). Tests run via `make test-backend` / `make test-frontend` (never raw jest/mocha — ESM race).

**Spec:** `docs/superpowers/specs/2026-06-10-conflict-resolution-picker-design.md`

---

## File Structure

**Backend**
- `backend/src/markdown/merge.ts` — add `MergeRegionView` type + `regions` to the conflict result.
- `backend/src/markdown/bodyRepository.ts` — thread `regions` through `SaveResult`.
- `backend/src/models/documentBody/writeDocumentBody.ts` — map regions onto the GraphQL conflict shape.
- `backend/src/models/documentBody/entity.ts` — `ConflictRegionKind` enum, `ConflictRegion` type, `regions` field on `DocumentBodyConflict`.

**Frontend**
- `frontend/src/components/Markdown/ConflictResolver.tsx` — new isolated component + `reassembleBody`/`serverVersion` helpers.
- `frontend/src/components/Markdown/DocumentBody.tsx` — render the resolver on conflict; remove the markered-into-Crepe path.

**Tests**
- `backend/src/markdown/__tests__/merge.spec.ts`
- `backend/src/models/documentBody/__tests__/saveDocumentBody.spec.ts`
- `frontend/src/components/Markdown/__tests__/ConflictResolver.spec.tsx` (new)
- `frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx`

---

## Task 1: Backend — ordered regions from `merge()`

**Files:**
- Modify: `backend/src/markdown/merge.ts`
- Test: `backend/src/markdown/__tests__/merge.spec.ts`

- [ ] **Step 1: Write the failing tests**

Add these two tests inside the `describe("3-way markdown merge", …)` block in `merge.spec.ts`, after the existing `"reports a conflict identifying the region both sides changed"` test. The local `assemble` helper proves regions round-trip to each side:

```ts
  // Reassemble a region list by picking one side per conflict — the inverse of
  // how merge() split the body. Mirrors the frontend resolver's reassembly.
  const assemble = (
    regions: { kind: string; lines?: string[]; ours?: string[]; theirs?: string[] }[],
    pick: "ours" | "theirs",
  ) =>
    regions
      .flatMap((r) => (r.kind === "stable" ? r.lines! : r[pick]!))
      .join("\n");

  it("exposes ordered regions that reassemble to each side", () => {
    const base = "line one\nline two\nline three\n";
    const ours = "line one, ours\nline two\nline three\n";
    const theirs = "line one, theirs\nline two\nline three\n";

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.regions).toEqual([
      { kind: "conflict", ours: ["line one, ours"], theirs: ["line one, theirs"] },
      { kind: "stable", lines: ["line two", "line three", ""] },
    ]);
    expect(assemble(result.regions, "ours")).toBe(ours);
    expect(assemble(result.regions, "theirs")).toBe(theirs);
  });

  it("represents a one-sided deletion as a conflict region with an empty side", () => {
    const base = "x\nb\ny\n";
    const ours = "x\ny\n"; // we deleted b
    const theirs = "x\nb edited\ny\n"; // they edited b

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.regions).toEqual([
      { kind: "stable", lines: ["x"] },
      { kind: "conflict", ours: [], theirs: ["b edited"] },
      { kind: "stable", lines: ["y", ""] },
    ]);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `make test-backend TEST="exposes ordered regions"`
Expected: FAIL — `result.regions` is `undefined`.

- [ ] **Step 3: Implement `regions` in `merge.ts`**

Add the exported type after the `ConflictHunk` type (around line 41):

```ts
/**
 * The conflict body as an ordered list of regions, the structured form a UI
 * consumes to render a side-by-side picker (no git markers). A region is either
 * unchanged text shared by both sides, or an overlap where each side proposed
 * different lines (`ours`/`theirs`; an empty array means that side has nothing
 * there, e.g. a deletion). Reassembling stable lines + one chosen side per
 * conflict, joined by "\n", is the exact inverse of how merge split the body.
 */
export type MergeRegionView =
  | { kind: "stable"; lines: string[] }
  | { kind: "conflict"; ours: string[]; theirs: string[] };
```

Add `regions` to the conflict branch of `MergeResult` (modify the `clean: false` member):

```ts
export type MergeResult =
  | { clean: true; merged: string }
  | {
      clean: false;
      conflicts: ConflictHunk[];
      markered: string;
      regions: MergeRegionView[];
    };
```

Add a builder helper next to `renderMarkers` (after that function, ~line 103):

```ts
// The same region list renderMarkers walks, as the structured view a UI picks
// from. Built from the diff3 regions so it can never disagree with `markered`.
function toRegionViews(regions: MergeRegion<string>[]): MergeRegionView[] {
  return regions.map((region) =>
    hasConflict(region)
      ? { kind: "conflict", ours: region.conflict.a, theirs: region.conflict.b }
      : { kind: "stable", lines: region.ok ?? [] },
  );
}
```

Include it in the conflict return (modify the `if (conflicts.length > 0)` block, ~line 77):

```ts
  if (conflicts.length > 0) {
    return {
      clean: false,
      conflicts,
      markered: renderMarkers(regions),
      regions: toRegionViews(regions),
    };
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `make test-backend TEST="3-way markdown merge"`
Expected: PASS (all merge tests, including the two new ones).

> If the deletion test's exact region alignment differs from diff3's output, adjust the `toEqual` in that test to the actual structure (run with the failure diff visible) — the invariant that matters is one CONFLICT region with `ours: []`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/markdown/merge.ts backend/src/markdown/__tests__/merge.spec.ts
git commit -m "merge: expose ordered conflict regions alongside markered text"
```

---

## Task 2: Backend — thread `regions` through the body repository

**Files:**
- Modify: `backend/src/markdown/bodyRepository.ts`

This is a type-plumbing task verified by the compiler and by Task 3's GraphQL test (`saveBody` is reached only through this module per the ESM-in-specs rule, so it has no standalone spec).

- [ ] **Step 1: Import the region type**

Modify the merge import (line 28):

```ts
import { merge, type ConflictHunk, type MergeRegionView } from "./merge";
```

- [ ] **Step 2: Add `regions` to `SaveResult`**

In the `SaveResult` type, modify the `ok: false` member (around lines 41-50) to add `regions`:

```ts
  | {
      ok: false;
      conflicts: ConflictHunk[];
      // The whole body rewritten with git merge-file markers, for a caller that
      // wants to present the conflict as text rather than structured hunks.
      markered: string;
      // The conflict as an ordered region list, for a caller that renders a
      // structured picker instead of markered text.
      regions: MergeRegionView[];
      // The current stored version the rejected writer must re-read and rebase
      // onto (the ETag a 409 returns).
      version: number;
    };
```

- [ ] **Step 3: Pass `regions` from `saveBody`**

In `saveBody`, modify the conflict return (around lines 183-190):

```ts
  if (!reconciled.clean) {
    return {
      ok: false,
      conflicts: reconciled.conflicts,
      markered: reconciled.markered,
      regions: reconciled.regions,
      version: current.version,
    };
  }
```

- [ ] **Step 4: Verify it compiles**

Run: `make test-backend TEST="3-way markdown merge"`
Expected: PASS (no type errors; this also compiles the changed module).

- [ ] **Step 5: Commit**

```bash
git add backend/src/markdown/bodyRepository.ts
git commit -m "bodyRepository: carry conflict regions on the save result"
```

---

## Task 3: Backend — expose `regions` on the GraphQL conflict

**Files:**
- Modify: `backend/src/models/documentBody/entity.ts`
- Modify: `backend/src/models/documentBody/writeDocumentBody.ts`
- Test: `backend/src/models/documentBody/__tests__/saveDocumentBody.spec.ts`

- [ ] **Step 1: Write the failing test**

Open `saveDocumentBody.spec.ts`. First extend the mutation document the spec sends so it selects the new field. Find the `conflict { … }` selection in the test's mutation string and change it to:

```graphql
        conflict {
          markdown
          version
          regions {
            kind
            lines
            ours
            theirs
          }
        }
```

Then, in the conflict test (the one asserting `conflict.version` toBe 2 and `conflict.markdown` contains `"<<<<<<<"`), add region assertions after the existing expectations:

```ts
    const regions = res.data.saveDocumentBody.conflict.regions;
    // The structured regions reassemble (stable lines + one chosen side per
    // conflict) without any markers — exactly what the picker renders.
    expect(regions.some((r: { kind: string }) => r.kind === "CONFLICT")).toBe(true);
    const conflictRegion = regions.find(
      (r: { kind: string }) => r.kind === "CONFLICT",
    );
    expect(Array.isArray(conflictRegion.ours)).toBe(true);
    expect(Array.isArray(conflictRegion.theirs)).toBe(true);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `make test-backend TEST="saveDocumentBody"`
Expected: FAIL — `Cannot query field "regions"` (schema doesn't expose it yet).

- [ ] **Step 3: Add the GraphQL types in `entity.ts`**

After the `DocumentBodyConflictShape`/`DocumentBodyConflictRef` block (around line 54), insert the region type and update the conflict shape + object type. Replace the existing conflict block (lines 41-54) and add the region types:

```ts
// A conflict carries the git-markered Markdown (kept for the REST 409 body) and
// an ordered list of regions the UI renders as a side-by-side picker, plus the
// current stored version the writer must rebase onto. Returned without writing.
export type ConflictRegionShape = {
  kind: "STABLE" | "CONFLICT";
  lines: string[];
  ours: string[];
  theirs: string[];
};

export type DocumentBodyConflictShape = {
  markdown: string;
  version: number;
  regions: ConflictRegionShape[];
};

// value === name, so no reverse-mapping is needed when resolving the field.
export const ConflictRegionKindEnum = builder.enumType("ConflictRegionKind", {
  values: ["STABLE", "CONFLICT"] as const,
});

export const ConflictRegionRef =
  builder.objectRef<ConflictRegionShape>("ConflictRegion");

builder.objectType(ConflictRegionRef, {
  fields: (t) => ({
    kind: t.field({ type: ConflictRegionKindEnum, resolve: (r) => r.kind }),
    // Predictable shape: every field is always present. For a STABLE region
    // `lines` holds the text and `ours`/`theirs` are empty; for a CONFLICT it's
    // the reverse. An empty `ours`/`theirs` on a conflict means a deletion.
    lines: t.stringList({ resolve: (r) => r.lines }),
    ours: t.stringList({ resolve: (r) => r.ours }),
    theirs: t.stringList({ resolve: (r) => r.theirs }),
  }),
});

export const DocumentBodyConflictRef =
  builder.objectRef<DocumentBodyConflictShape>("DocumentBodyConflict");

builder.objectType(DocumentBodyConflictRef, {
  fields: (t) => ({
    markdown: t.exposeString("markdown"),
    version: t.exposeInt("version"),
    regions: t.field({
      type: [ConflictRegionRef],
      resolve: (r) => r.regions,
    }),
  }),
});
```

- [ ] **Step 4: Map regions in `writeDocumentBody.ts`**

Add an import for the region view type and the GraphQL shape. Modify the import block (around lines 28-31):

```ts
import type { MergeRegionView } from "../../markdown/merge";
import type {
  ConflictRegionShape,
  MentionWarningShape,
  SaveDocumentBodyResultShape,
} from "./entity";
```

Add a mapper next to `toWarning` (after that function, ~line 95):

```ts
// Flatten the merge's discriminated region view into the predictable GraphQL
// shape (every field present; uppercase kind matching the enum's wire value).
function toConflictRegion(view: MergeRegionView): ConflictRegionShape {
  return view.kind === "conflict"
    ? { kind: "CONFLICT", lines: [], ours: view.ours, theirs: view.theirs }
    : { kind: "STABLE", lines: view.lines, ours: [], theirs: [] };
}
```

Include `regions` in the conflict return (modify the `if (!result.ok)` block, ~lines 114-120):

```ts
  if (!result.ok) {
    return {
      body: null,
      conflict: {
        markdown: result.markered,
        version: result.version,
        regions: result.regions.map(toConflictRegion),
      },
      warnings: [],
    };
  }
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `make test-backend TEST="saveDocumentBody"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/models/documentBody/entity.ts backend/src/models/documentBody/writeDocumentBody.ts backend/src/models/documentBody/__tests__/saveDocumentBody.spec.ts
git commit -m "documentBody: expose structured conflict regions over GraphQL"
```

---

## Task 4: Frontend — extend the save query + regenerate types

**Files:**
- Modify: `frontend/src/components/Markdown/DocumentBody.tsx` (the `SAVE_DOCUMENT_BODY` document only)

- [ ] **Step 1: Add `regions` to the mutation document**

In `DocumentBody.tsx`, modify the `conflict { … }` selection inside `SAVE_DOCUMENT_BODY` (around lines 52-55):

```ts
      conflict {
        markdown
        version
        regions {
          kind
          lines
          ours
          theirs
        }
      }
```

- [ ] **Step 2: Regenerate the GraphQL TypeScript types**

Run: `make types`
Expected: `frontend/src/types/graphql.ts` regenerates with no errors and now contains `ConflictRegion` and an enum `ConflictRegionKind` (members `Stable = 'STABLE'`, `Conflict = 'CONFLICT'`).

- [ ] **Step 3: Verify the new types exist**

Run: `grep -n "ConflictRegionKind\|ConflictRegion " frontend/src/types/graphql.ts | head`
Expected: matches showing the enum and the `ConflictRegion` type.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Markdown/DocumentBody.tsx frontend/src/types/graphql.ts
git commit -m "frontend: select conflict regions in the save mutation"
```

---

## Task 5: Frontend — `ConflictResolver` component + reassembly

**Files:**
- Create: `frontend/src/components/Markdown/ConflictResolver.tsx`
- Test: `frontend/src/components/Markdown/__tests__/ConflictResolver.spec.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/Markdown/__tests__/ConflictResolver.spec.tsx`:

```tsx
/**
 * Tests for ConflictResolver — the side-by-side picker shown on a 409. Covers
 * pure reassembly (stable lines + chosen side per conflict) and the UI gate
 * (Resolve & Save stays disabled until every clash has a choice).
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ConflictResolver, {
  reassembleBody,
  serverVersion,
} from "../ConflictResolver";
import { ConflictRegion, ConflictRegionKind } from "types/graphql";

const region = (over: Partial<ConflictRegion>): ConflictRegion => ({
  __typename: "ConflictRegion",
  kind: ConflictRegionKind.Stable,
  lines: [],
  ours: [],
  theirs: [],
  ...over,
});

const REGIONS: ConflictRegion[] = [
  region({ kind: ConflictRegionKind.Conflict, ours: ["mine"], theirs: ["theirs"] }),
  region({ kind: ConflictRegionKind.Stable, lines: ["shared", ""] }),
];

describe("reassembleBody", () => {
  it("keeps the chosen side per conflict and all stable lines", () => {
    expect(reassembleBody(REGIONS, { 0: "ours" })).toBe("mine\nshared\n");
    expect(reassembleBody(REGIONS, { 0: "theirs" })).toBe("theirs\nshared\n");
    expect(reassembleBody(REGIONS, { 0: "both" })).toBe("mine\ntheirs\nshared\n");
  });
});

describe("serverVersion", () => {
  it("reproduces the current server body by taking theirs everywhere", () => {
    expect(serverVersion(REGIONS)).toBe("theirs\nshared\n");
  });
});

describe("ConflictResolver", () => {
  it("disables Resolve & Save until every conflict is chosen, then emits markdown", () => {
    const onResolve = jest.fn();
    render(
      <ConflictResolver
        regions={REGIONS}
        saving={false}
        onResolve={onResolve}
        onCancel={() => {}}
      />,
    );

    const resolve = screen.getByText("Resolve & Save");
    expect(resolve).toBeDisabled();

    fireEvent.click(screen.getByText("Keep yours"));
    expect(resolve).toBeEnabled();

    fireEvent.click(resolve);
    expect(onResolve).toHaveBeenCalledWith("mine\nshared\n");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `make test-frontend TEST="ConflictResolver"`
Expected: FAIL — cannot find module `../ConflictResolver`.

- [ ] **Step 3: Implement `ConflictResolver.tsx`**

Create `frontend/src/components/Markdown/ConflictResolver.tsx`:

```tsx
/**
 * ConflictResolver — the side-by-side picker shown when saveDocumentBody returns
 * a 409. It renders the server's structured conflict regions (NOT git-markered
 * Markdown, which a WYSIWYG editor mis-parses): unchanged text as muted context,
 * and each overlap as "Your version" / "Their version" monospace panels with
 * Keep yours / Keep theirs / Keep both. Once every clash has a choice, it
 * reassembles clean Markdown and hands it to `onResolve` to save.
 *
 * Exports: ConflictResolver (default), reassembleBody, serverVersion.
 *
 * No editor dependency, so it is fully testable in jsdom.
 */
import { useState } from "react";
import cn from "classnames";
import { ConflictRegion, ConflictRegionKind } from "types/graphql";
import { Button } from "components/fields/Button";

export type RegionChoice = "ours" | "theirs" | "both";

// Reassemble the body from a choice per conflict region. The inverse of how the
// backend merge() split the body on "\n", so a full "ours" pick round-trips to
// our submission woven with the stable text, byte-for-byte.
export function reassembleBody(
  regions: ConflictRegion[],
  choices: Record<number, RegionChoice>,
): string {
  const lines: string[] = [];
  regions.forEach((region, index) => {
    if (region.kind === ConflictRegionKind.Stable) {
      lines.push(...region.lines);
      return;
    }
    const choice = choices[index];
    if (choice === "ours") lines.push(...region.ours);
    else if (choice === "theirs") lines.push(...region.theirs);
    else lines.push(...region.ours, ...region.theirs); // "both": ours then theirs
  });
  return lines.join("\n");
}

// The current stored body: the 3-way merge labels the server's side `theirs`, so
// taking theirs everywhere reproduces it — used to "discard my changes" with no
// extra round-trip.
export function serverVersion(regions: ConflictRegion[]): string {
  const choices: Record<number, RegionChoice> = {};
  regions.forEach((region, index) => {
    if (region.kind === ConflictRegionKind.Conflict) choices[index] = "theirs";
  });
  return reassembleBody(regions, choices);
}

interface Props {
  regions: ConflictRegion[];
  saving: boolean;
  onResolve: (markdown: string) => void;
  onCancel: () => void;
}

const renderLines = (lines: string[]) =>
  lines.length ? lines.join("\n") : "(removed)";

const ConflictResolver: React.FC<Props> = ({
  regions,
  saving,
  onResolve,
  onCancel,
}) => {
  const [choices, setChoices] = useState<Record<number, RegionChoice>>({});

  const choose = (index: number, choice: RegionChoice) =>
    setChoices((prev) => ({ ...prev, [index]: choice }));

  // Every conflicting region must have a choice before we can produce a body.
  const allChosen = regions.every(
    (region, index) =>
      region.kind === ConflictRegionKind.Stable || choices[index] !== undefined,
  );

  return (
    <div className="space-y-3 p-4">
      {regions.map((region, index) => {
        if (region.kind === ConflictRegionKind.Stable) {
          const text = region.lines.join("\n");
          return text.trim() ? (
            <p
              key={index}
              className="whitespace-pre-wrap text-sm text-gray-500"
            >
              {text}
            </p>
          ) : null;
        }

        const choice = choices[index];
        return (
          <div
            key={index}
            className="rounded-md border border-amber-200 bg-amber-50/40 p-3"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-700">
              You both edited this
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <ConflictPanel
                label="Your version"
                keepLabel="Keep yours"
                lines={region.ours}
                selected={choice === "ours"}
                onSelect={() => choose(index, "ours")}
              />
              <ConflictPanel
                label="Their version"
                keepLabel="Keep theirs"
                lines={region.theirs}
                selected={choice === "theirs"}
                onSelect={() => choose(index, "theirs")}
              />
            </div>
            <div className="mt-2 flex justify-center">
              <Button
                type="button"
                btnSize="xsmall"
                btnType={choice === "both" ? "primary" : "secondaryWhite"}
                onClick={() => choose(index, "both")}
              >
                Keep both
              </Button>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-x-2 pt-2">
        <Button
          type="button"
          btnType="secondaryWhite"
          btnSize="small"
          disabled={saving}
          onClick={onCancel}
        >
          Discard my changes
        </Button>
        <Button
          type="button"
          btnType="primary"
          btnSize="small"
          disabled={!allChosen || saving}
          onClick={() => onResolve(reassembleBody(regions, choices))}
        >
          {saving ? "Saving…" : "Resolve & Save"}
        </Button>
      </div>
    </div>
  );
};

const ConflictPanel: React.FC<{
  label: string;
  keepLabel: string;
  lines: string[];
  selected: boolean;
  onSelect: () => void;
}> = ({ label, keepLabel, lines, selected, onSelect }) => (
  <div
    className={cn(
      "rounded border p-2",
      selected ? "border-brand-500 ring-1 ring-brand-400" : "border-gray-200",
    )}
  >
    <div className="mb-1 text-xs font-medium text-gray-600">{label}</div>
    <pre className="mb-2 whitespace-pre-wrap break-words font-mono text-xs text-gray-800">
      {renderLines(lines)}
    </pre>
    <Button
      type="button"
      btnSize="xsmall"
      btnType={selected ? "primary" : "secondaryWhite"}
      onClick={onSelect}
    >
      {selected ? "Selected" : keepLabel}
    </Button>
  </div>
);

export default ConflictResolver;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `make test-frontend TEST="ConflictResolver"`
Expected: PASS (reassembleBody, serverVersion, and the component test).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Markdown/ConflictResolver.tsx frontend/src/components/Markdown/__tests__/ConflictResolver.spec.tsx
git commit -m "frontend: add ConflictResolver side-by-side picker"
```

---

## Task 6: Frontend — render the resolver from `DocumentBody`

**Files:**
- Modify: `frontend/src/components/Markdown/DocumentBody.tsx`
- Test: `frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx`

- [ ] **Step 1: Update the existing conflict tests + add a resolve test**

In `TicketBody.spec.tsx`:

(a) Add `regions` to `saveConflictMock`'s `conflict` result (find `saveConflictMock`, add inside `conflict`):

```ts
          regions: [
            {
              __typename: "ConflictRegion",
              kind: "CONFLICT",
              lines: [],
              ours: ["mine"],
              theirs: ["theirs"],
            },
            {
              __typename: "ConflictRegion",
              kind: "STABLE",
              lines: ["shared", ""],
              ours: [],
              theirs: [],
            },
          ],
```

(b) Replace the body of the test `"shows a conflict banner and reloads markered text on a 409"` (rename it) so it asserts the resolver renders instead of a markered editor seed:

```ts
it("shows the conflict resolver instead of markered text on a 409", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveConflictMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  // The picker is shown with both sides; no git markers anywhere.
  expect(await screen.findByText("Your version")).toBeInTheDocument();
  expect(screen.getByText("Their version")).toBeInTheDocument();
  expect(screen.getByText("mine")).toBeInTheDocument();
  expect(screen.getByText("theirs")).toBeInTheDocument();
  expect(screen.queryByText(/<<<<<<</)).toBeNull();
  // The editor (and its seed) is hidden while resolving.
  expect(screen.queryByTestId("seed")).toBeNull();
});
```

(c) Add `regions` to `saveConflictAfterWarnMock`'s `conflict` result (same shape as in (a)).

(d) Add a new test for the full resolve flow, after the conflict test:

```ts
const resolveSaveMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Ticket,
      documentId: 7,
      markdown: "mine\nshared\n",
      baseVersion: 5, // the version saveConflictMock returned
    },
  },
  result: {
    data: {
      saveDocumentBody: {
        __typename: "SaveDocumentBodyResult",
        body: {
          __typename: "DocumentBody",
          markdown: "mine\nshared\n",
          version: 6,
        },
        conflict: null,
        warnings: [],
      },
    },
  },
};

it("resolves a conflict by picking a side and saves against the conflict version", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveConflictMock, resolveSaveMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");
  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  fireEvent.click(await screen.findByText("Keep yours"));
  fireEvent.click(screen.getByText("Resolve & Save"));

  // Back in the editor, reseeded with the resolved body.
  expect(await screen.findByText("Saved")).toBeInTheDocument();
  expect(screen.getByTestId("seed")).toHaveTextContent("mine");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `make test-frontend TEST="conflict"`
Expected: FAIL — the resolver isn't wired in yet (the editor still seeds markered text; "Your version" not found).

- [ ] **Step 3: Wire the resolver into `DocumentBody.tsx`**

(a) Add imports (after the `bodyDraftStorage` import, ~line 33):

```ts
import ConflictResolver, {
  serverVersion,
} from "components/Markdown/ConflictResolver";
import { ConflictRegion, DocumentBodyConflict } from "types/graphql";
```

(Also add `MentionWarning` is already imported; keep it.)

(b) Replace the conflict boolean state. Change line 116:

```ts
  const [conflict, setConflict] = useState(false);
```

to:

```ts
  // Non-null while resolving a 409: the server's structured regions, rendered as
  // the side-by-side picker in place of the editor.
  const [conflictRegions, setConflictRegions] = useState<
    ConflictRegion[] | null
  >(null);
```

(c) Add two shared helpers and the conflict handlers immediately before `onSave` (replacing the need for scattered setters). Insert after the `save` mutation hook (~line 122):

```ts
  // Enter conflict mode: hide the editor and show the resolver built from the
  // server's regions. The markered string is never fed to Crepe.
  const enterConflict = (c: DocumentBodyConflict) => {
    clearBodyDraft(documentType, documentId);
    baseVersionRef.current = c.version;
    setConflictRegions(c.regions);
    setWarnings([]);
    setDirty(false);
    setStatus("");
  };

  // Apply a clean (written) save. `reseed` remounts the editor with the persisted
  // body — required when the editor was hidden (conflict just resolved) or the
  // stored content diverged from our submission (server merge / mention resolve).
  const applyCleanSave = (
    body: { markdown: string; version: number },
    warns: MentionWarning[],
    reseed: boolean,
  ) => {
    clearBodyDraft(documentType, documentId);
    lastSavedRef.current = body.markdown;
    baseVersionRef.current = body.version;
    if (reseed) {
      setSeed(body.markdown);
      setSeedId((n) => n + 1);
    }
    setConflictRegions(null);
    setWarnings(warns);
    setDirty(false);
    setStatus("Saved");
  };
```

(d) Replace the whole `onSave` body (lines ~124-171) with:

```ts
  const onSave = async () => {
    const markdown = editorRef.current?.getMarkdown() ?? "";
    const { data } = await save({
      variables: {
        documentType,
        documentId,
        markdown,
        baseVersion: baseVersionRef.current,
      },
    });
    const result = data?.saveDocumentBody;
    if (!result) return;
    if (result.conflict) return enterConflict(result.conflict);
    // The stored body can differ from what we sent (server-side merge or mention
    // resolution); reseed only then so a plain fast-forward keeps the cursor.
    applyCleanSave(result.body!, result.warnings, result.body!.markdown !== markdown);
  };

  // Save the user's per-region choices, then leave conflict mode. A fresh 409
  // (yet another writer landed) simply re-enters the resolver with new regions.
  const onResolveConflict = async (resolved: string) => {
    const { data } = await save({
      variables: {
        documentType,
        documentId,
        markdown: resolved,
        baseVersion: baseVersionRef.current,
      },
    });
    const result = data?.saveDocumentBody;
    if (!result) return;
    if (result.conflict) return enterConflict(result.conflict);
    applyCleanSave(result.body!, result.warnings, true); // editor was hidden
  };

  // Abandon my edits and keep the current server version (the "theirs" side),
  // with no extra round-trip — we already have it in the regions.
  const onCancelConflict = () => {
    if (!conflictRegions) return;
    const current = serverVersion(conflictRegions);
    clearBodyDraft(documentType, documentId);
    lastSavedRef.current = current;
    setSeed(current);
    setSeedId((n) => n + 1);
    setConflictRegions(null);
    setWarnings([]);
    setDirty(false);
    setStatus("");
  };
```

(e) In `onDiscard`, replace `setConflict(false);` with `setConflictRegions(null);`.

(f) In `onKeyDown`, ignore the shortcut while resolving — add after the `if (readOnly) return;` line:

```ts
    if (conflictRegions) return; // the resolver owns saving during a conflict
```

(g) Update the JSX. Replace the conflict banner condition and the editor/footer block (lines ~203-259). The banner now keys off `conflictRegions` and reads differently; the editor + footer render only when NOT resolving, and the resolver renders when resolving:

```tsx
      {conflictRegions && (
        <div role="alert" className="m-2 rounded bg-amber-50 p-2 text-amber-800">
          This body was edited elsewhere. Choose which version to keep below.
        </div>
      )}
      {warnings.length > 0 && (
        <div role="status" className="m-2 rounded bg-blue-50 p-2 text-blue-800">
          Some references couldn&apos;t be resolved:{" "}
          {warnings.map((w) => w.reference).join(", ")}
        </div>
      )}
      {conflictRegions ? (
        <ConflictResolver
          regions={conflictRegions}
          saving={loading}
          onResolve={onResolveConflict}
          onCancel={onCancelConflict}
        />
      ) : (
        <>
          <EditorErrorBoundary resetKey={documentId}>
            <MarkdownEditor
              key={seedId}
              ref={editorRef}
              value={seed}
              readOnly={readOnly}
              onDirty={() => {
                setDirty(true);
                setStatus("");
                writeBodyDraft(documentType, documentId, {
                  markdown: editorRef.current?.getMarkdown() ?? "",
                  baseVersion: baseVersionRef.current,
                });
              }}
            />
          </EditorErrorBoundary>
          {!readOnly && (
            <div className="flex items-center justify-end gap-x-2 py-2 px-4">
              {status && (
                <span className="mr-auto text-sm text-gray-500">{status}</span>
              )}
              <Button
                type="button"
                btnType="secondaryWhite"
                btnSize="small"
                disabled={!dirty || loading}
                onClick={onDiscard}
              >
                Discard
              </Button>
              <Button
                type="button"
                btnType="primary"
                btnSize="small"
                disabled={!dirty || loading}
                onClick={onSave}
              >
                {loading ? "Saving…" : "Save"}
              </Button>
            </div>
          )}
        </>
      )}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `make test-frontend TEST="conflict"`
Expected: PASS — the conflict + resolve tests.

- [ ] **Step 5: Run the whole frontend suite + typecheck**

Run: `make test-frontend`
Expected: all suites pass (the earlier merge-display and Cmd+S tests still green).

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Markdown/DocumentBody.tsx frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx
git commit -m "frontend: resolve conflicts with the side-by-side picker, not markers"
```

---

## Task 7: Final verification

- [ ] **Step 1: Backend suite**

Run: `make test-backend`
Expected: all backend tests pass.

- [ ] **Step 2: Frontend suite**

Run: `make test-frontend`
Expected: all frontend tests pass.

- [ ] **Step 3: Manual smoke (the untestable Crepe boundary)**

In the running app, open a ticket body, edit it, and in a second session edit the same region and save first. Save from the first session → the picker appears with Your/Their versions (no giant heading, no markers). Pick a side → Resolve & Save → the editor returns showing the resolved body. Try "Keep both" and "Discard my changes" too.

> Per project convention the Crepe editor is verified manually, not in jsdom. Don't run docker/editor automation here.

---

## Notes for the implementer

- **Run tests via `make`**, never raw `jest`/`mocha` — the ESM dep race produces fake failures otherwise.
- **ESM-in-specs:** `node-diff3` is ESM-only; it's only ever imported through `merge.ts`. Don't import it (or `merge`'s ESM transitive deps) directly in a `*.spec.ts` — go through the `merge` module, as the existing specs do.
- **Predictable shapes:** `ConflictRegion` always has all four fields; STABLE regions carry `lines` with empty `ours`/`theirs`, CONFLICT regions the reverse. Don't make fields nullable.
- **`base` is intentionally omitted** from the region surface (YAGNI for v1 — no UI shows it).
- This plan does not touch the REST `/v1` surface; it still uses `markered` for its 409 body.
```
