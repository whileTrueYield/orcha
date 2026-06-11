/**
 * Tests for TicketBody — verifies load, save, conflict reseed, and
 * mention-warning flows without running Crepe (jsdom can't handle it).
 * The MarkdownEditor is mocked to expose the seeded value and a dirty-trigger
 * button, so all assertions are against visible DOM state.
 */
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TicketBody, GET_TICKET_BODY, SAVE_DOCUMENT_BODY } from "../TicketBody";
import { DocumentBodyType, ModelStage } from "types/graphql";

// GQLClient uses import.meta.env (Vite), which jsdom can't evaluate.
// We only need onGraphQLError as a no-op — errors in these tests come from
// Apollo network mismatch, not from onError callbacks.
jest.mock("utils/GQLClient", () => ({
  onGraphQLError: () => () => {},
}));

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

// react-diff-viewer-continued drives a web worker + ResizeObserver + layout
// measurement jsdom can't run (the same untestable boundary as Crepe). Mock it
// to a flat element exposing the titles and both sides as text, so the picker's
// "Their version"/"Your version" + each side's content stay assertable.
jest.mock("react-diff-viewer-continued", () => {
  const React = require("react");
  return {
    __esModule: true,
    DiffMethod: { WORDS: "diffWords" },
    default: ({ oldValue, newValue, leftTitle, rightTitle }: any) =>
      React.createElement("div", { "data-testid": "diff" }, [
        React.createElement("span", { key: "lt" }, leftTitle),
        React.createElement("span", { key: "rt" }, rightTitle),
        React.createElement("span", { key: "ov" }, oldValue),
        React.createElement("span", { key: "nv" }, newValue),
      ]),
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

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  expect(await screen.findByText("Saved")).toBeInTheDocument();
});

// A stale base is 3-way merged server-side, so the persisted body differs from
// what we submitted. The editor must reseed to that merged result so the other
// writer's folded-in changes are visible right after Save, not only on reload.
const saveMergeMock = {
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
        body: {
          __typename: "DocumentBody",
          markdown: "hello\ntheirs\n",
          version: 3,
        },
        conflict: null,
        warnings: [],
      },
    },
  },
};

it("reseeds the editor with the merged body after a server-side merge", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveMergeMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  expect(await screen.findByText("Saved")).toBeInTheDocument();
  // The merged-in "theirs" line is now visible in the editor.
  expect(screen.getByTestId("seed")).toHaveTextContent("theirs");
});

it("saves on Cmd/Ctrl+S", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveOkMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  fireEvent.click(screen.getByText("edit"));
  // The shortcut fires from inside the editor and bubbles to the body wrapper.
  fireEvent.keyDown(screen.getByTestId("seed"), { key: "s", metaKey: true });

  expect(await screen.findByText("Saved")).toBeInTheDocument();
});

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
        },
        warnings: [],
      },
    },
  },
};

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

// The resolve attempt ("Keep yours" → "mine\nshared\n" against the conflict
// version 5) itself loses a race and returns a FRESH conflict with DIFFERENT
// regions. This exercises a back-to-back 409: the resolver must remount so its
// per-region choices reset, rather than letting a stale choices[0] leak in and
// wrongly satisfy the "all chosen" gate against the new content.
const resolveConflictsAgainMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Ticket,
      documentId: 7,
      markdown: "mine\nshared\n",
      baseVersion: 5, // the conflict version from saveConflictMock
    },
  },
  result: {
    data: {
      saveDocumentBody: {
        __typename: "SaveDocumentBodyResult",
        body: null,
        conflict: {
          __typename: "DocumentBodyConflict",
          markdown: "<<<<<<< ours\nalpha\n=======\nbeta\n>>>>>>> theirs\n",
          version: 6,
          regions: [
            {
              __typename: "ConflictRegion",
              kind: "CONFLICT",
              lines: [],
              ours: ["alpha"],
              theirs: ["beta"],
            },
            {
              __typename: "ConflictRegion",
              kind: "STABLE",
              lines: ["shared", ""],
              ours: [],
              theirs: [],
            },
          ],
        },
        warnings: [],
      },
    },
  },
};

it("re-shows the picker with fresh choices when a resolve itself conflicts", async () => {
  render(
    <MockedProvider
      mocks={[loadMock, saveConflictMock, resolveConflictsAgainMock]}
    >
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");
  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));

  // First conflict: pick a side and resolve.
  fireEvent.click(await screen.findByText("Keep yours"));
  fireEvent.click(screen.getByText("Resolve & Save"));

  // Second conflict re-shows the picker with the NEW content...
  expect(await screen.findByText("alpha")).toBeInTheDocument();
  expect(screen.getByText("beta")).toBeInTheDocument();
  // ...and choices reset: the gate is unsatisfied again, so "Resolve & Save" is
  // disabled. Without the resolver remount, the leaked choices[0] would keep it
  // enabled here.
  expect(
    screen.getByRole("button", { name: "Resolve & Save" }),
  ).toBeDisabled();
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

// After a warn-save (baseVersion bumps to 3), a subsequent conflict must clear
// the stale warnings banner so both banners never coexist.
const saveConflictAfterWarnMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Ticket,
      documentId: 7,
      markdown: "hello\n",
      baseVersion: 3, // version returned by saveWarnMock
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
        },
        warnings: [],
      },
    },
  },
};

it("clears stale warnings when a later save conflicts", async () => {
  render(
    <MockedProvider mocks={[loadMock, saveWarnMock, saveConflictAfterWarnMock]}>
      <TicketBody ticketId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");

  // First save: succeeds with a warning.
  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));
  expect(await screen.findByRole("status")).toHaveTextContent("@nobody");

  // Second save: conflicts. The stale warnings banner must be gone.
  fireEvent.click(screen.getByText("edit"));
  fireEvent.click(screen.getByText("Save"));
  expect(await screen.findByRole("alert")).toHaveTextContent("edited elsewhere");
  expect(screen.queryByRole("status")).toBeNull();
});
