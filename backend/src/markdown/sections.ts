/**
 * Section splitting (PRD #36, issue #44).
 *
 * Public API:
 *   - toSections(markdown): DocumentSection[]
 *
 * Splits a Markdown body at its headings into sections — a heading and the text
 * that follows it up to the next heading. The documentation search index uses
 * this to produce one deep-linkable block per heading. Keeps all Markdown-tree
 * knowledge in the markdown module (alongside analyze/renderHtml); consumers
 * stay free of mdast. Pure and headless.
 */

import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import { parseBody } from "./directives";

// A section's `anchor` is the slug of its heading, matching the anchors `analyze`
// produces for the TOC so search links and TOC links agree. Content before the
// first heading yields a leading section with an empty title and anchor; an empty
// body yields no sections at all.
export type DocumentSection = { title: string; anchor: string; body: string };

export function toSections(markdown: string): DocumentSection[] {
  const tree = parseBody(markdown);
  const slugger = new GithubSlugger();

  const sections: DocumentSection[] = [];
  let current: DocumentSection = { title: "", anchor: "", body: "" };

  const flush = () => {
    current.body = current.body.trim();
    // Keep every heading-led section (even an empty one — the heading itself is
    // searchable), and a pre-heading lead-in only if it actually has text.
    if (current.title || current.body) sections.push(current);
  };

  for (const node of tree.children) {
    if (node.type === "heading") {
      flush();
      const title = toString(node);
      current = { title, anchor: slugger.slug(title), body: "" };
    } else {
      const text = toString(node);
      current.body = current.body ? `${current.body}\n${text}` : text;
    }
  }
  flush();

  return sections;
}
