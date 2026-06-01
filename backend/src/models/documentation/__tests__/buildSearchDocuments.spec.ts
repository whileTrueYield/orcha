/**
 * Tests for the documentation search-document builder (PRD #36, issue #44).
 *
 * `buildSearchDocuments(page)` turns a page's Markdown body into the per-heading
 * search blocks the published static site indexes (replacing the old Tiptap-JSON
 * + Yjs `.bytes` path). It is pure, so these tests drive it through its public
 * interface with plain page objects.
 */
import expect from "expect";
import { buildSearchDocuments } from "../resolvers/buildSearchDocuments";

describe("buildSearchDocuments", () => {
  it("splits a page body into one search block per heading", () => {
    const docs = buildSearchDocuments({
      id: 7,
      customId: null,
      title: "Guide",
      documentationPageText: {
        markdown: "# Intro\n\nWelcome aboard.\n\n# Setup\n\nInstall the thing.\n",
      },
    });

    expect(docs).toEqual([
      { id: "7#intro", title: "Intro", body: "Welcome aboard.", pageTitle: "Guide" },
      { id: "7#setup", title: "Setup", body: "Install the thing.", pageTitle: "Guide" },
    ]);
  });

  it("indexes a body with no headings as one page-level block", () => {
    const docs = buildSearchDocuments({
      id: 9,
      customId: null,
      title: "Notes",
      documentationPageText: { markdown: "Just some prose, no headings.\n" },
    });

    expect(docs).toEqual([
      { id: "9", title: "", body: "Just some prose, no headings.", pageTitle: "Notes" },
    ]);
  });

  it("uses the page customId as the search id when present", () => {
    const docs = buildSearchDocuments({
      id: 9,
      customId: "getting-started",
      title: "Start",
      documentationPageText: { markdown: "# Hi\n\nthere\n" },
    });

    expect(docs[0].id).toBe("getting-started#hi");
  });

  it("returns no blocks for an empty body", () => {
    const docs = buildSearchDocuments({
      id: 9,
      customId: null,
      title: "Empty",
      documentationPageText: { markdown: "" },
    });

    expect(docs).toEqual([]);
  });

  it("returns no blocks when the page has no body row yet", () => {
    const docs = buildSearchDocuments({
      id: 9,
      customId: null,
      title: "Empty",
      documentationPageText: null,
    });

    expect(docs).toEqual([]);
  });
});
