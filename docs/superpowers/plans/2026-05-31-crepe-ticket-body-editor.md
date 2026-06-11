# Crepe Ticket Body Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the collaborative Tiptap/Yjs ticket body editor with a Crepe (Milkdown) Markdown editor that reads/writes through the #40 body API, with an explicit Save button and a 409 conflict-resolution path.

**Architecture:** A presentational `MarkdownEditor` React wrapper owns a Crepe instance (mount/unmount, content seeding, latest-markdown tracking). A `TicketBody` container loads `ticket.body { markdown version }`, holds the base version, and saves via the `saveDocumentBody` mutation — fast-forward on success, reseed-with-markers on 409. Crepe is the untestable boundary (manual verification); the container is built test-first with the editor mocked.

**Tech Stack:** React 18 + Vite, Apollo Client 3, `@milkdown/crepe`, Jest + Testing Library. Frontend GraphQL types are hand-maintained in `frontend/src/types/graphql.ts` (no codegen).

**Spec:** `docs/superpowers/specs/2026-05-31-crepe-ticket-body-editor-design.md`. **Issue:** #41. **Branch:** `feat/41-crepe-editor` → `feat/36-markdown-bodies`.

**Conventions for every task below:**
- Run all commands from `/Users/sms/Code/orcha`.
- Frontend tests: `yarn --cwd frontend test <pattern>` (Jest; `TZ=UTC`).
- Type/build check: `yarn --cwd frontend build` (runs `tsc && vite build`). For a faster type-only check: `yarn --cwd frontend exec tsc --noEmit`.
- Commit messages: imperative, scoped to the task. Commit only the files the task touched.

---

### Task 1: Add the body GraphQL types + Crepe dependency (additive, nothing removed yet)

**Files:**
- Modify: `frontend/src/types/graphql.ts` (enum block near line 704; `Mutation` type near line 711; `Ticket` type near line 3726)
- Modify: `frontend/package.json` (dependency added by yarn)

- [ ] **Step 1: Install Crepe**

Run:
```bash
yarn --cwd frontend add @milkdown/crepe
```
Expected: resolves a Milkdown 7.x `@milkdown/crepe` version; `package.json` + `yarn.lock` updated. If peer-dependency warnings about `@milkdown/kit` appear, also run `yarn --cwd frontend add @milkdown/kit`.

- [ ] **Step 2: Add the new types to `frontend/src/types/graphql.ts`**

Add this enum next to the other `export enum` declarations (e.g. just after `ModelStage` around line 709):
```ts
export enum DocumentBodyType {
  Ticket = 'TICKET',
  Project = 'PROJECT',
  Documentation = 'DOCUMENTATION'
}
```

Add these object types near the `Ticket` type (around line 3726):
```ts
export type DocumentBody = {
  __typename?: 'DocumentBody';
  markdown: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type DocumentBodyConflict = {
  __typename?: 'DocumentBodyConflict';
  markdown: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type MentionWarning = {
  __typename?: 'MentionWarning';
  kind: Scalars['String']['output'];
  reference: Scalars['String']['output'];
  matches?: Maybe<Scalars['Int']['output']>;
};

export type SaveDocumentBodyResult = {
  __typename?: 'SaveDocumentBodyResult';
  body?: Maybe<DocumentBody>;
  conflict?: Maybe<DocumentBodyConflict>;
  warnings: Array<MentionWarning>;
};
```

- [ ] **Step 3: Add `body` to the `Ticket` type**

Inside `export type Ticket = {` (line 3726), add (leave the existing `description` field in place for now — it is removed in Task 6):
```ts
  body: DocumentBody;
```

- [ ] **Step 4: Add the mutation field to the `Mutation` type**

Inside `export type Mutation = {` (line 711), add the field and its args type. Add the field:
```ts
  saveDocumentBody: SaveDocumentBodyResult;
```
And add the matching args type next to the other `MutationXArgs` types:
```ts
export type MutationSaveDocumentBodyArgs = {
  baseVersion: Scalars['Int']['input'];
  documentId: Scalars['Int']['input'];
  documentType: DocumentBodyType;
  markdown: Scalars['String']['input'];
};
```

