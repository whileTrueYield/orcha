/**
 * Tests for Markdown → HTML rendering (PRD #36, issue #44).
 *
 * `renderHtml(markdown)` is the publish-side renderer that produces the static
 * documentation HTML from the Markdown body (ADR 0007), replacing the old
 * Tiptap-JSON `htmlSerializer`. It is pure and headless, so these tests drive it
 * straight through the `renderHtml` interface against representative Markdown.
 */
import expect from "expect";
import { renderHtml } from "../render";

describe("renderHtml", () => {
  it("renders a heading and paragraph as HTML", () => {
    const html = renderHtml("# Title\n\nHello world.\n");
    // The heading carries a slug id (see the TOC-anchor test below); match on the
    // tag + text rather than an exact string so that detail stays decoupled.
    expect(html).toMatch(/<h1[^>]*>Title<\/h1>/);
    expect(html).toContain("<p>Hello world.</p>");
  });

  it("renders a GFM task list as HTML checkboxes", () => {
    const html = renderHtml("* [ ] todo\n* [x] done\n");
    expect(html).toContain('type="checkbox"');
    // the checked item carries the checked attribute, the open one does not
    expect(html).toContain("checked");
  });

  // Directives carry Orcha-specific content (mentions, ticket refs, embeds).
  // Published HTML shows the human-readable label and never leaks the raw
  // `:name[label]{attrs}` source. (Richer rendering — links, avatars, embeds —
  // is a deliberate follow-up; #44 ships the readable text.)
  it("renders an inline :mention directive as its label text", () => {
    const html = renderHtml('Ping :mention[Alice]{type="user" id="5"} now.\n');
    expect(html).toContain("Alice");
    expect(html).not.toContain(":mention");
    expect(html).not.toContain("{");
  });

  // The published TOC links to `#<anchor>`, so headings must carry matching id
  // attributes. The slug uses github-slugger, the same slugger `analyze` uses for
  // TOC anchors, so TOC links and heading ids always agree.
  it("gives headings slug id attributes that match the TOC anchors", () => {
    const html = renderHtml("## Getting Started\n");
    expect(html).toContain('id="getting-started"');
  });
});
