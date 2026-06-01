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
  it("maps a :ticket directive to editor attrs and back losslessly", () => {
    // `:ticket[#123]{id="42"}` — the bracket label is the human-facing `#123`,
    // the attribute carries the database id the reference resolves to.
    const directive = {
      type: "textDirective",
      name: "ticket",
      attributes: { id: "42" },
      children: [{ type: "text", value: "#123" }],
    };

    const attrs = ticketFromDirective(directive);
    expect(attrs).toEqual({ id: 42, label: "#123" });
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
  it("maps an :excalidraw directive to editor attrs and back losslessly", () => {
    // `:excalidraw[Architecture]{id="d1" rev="3"}` references a Drawing record by
    // its (string) id at a numeric revision; the label is the embed's caption.
    const directive = {
      type: "textDirective",
      name: "excalidraw",
      attributes: { id: "d1", rev: "3" },
      children: [{ type: "text", value: "Architecture" }],
    };

    const attrs = excalidrawFromDirective(directive);
    expect(attrs).toEqual({ id: "d1", rev: 3, label: "Architecture" });
    expect(excalidrawToDirective(attrs)).toEqual(directive);
  });
});