- [ ] **Step 5: Type-check**

Run: `yarn --cwd frontend exec tsc --noEmit`
Expected: PASS (additive only — no existing code references the new types yet, and `description` is untouched).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types/graphql.ts frontend/package.json frontend/yarn.lock
git commit -m "Add Crepe dep and body GraphQL types to the frontend"
```

---

### Task 2: Build the `MarkdownEditor` Crepe wrapper (manual-verify boundary)

Crepe is ESM + real `contenteditable`; it is not unit-tested in jsdom. This task is build + type-check; behavior is verified manually in Task 5.

**Files:**
- Create: `frontend/src/components/Markdown/MarkdownEditor.tsx`

- [ ] **Step 1: Write the wrapper**

```tsx
/**
 * MarkdownEditor — a thin React wrapper around a Crepe (Milkdown) instance.
 *
 * Crepe seeds its content once at construction (there is no setMarkdown), so we
 * remount on a `value` change (initial load, or conflict-markered text after a
 * 409). The latest markdown is tracked from Crepe's markdownUpdated listener and
 * exposed via an imperative `getMarkdown()` so the container reads it only at
 * save time — Crepe stays uncontrolled and the parent never re-renders per
 * keystroke.
 *
 * This component is the untestable boundary (ESM editor + contenteditable); it
 * is verified manually in the running app, not in jsdom.
 */
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface MarkdownEditorHandle {
  getMarkdown: () => string;
}

interface Props {
  value: string;
  readOnly?: boolean;
  onDirty?: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, Props>(
  ({ value, readOnly = false, onDirty }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const latestRef = useRef<string>(value);

    useImperativeHandle(
      ref,
      () => ({ getMarkdown: () => latestRef.current }),
      [],
    );

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      latestRef.current = value;
      const crepe = new Crepe({ root: host, defaultValue: value });
      crepe.setReadonly(readOnly);
      crepe.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
          latestRef.current = markdown;
          onDirty?.();
        });
      });

      // create() is async; only destroy after it has resolved so we never tear
      // down a half-initialised editor.
      const ready = crepe.create();
      return () => {
        ready.then(() => crepe.destroy());
      };
      // Remount when the seeded content or the readonly flag changes. onDirty is
      // intentionally excluded — it must not trigger a remount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, readOnly]);

    return <div ref={hostRef} />;
  },
);

export default MarkdownEditor;
```

- [ ] **Step 2: Type-check**

Run: `yarn --cwd frontend exec tsc --noEmit`
Expected: PASS. If `tsc` reports it cannot find Crepe types, confirm `@milkdown/crepe` installed in Task 1 and that `frontend/tsconfig.json` `moduleResolution` resolves it (it uses bundler/node via Vite). Do NOT add a hand-written shim — the package ships types.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Markdown/MarkdownEditor.tsx
git commit -m "Add MarkdownEditor Crepe wrapper"
```

---

### Task 3: `TicketBody` container — load + save (TDD, editor mocked)

**Files:**
- Create: `frontend/src/pages/ticket/TicketView/TicketBody.tsx`
- Test: `frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx`

- [ ] **Step 1: Write the failing test (load + successful save)**

