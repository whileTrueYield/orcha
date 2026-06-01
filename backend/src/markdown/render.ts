/**
 * Markdown → HTML rendering (PRD #36, issue #44).
 *
 * Public API:
 *   - renderHtml(markdown): string  — Markdown body → published documentation HTML
 *
 * Replaces the Tiptap-JSON `htmlSerializer` in the documentation publish job.
 * Built on the same remark grammar as the rest of the markdown module (GFM +
 * directives, ADR 0007), bridged to HTML via remark-rehype + rehype-stringify,
 * so the published output matches what the editor parses. Pure and headless.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit, SKIP } from "unist-util-visit";
import type { Root } from "mdast";

// remark-rehype has no handler for remark-directive nodes, so it would silently
// drop them (label and all). Orcha directives (:mention, :ticket, :excalidraw)
// carry a human-readable label in their children; for published HTML we unwrap
// each directive to that label text and discard the attributes. Richer rendering
// (links, avatars, embeds) is a deliberate follow-up — #44 ships the readable
// text and never leaks the raw `:name[label]{attrs}` source.
const DIRECTIVE_TYPES = new Set([
  "textDirective",
  "leafDirective",
  "containerDirective",
]);

function remarkUnwrapDirectives() {
  return (tree: Root) => {
    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== "number" || !DIRECTIVE_TYPES.has(node.type)) {
        return;
      }
      const children = (node as { children?: unknown[] }).children ?? [];
      // Replace the directive with its label children in place, then re-visit at
      // the same index so nested directives are unwrapped too.
      parent.children.splice(index, 1, ...(children as never[]));
      return [SKIP, index];
    });
  };
}

// A fresh processor per call. Sharing one frozen module-level `unified()`
// instance across the markdown modules let remark-gfm's parsing get clobbered
// once another processor in the process had been built/used (the gfm + directive
// micromark extensions alias shared state across frozen processors) — task lists
// silently degraded to plain lists, and the failure was test-order-dependent.
// Building per call is cheap relative to a publish and keeps each render hermetic.
function buildProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(remarkUnwrapDirectives)
    .use(remarkRehype)
    // Heading ids (github-slugger slugs) so the published TOC's `#anchor` links
    // resolve; the slugs match the anchors `analyze` emits for the TOC itself.
    .use(rehypeSlug)
    .use(rehypeStringify);
}

export function renderHtml(markdown: string): string {
  return String(buildProcessor().processSync(markdown));
}
