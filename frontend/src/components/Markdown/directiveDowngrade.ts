/**
 * A parse-time safeguard that keeps Crepe from crashing on directive markdown
 * it has no node schema for (PRD #36, issues #42 and the read-surfaces slice).
 *
 * remark-directive turns ANY `:word` / `::word` / `:::word` into a directive
 * node — including ones a user typed with no directive intent (":happy" in a
 * comment). Milkdown's parser throws ("Cannot match target parser for node")
 * on any directive without a matching node schema, which blanks the whole
 * surface. This transformer runs on parse (Milkdown does
 * `remark.runSync(remark.parse(...))`) and rewrites every directive the
 * schemas can't handle into plain text, so unknown, legacy, or foreign
 * content loads degraded rather than not at all:
 *   - inline `:name` not mention/emoji   → its label text, or literal `:name`
 *   - block `::name` not ticket/excalidraw → a paragraph of the same
 *   - container `:::name` (none are known) → unwrapped to its children
 *
 * Kept free of Milkdown imports so it stays testable in jest (the $remark
 * wrapper lives in `editorNodes.ts`), mirroring `directiveNodes.ts`.
 *
 * Public API:
 *   - downgradeUnknownDirectives(tree) — mutates the mdast tree in place
 *   - MdastNode — the minimal node shape the transformer works on
 */

// The directive names the editor has node schemas for, per kind. An inline
// `:ticket`/`:excalidraw` is the legacy form of a block embed — it has no
// inline node to parse into, so it downgrades like an unknown directive.
const INLINE_NODE_NAMES = new Set(["mention", "emoji"]);
const BLOCK_EMBED_NAMES = new Set(["ticket", "excalidraw"]);

export interface MdastNode {
  type: string;
  name?: string;
  value?: string;
  children?: MdastNode[];
}

// The first text found anywhere under a node — used as the downgraded text so
// a legacy `:ticket[#10]{…}` still shows its `#10` reference.
function firstText(node: MdastNode): string {
  if (node.type === "text") return node.value ?? "";
  for (const child of node.children ?? []) {
    const found = firstText(child);
    if (found) return found;
  }
  return "";
}

function textNode(value: string): MdastNode {
  return { type: "text", value };
}

export function downgradeUnknownDirectives(node: MdastNode): void {
  if (!node.children) return;
  node.children = node.children.flatMap((child): MdastNode[] => {
    if (child.type === "textDirective" && child.name) {
      if (INLINE_NODE_NAMES.has(child.name)) return [child];
      return [textNode(firstText(child) || `:${child.name}`)];
    }
    if (child.type === "leafDirective" && child.name) {
      if (BLOCK_EMBED_NAMES.has(child.name)) return [child];
      return [
        {
          type: "paragraph",
          children: [textNode(firstText(child) || `::${child.name}`)],
        },
      ];
    }
    if (child.type === "containerDirective") {
      downgradeUnknownDirectives(child);
      return child.children ?? [];
    }
    downgradeUnknownDirectives(child);
    return [child];
  });
}