```tsx
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketBody, GET_TICKET_BODY, SAVE_DOCUMENT_BODY } from "../TicketBody";
import { DocumentBodyType, ModelStage } from "types/graphql";

// Mock the Crepe wrapper: render the seeded value, expose getMarkdown via ref,
// and a button that flips the dirty flag so Save can be enabled.
jest.mock("components/Markdown/MarkdownEditor", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(
      ({ value, onDirty }: any, ref: any) => {
        React.useImperativeHandle(ref, () => ({ getMarkdown: () => value }));
        return React.createElement("div", {}, [
          React.createElement(
            "span",
            { "data-testid": "seed", key: "s" },
            value,
          ),
          React.createElement(
            "button",
            { key: "d", onClick: () => onDirty() },
            "edit",
          ),
        ]);
      },
    ),
  };
});

const loadMock = {
  request: { query: GET_TICKET_BODY, variables: { id: 7 } },
  result: {
    data: {
      ticket: {
        __typename: "Ticket",
        id: 7,
        stage: ModelStage.Published,
        body: { __typename: "DocumentBody", markdown: "hello\n", version: 2 },
      },
    },
  },
};

const saveOkMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Ticket,
      documentId: 7,
      markdown: "hello\n",
      baseVersion: 2,
    },
  },
  result: {
    data: {
      saveDocumentBody: {
        __typename: "SaveDocumentBodyResult",
        body: { __typename: "DocumentBody", markdown: "hello\n", version: 3 },
        conflict: null,
        warnings: [],
      },
    },
  },
};

it("loads the body and saves with the loaded base version", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveOkMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  // Loaded markdown is seeded into the (mocked) editor.
  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  // Dirty the editor, then save.
  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  // saveOkMock only matches if baseVersion=2 + markdown="hello\n" were sent.
  expect(await screen.findByText("Saved")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn --cwd frontend test TicketBody`
Expected: FAIL — `TicketBody`, `GET_TICKET_BODY`, `SAVE_DOCUMENT_BODY` are not exported (module not found).

- [ ] **Step 3: Write the container**

```tsx
/**
 * TicketBody — loads a ticket's Markdown body, edits it in the Crepe-backed
 * MarkdownEditor, and saves it through the optimistic-concurrency body API
 * (#40). Replaces the collaborative TipTap/hocuspocus TicketDescription.
 *
 * It holds the base version read from the server and sends it on save. The
 * server fast-forwards a matching base, 3-way merges a stale one, or returns a
 * conflict (git-markered Markdown + the current version) — in which case we load
 * the markered text back into the editor for manual resolution.
 */
import { gql, useMutation, useQuery } from "@apollo/client";
import { Suspense, lazy, useRef, useState } from "react";
import { onGraphQLError } from "utils/GQLClient";
import {
  DocumentBodyType,
  ModelStage,
  MentionWarning,
  Mutation,
  Query,
} from "types/graphql";
import type { MarkdownEditorHandle } from "components/Markdown/MarkdownEditor";

const MarkdownEditor = lazy(() => import("components/Markdown/MarkdownEditor"));

export const GET_TICKET_BODY = gql`
  query GetTicketBody($id: Int!) {
    ticket(id: $id) {
      id
      stage
      body {
        markdown
        version
      }
    }
  }
`;

export const SAVE_DOCUMENT_BODY = gql`
  mutation SaveDocumentBody(
    $documentType: DocumentBodyType!
    $documentId: Int!
    $markdown: String!
    $baseVersion: Int!
  ) {
    saveDocumentBody(
      documentType: $documentType
      documentId: $documentId
      markdown: $markdown
      baseVersion: $baseVersion
    ) {
      body {
        markdown
        version
      }
      conflict {
        markdown
        version
      }
      warnings {
        kind
        reference
        matches
      }
    }
  }
