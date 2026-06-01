/**
 * The Markdown directive grammar and the unified pipeline that (de)serialises it
 * (PRD #36, issue #38).
 *
 * ADR 0007 encodes Orcha's custom content as remark-directive nodes rather than
 * raw HTML or MDX: role/user `:mention[Name]{type=user id=…}`, ticket
 * `:ticket[#123]{id=…}`, `:emoji[name]`, and the `:excalidraw[label]{id rev=N}`
 * embed. This module owns the single configured pipeline that turns a Markdown
 * body into an mdast tree and back, so every other consumer (analysis, mention
 * resolution, body normalisation on write) shares exactly one grammar.
 *
 * Public API:
 *   - parseBody(markdown): Root      — Markdown text → mdast tree (with directives)
 *   - serializeBody(tree): string    — mdast tree → Markdown text
 *
 * The two are inverses for directive content: serialising a parsed body and
 * reparsing it preserves node shape, ids, and attributes (see the round-trip
 * tests). The module is pure and headless — no DOM, no I/O — proving ADR 0007's
 * claim that the server analyses Markdown with a plain unified pipeline.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";

// Built once and reused: both processors are pure, so a single frozen instance
// each avoids rebuilding the plugin chain on every call. `remark-directive`
// contributes the micromark/mdast extensions that make `:name[label]{attrs}`
// parse to a directive node and serialise back. `remark-gfm` adds the
// GitHub-Flavored Markdown the Crepe editor emits (task lists, tables,
// strikethrough, autolinks); without it a save re-serialises `* [ ] x` with the
// bracket escaped, so the body reloads as the literal text `[ ] x` instead of a
// checkbox. Both parser and serializer get it so the round-trip is symmetric.
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkDirective);
const serializer = unified()
  .use(remarkStringify)
  .use(remarkGfm)
  .use(remarkDirective);

export function parseBody(markdown: string): Root {
  return parser.parse(markdown);
}

export function serializeBody(tree: Root): string {
  return serializer.stringify(tree);
}
