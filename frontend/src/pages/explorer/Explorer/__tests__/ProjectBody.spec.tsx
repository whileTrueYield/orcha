/**
 * Tests for ProjectBody — verifies load, save, conflict reseed, mention-warning,
 * and archived read-only flows without running Crepe (jsdom can't handle it).
 * The MarkdownEditor is mocked to expose the seeded value and a dirty-trigger
 * button, so all assertions are against visible DOM state.
 */
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProjectBody, GET_PROJECT_BODY, SAVE_DOCUMENT_BODY } from "../ProjectBody";
import { DocumentBodyType, ModelStage } from "types/graphql";

// GQLClient uses import.meta.env (Vite), which jsdom can't evaluate.
jest.mock("utils/GQLClient", () => ({
  onGraphQLError: () => () => {},
}));

// Mock the Crepe wrapper: render the seeded value, expose getMarkdown via ref,
// and a button that flips the dirty flag so Save can be enabled.
jest.mock("components/Markdown/MarkdownEditor", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(({ value, onDirty }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ getMarkdown: () => value }));
      return React.createElement("div", {}, [
        React.createElement("span", { "data-testid": "seed", key: "s" }, value),
        React.createElement(
          "button",
          { key: "d", onClick: () => onDirty() },
          "edit",
        ),
      ]);
    }),
  };
});

// react-diff-viewer-continued drives a web worker + ResizeObserver + layout
// measurement jsdom can't run (the same untestable boundary as Crepe). Mock it
// to a flat element exposing the titles and both sides as text.
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
  request: { query: GET_PROJECT_BODY, variables: { id: 7 } },
  result: {
    data: {
      project: {
        __typename: "Project",
        id: 7,
        stage: ModelStage.Published,
        ancestorIsArchived: false,
        body: { __typename: "DocumentBody", markdown: "hello\n", version: 2 },
      },
    },
  },
};

const saveOkMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Project,
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
      <ProjectBody projectId={7} />
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
      documentType: DocumentBodyType.Project,
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
      <ProjectBody projectId={7} />
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

const saveWarnMock = {
  request: {
    query: SAVE_DOCUMENT_BODY,
    variables: {
      documentType: DocumentBodyType.Project,
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
      <ProjectBody projectId={7} />
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
      documentType: DocumentBodyType.Project,
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
      <ProjectBody projectId={7} />
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

const archivedLoadMock = {
  request: { query: GET_PROJECT_BODY, variables: { id: 7 } },
  result: {
    data: {
      project: {
        __typename: "Project",
        id: 7,
        stage: ModelStage.Archived,
        ancestorIsArchived: false,
        body: { __typename: "DocumentBody", markdown: "hello\n", version: 2 },
      },
    },
  },
};

it("is read-only with no Save button when the project is archived", async () => {
  render(
    <MockedProvider mocks={[archivedLoadMock]}>
      <ProjectBody projectId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");
  expect(screen.queryByText("Save")).toBeNull();
});

const ancestorArchivedLoadMock = {
  request: { query: GET_PROJECT_BODY, variables: { id: 7 } },
  result: {
    data: {
      project: {
        __typename: "Project",
        id: 7,
        stage: ModelStage.Published,
        ancestorIsArchived: true,
        body: { __typename: "DocumentBody", markdown: "hello\n", version: 2 },
      },
    },
  },
};

it("is read-only when an ancestor project is archived", async () => {
  render(
    <MockedProvider mocks={[ancestorArchivedLoadMock]}>
      <ProjectBody projectId={7} />
    </MockedProvider>,
  );

  expect(await screen.findByTestId("seed")).toHaveTextContent("hello");
  expect(screen.queryByText("Save")).toBeNull();
});
