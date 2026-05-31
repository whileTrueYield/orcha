/**
 * Markdown body analysis (PRD #36, issue #38) — the read side that replaces the
 * Tiptap-JSON content utilities (`getMentions`, `getPlainTextFromTipTapDoc`,
 * `getHeadersFromTipTapDoc`).
 *
 * Public API:
 *   - analyze(markdown): MarkdownAnalysis
 *   - types MarkdownAnalysis, Heading
 *
 * `analyze` parses a Markdown body once (via the shared directive pipeline) and
 * derives everything downstream consumers need: the role ids mentioned (for
 * notifications), the plain text (for search `indexableContent`), and the
 * headings (for documentation TOCs). It is pure and headless — no DOM, no I/O.
 */

import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import { parseBody } from "./directives";

export type Heading = { level: number; text: string; anchor: string };

export type MarkdownAnalysis = {
  mentions: number[];
  plainText: string;
  headings: Heading[];
};

export function analyze(markdown: string): MarkdownAnalysis {
  const tree = parseBody(markdown);

  const mentions: number[] = [];
  visit(tree, "textDirective", (node) => {
    if (node.name !== "mention") return;
    const id = Number(node.attributes?.id);
    if (Number.isInteger(id)) mentions.push(id);
  });

  // `mdast-util-to-string` concatenates text with no separators, so calling it
  // on the whole tree would weld the last word of one block to the first of the
  // next ("Title" + "Some" → "TitleSome"). Stringifying each top-level block and
  // joining with newlines keeps words searchable across block boundaries.
  const plainText = tree.children
    .map((block) => toString(block))
    .filter((text) => text.length > 0)
    .join("\n");

  // One slugger per body so repeated heading text gets the same disambiguating
  // suffixes a Markdown renderer / GitHub-style TOC would assign ("Notes",
  // "Notes" → "notes", "notes-1"); a shared instance would leak counts between
  // documents.
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  visit(tree, "heading", (node) => {
    const text = toString(node);
    headings.push({ level: node.depth, text, anchor: slugger.slug(text) });
  });

  return { mentions, plainText, headings };
}
