/**
 * Round-trip tests for the editor-node ↔ ADR-0007 directive mapping (PRD #36,
 * issue #42).
 *
 * The four custom editor nodes — role/user `:mention`, `:ticket`, `:emoji`, and
 * the `:excalidraw` embed — must serialize to their directive and re-parse to
 * the same node, "consistent with the analysis module" (acceptance criterion).
 * This is the frontend mirror of backend `markdown/__tests__/directives.spec.ts`:
 * there the contract is proven at the Markdown-string level; here it is proven
 * at the mdast-directive level, which is exactly the node shape Milkdown's
 * Markdown runners hand to (and expect back from) a custom node. The Milkdown
 * plugin wiring that consumes these mappers is the untestable editor boundary
 * and is verified manually.
 */

import {
  mentionFromDirective,
  mentionToDirective,
  ticketFromDirective,
  ticketToDirective,
  emojiFromDirective,
  emojiToDirective,
  excalidrawFromDirective,
  excalidrawToDirective,
} from "../directiveNodes";

describe("directive nodes — mention", () => {
  it("maps a :mention directive to editor attrs and back losslessly", () => {
    // The exact mdast shape the backend's remark-directive pipeline produces for
    // `:mention[Alice]{type="user" id="5"}` — attributes are strings on the wire.
    const directive = {
      type: "textDirective",
      name: "mention",
      attributes: { type: "user", id: "5" },
      children: [{ type: "text", value: "Alice" }],
    };

    const attrs = mentionFromDirective(directive);
    expect(attrs).toEqual({ mentionType: "user", id: 5, label: "Alice" });
    expect(mentionToDirective(attrs)).toEqual(directive);
  });
});

describe("directive nodes — ticket", () => {
  it("maps a ::ticket block directive to editor attrs and back losslessly", () => {
    // A ticket is a block embed rendering the live card by id, so it carries only
    // the database id and serialises to the block directive `::ticket{id="42"}`
    // (a leaf directive with no bracket label).
    const directive = {
      type: "leafDirective",
      name: "ticket",
      attributes: { id: "42" },
      children: [],
    };

    const attrs = ticketFromDirective(directive);
    expect(attrs).toEqual({ id: 42 });
    expect(ticketToDirective(attrs)).toEqual(directive);
  });
});

describe("directive nodes — emoji", () => {
  it("maps a :emoji directive to editor attrs and back losslessly", () => {
    // `:emoji[tada]` carries no attribute block; remark-directive represents the
    // absent `{...}` as an empty attributes object, and the emoji name is the
    // bracket label.
    const directive = {
      type: "textDirective",
      name: "emoji",
      attributes: {},
      children: [{ type: "text", value: "tada" }],
    };

    const attrs = emojiFromDirective(directive);
    expect(attrs).toEqual({ name: "tada" });
    expect(emojiToDirective(attrs)).toEqual(directive);
  });
});

describe("directive nodes — excalidraw embed", () => {
  it("maps an ::excalidraw block directive to editor attrs and back losslessly", () => {
    // `::excalidraw[Architecture]{id="5"}` is a block embed referencing a Drawing
    // record by its numeric id; the bracket label is the embed's caption. (The
    // `rev=N` sketched in ADR-0007 was dropped: Drawing has no revision field.)
    const directive = {
      type: "leafDirective",
      name: "excalidraw",
      attributes: { id: "5" },
      children: [{ type: "text", value: "Architecture" }],
    };

    const attrs = excalidrawFromDirective(directive);
    expect(attrs).toEqual({ id: 5, label: "Architecture" });
    expect(excalidrawToDirective(attrs)).toEqual(directive);
  });
});
