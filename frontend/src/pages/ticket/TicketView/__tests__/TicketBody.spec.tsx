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

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "edited elsewhere",
  );
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