`;

interface Props {
  ticketId: number;
}

export const TicketBody: React.FC<Props> = ({ ticketId }) => {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [seed, setSeed] = useState<string | null>(null);
  // `seedId` bumps only when we deliberately replace editor content (load,
  // conflict), forcing a remount. A normal successful save does NOT bump it, so
  // the editor keeps the user's content.
  const [seedId, setSeedId] = useState(0);
  const [baseVersion, setBaseVersion] = useState<number | null>(null);
  const [archived, setArchived] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);
  const [warnings, setWarnings] = useState<MentionWarning[]>([]);

  useQuery<Pick<Query, "ticket">>(GET_TICKET_BODY, {
    variables: { id: ticketId },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (!data.ticket) return;
      setSeed(data.ticket.body.markdown);
      setBaseVersion(data.ticket.body.version);
      setArchived(data.ticket.stage === ModelStage.Archived);
    },
    onError: onGraphQLError({ title: "Could not load the ticket body" }),
  });

  const [save, { loading }] = useMutation<Pick<Mutation, "saveDocumentBody">>(
    SAVE_DOCUMENT_BODY,
    { onError: onGraphQLError({ title: "Could not save the ticket body" }) },
  );

  const onSave = async () => {
    if (baseVersion === null) return;
    const markdown = editorRef.current?.getMarkdown() ?? "";
    const { data } = await save({
      variables: {
        documentType: DocumentBodyType.Ticket,
        documentId: ticketId,
        markdown,
        baseVersion,
      },
    });
    const result = data?.saveDocumentBody;
    if (!result) return;

    if (result.conflict) {
      setSeed(result.conflict.markdown);
      setSeedId((n) => n + 1);
      setBaseVersion(result.conflict.version);
      setConflict(true);
      setDirty(false);
      setStatus("");
      return;
    }

    setBaseVersion(result.body!.version);
    setWarnings(result.warnings);
    setConflict(false);
    setDirty(false);
    setStatus("Saved");
  };

  if (seed === null) return null;

  return (
    <div className="text-gray-800">
      {conflict && (
        <div role="alert" className="m-2 rounded bg-amber-50 p-2 text-amber-800">
          This body was edited elsewhere. Resolve the conflict markers
          (&lt;&lt;&lt;&lt;&lt;&lt;&lt; … &gt;&gt;&gt;&gt;&gt;&gt;&gt;) and save
          again.
        </div>
      )}
      {warnings.length > 0 && (
        <div role="status" className="m-2 rounded bg-blue-50 p-2 text-blue-800">
          Some references couldn&apos;t be resolved:{" "}
          {warnings.map((w) => w.reference).join(", ")}
        </div>
      )}
      <Suspense fallback={null}>
        <MarkdownEditor
          key={seedId}
          ref={editorRef}
          value={seed}
          readOnly={archived}
          onDirty={() => {
            setDirty(true);
            setStatus("");
          }}
        />
      </Suspense>
      {!archived && (
        <div className="flex items-center gap-x-3 p-2">
          <button
            type="button"
            disabled={!dirty || loading}
            onClick={onSave}
            className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          {status && <span className="text-sm text-gray-500">{status}</span>}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `yarn --cwd frontend test TicketBody`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ticket/TicketView/TicketBody.tsx frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx
git commit -m "Add TicketBody container: load + save ticket body via body API"
```

---

### Task 4: `TicketBody` — 409 conflict + mention warnings (TDD)

**Files:**
- Modify: `frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx`

- [ ] **Step 1: Add the failing conflict test**

Append inside the test file (reuse the `jest.mock` and `loadMock` already in the file):
```tsx
const saveConflictMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Ticket,
      documentId: 7,
      markdown: "hello\n",
      baseVersion: 2,
    },
  },
  result: {
    data: {
      saveDocumentBody: {
        __typename: "SaveDocumentBodyResult",
        body: null,
        conflict: {
          __typename: "DocumentBodyConflict",
          markdown: "<<<<<<< ours\nmine\n=======\ntheirs\n>>>>>>> theirs\n",
          version: 5,
        },
        warnings: [],
      },
    },
  },
};

it("shows a conflict banner and reloads markered text on a 409", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveConflictMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  // The conflict banner appears...
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "edited elsewhere",
  );
  // ...and the editor is reseeded with the git-markered Markdown.
  expect(screen.getByTestId("seed")).toHaveTextContent("<<<<<<< ours");
});

const saveWarnMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Ticket,
      documentId: 7,
      markdown: "hello\n",
      baseVersion: 2,
    },
  },
  result: {
    data: {
      saveDocumentBody: {
        __typename: "SaveDocumentBodyResult",
        body: { __typename: "DocumentBody", markdown: "hello\n", version: 3 },
        conflict: null,
        warnings: [
          {
            __typename: "MentionWarning",
            kind: "unknown",
            reference: "@nobody",
            matches: null,
          },
        ],
      },
    },
  },
};

it("surfaces unresolved-mention warnings after a successful save", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveWarnMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");
  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  expect(await screen.findByText("Saved")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("@nobody");
});
```

- [ ] **Step 2: Run to verify both new tests pass (behavior already implemented in Task 3)**

