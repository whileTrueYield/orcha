/**
 * A parse-time safeguard that keeps the editor from crashing on directive
 * markdown it has no node for (PRD #36, issue #42).
 *
 * Ticket and Excalidraw embeds are block (`::name`) directives. Older bodies —
 * and anything an external author or AI agent writes — may still contain the
 * inline (`:name[...]`) form, or other unknown directives. Milkdown's parser
 * throws ("Cannot match target parser for node") on any directive without a
 * matching node schema, which blanks the whole editor. This remark transformer
 * runs on parse (Milkdown does `remark.runSync(remark.parse(...))`) and rewrites
 * such inline ticket/excalidraw directives to plain text, so legacy or foreign
 * content loads degraded rather than not at all.
 *
 * Public API:
 *   - legacyDirectiveDowngrade: MilkdownPlugin tuple — add via the plugin bundle
 *
 * It only touches the inline forms of block-embed names; the inline mention and
 * emoji directives have their own node schemas and are left alone.
 */
import { $remark } from "@milkdown/kit/utils";

// The directives that are block embeds today; an inline occurrence is legacy or
// externally authored and has no inline node to parse into.
const BLOCK_EMBED_NAMES = new Set(["ticket", "excalidraw"]);

interface MdastNode {
  type: string;
  name?: string;
  value?: string;
  children?: MdastNode[];
}

// The first text found anywhere under a node — used as the downgraded text so a
// legacy `:ticket[#10]{…}` still shows its `#10` reference.
function firstText(node: MdastNode): string {
  if (node.type === "text") return node.value ?? "";
  for (const child of node.children ?? []) {
    const found = firstText(child);
    if (found) return found;
  }
  return "";
}

function downgrade(node: MdastNode): void {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (
      child.type === "textDirective" &&
      child.name &&
      BLOCK_EMBED_NAMES.has(child.name)
    ) {
      return { type: "text", value: firstText(child) || `:${child.name}` };
    }
    downgrade(child);
    return child;
  });
}

export const legacyDirectiveDowngrade = $remark(
  "orchaLegacyDirectiveDowngrade",
  () => () => (tree) => downgrade(tree as MdastNode),
);