Run: `yarn --cwd frontend test TicketBody`
Expected: PASS — load+save, conflict, and warnings tests all pass. If the conflict test fails because the seed did not update, confirm the container bumps `seedId` (forcing the keyed remount) in the conflict branch.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ticket/TicketView/__tests__/TicketBody.spec.tsx
git commit -m "Cover 409 conflict reseed and mention warnings in TicketBody"
```

---

### Task 5: Wire `TicketBody` into the ticket page + manual verification

**Files:**
- Modify: `frontend/src/pages/ticket/TicketView/TicketView.tsx:16` (import) and `:167-170` (render)

- [ ] **Step 1: Swap the mount**

Replace the import at line 16:
```tsx
import { TicketDescription } from "./TicketDescription";
```
with:
```tsx
import { TicketBody } from "./TicketBody";
```

Replace the render block at lines 167-170:
```tsx
              <TicketDescription
                description={ticket.description!}
                ticketId={ticketId}
              />
```
with:
```tsx
              <TicketBody ticketId={ticketId} />
```

- [ ] **Step 2: Type-check**

Run: `yarn --cwd frontend exec tsc --noEmit`
Expected: PASS for `TicketView.tsx`/`TicketBody.tsx`. (Other files still selecting `ticket.description` continue to compile because the `Ticket.description` type field still exists — it is removed in Task 6. The `description` fetched in `TicketView`'s own fragment may now be unused; that is cleaned in Task 6.)

- [ ] **Step 3: Manual verification in the running app**

Start the backend and frontend (backend on the body API; frontend dev server), open a ticket, and confirm:
- the body loads as Markdown and renders in the Crepe editor;
- editing enables **Save**; clicking Save persists (reload the page → content remains);
- core formatting round-trips: headings, bold/italic/`code`, bullet + numbered + task lists, links, images;
- the editor mounts/unmounts cleanly when navigating between tickets (no console errors, no duplicated editors);
- an archived ticket shows the body read-only with no Save button.

To force a 409: open the same ticket in two tabs, edit + Save in tab A, then edit + Save in tab B against the now-stale version → tab B shows the conflict banner and the markered Markdown.

Record the result of each check in the PR description. (Stored `:mention[...]`/`:ticket[...]` directives rendering as raw-ish text is expected — node views are #42.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/ticket/TicketView/TicketView.tsx
git commit -m "Mount TicketBody (Crepe editor) on the ticket page"
```

---

### Task 6: Retire `Ticket.description` across the frontend (best-effort cleanup)

`Ticket.description` is deleted from the backend schema, so any query still selecting it errors at runtime. Remove it everywhere on tickets, drop the read-only previews it fed, and remove it from the create mutation. (Leave `ImportTicket` — backend `importTickets` still accepts a `description` arg.)

**Files (modify):**
- `frontend/src/pages/ticket/TicketView/TicketView.tsx` (its `TicketViewFragment`)
- `frontend/src/pages/ticket/TicketView/TicketDescription.tsx` (delete this file)
- `frontend/src/pages/ticket/TicketList/TicketList.tsx` (`GetTickets`)
- `frontend/src/pages/schedule/ScheduleTickets/ScheduleTickets.tsx` (scheduled + unscheduled queries)
- `frontend/src/pages/ticket/TicketModalEdit/TicketEditForm.tsx` + `DraftTicketEditForm.tsx`
- `frontend/src/pages/ticket/TicketCreate/TicketCreateModal.tsx` (`CREATE_TICKET_MUTATION`)
- `frontend/src/pages/ticket/TicketView/TicketWorkflowState/EstimateStateModal.tsx`
- dashboard / favorite ticket rows referencing `ticket.description`
- `frontend/src/types/graphql.ts` (remove `Ticket.description`)

- [ ] **Step 1: Enumerate every remaining ticket `description` reference**

Run:
```bash
cd /Users/sms/Code/orcha/frontend
grep -rn "description" src/pages/ticket src/pages/schedule src/pages/dashboard \
  | grep -vi "import\b" | grep -v "ImportTicket"
```
Expected: a finite list across the files above (GraphQL fields named `description`, fragment selections, and `ticket.description` reads). This is the work-list for this task.

- [ ] **Step 2: Delete the obsolete editor mount file**

Run:
```bash
git rm frontend/src/pages/ticket/TicketView/TicketDescription.tsx
```
(`TicketView` already renders `TicketBody` after Task 5, so nothing imports it.)

- [ ] **Step 3: Remove `description` from each GraphQL document + its UI usage**

For every hit from Step 1:
- delete the `description` line from the `gql` document/fragment;
- delete any JSX/logic that rendered that ticket's `description` (the read-only preview/snippet) — this is the intended drop of best-effort previews;
- in `CREATE_TICKET_MUTATION` (`TicketCreateModal.tsx`), remove the `description` mutation argument and variable, and remove the `description` field from the form payload (the backend `createTicket` no longer accepts it; the body is authored after creation in the new editor).

Do not introduce a body fetch in lists — previews are intentionally dropped here.

- [ ] **Step 4: Remove the `Ticket.description` type field**

In `frontend/src/types/graphql.ts`, delete the `description?: Maybe<Scalars['String']['output']>;` line from `export type Ticket = {` (the one inside the `Ticket` type — verify by context; there are similarly-named fields on other types like `Project`/`Role` which must stay).

- [ ] **Step 5: Verify no ticket `description` references remain**

Run:
```bash
cd /Users/sms/Code/orcha/frontend
grep -rn "description" src/pages/ticket src/pages/schedule src/pages/dashboard \
  | grep -vi "import\b" | grep -v "ImportTicket"
```
Expected: no remaining ticket-body `description` selections/reads (only unrelated hits, if any, e.g. an HTML attribute).

- [ ] **Step 6: Type-check, test, and build**

Run:
```bash
yarn --cwd frontend exec tsc --noEmit
yarn --cwd frontend test
yarn --cwd frontend build
```
Expected: all PASS. `tsc` failures here are the remaining `ticket.description` reads — fix each by removing the read. If a snapshot test fails because a dropped preview changed the tree, update the snapshot (`yarn --cwd frontend test -u`) after confirming the diff is just the removed description.

- [ ] **Step 7: Commit**

```bash
git add -A frontend/src
git commit -m "Retire Ticket.description from the frontend (body is Markdown now)"
```

---

### Task 7: Final verification + PR

- [ ] **Step 1: Full frontend gate**

Run:
```bash
yarn --cwd frontend test
yarn --cwd frontend build
```
Expected: tests green, production build succeeds (Crepe chunk builds; no ESM errors).

- [ ] **Step 2: Confirm hocuspocus is gone from the ticket surface**

Run:
```bash
cd /Users/sms/Code/orcha/frontend
grep -rn "Hocuspocus\|ticketTextAccessToken\|TiptapCollab" src/pages/ticket
```
Expected: no hits under `src/pages/ticket` (the ticket body no longer uses the collaborative stack). Project/docs surfaces may still reference TiptapCollab — that is expected and out of scope.

- [ ] **Step 3: Re-run the manual checklist from Task 5 Step 3** against the final build and paste results into the PR body.

- [ ] **Step 4: Open the PR into the integration branch**

```bash
git push -u origin feat/41-crepe-editor
gh pr create --base feat/36-markdown-bodies --head feat/41-crepe-editor \
  --title "Crepe (Milkdown) ticket body editor — core (#41)" \
  --body "<summary: scope = ticket body only; explicit Save; 409 banner + markered reload; Ticket.description retired; project/docs/teardown deferred to #42/#44/#45; manual-verification results pasted here>"
```

---

## Notes carried from the spec (do not re-litigate during execution)

- **Scope is ticket body only.** Project (`ExplorerEditorY.tsx`) and documentation (`DocumentationPageView.tsx`) keep Tiptap. Do not convert them.
- **Do not remove** Tiptap/Yjs/hocuspocus dependencies or the backend `ticketTextAccessToken` query — that is #45.
- **Custom node views** (mention pills, Excalidraw, emoji) are #42. Stored directives rendering as raw text is acceptable here.
- **No backend changes** in this slice.
