/**
 * The editor-node ↔ ADR-0007 directive mapping — the frontend source of truth
 * for how a custom Crepe (Milkdown) node is encoded as Markdown (PRD #36, issue
 * #42).
 *
 * ADR 0007 stores Orcha's custom content as remark-directive nodes rather than
 * raw HTML: role/user `:mention[Name]{type=… id=…}`, ticket `:ticket[#123]{id=…}`,
 * `:emoji[name]`, and the `:excalidraw[label]{id rev=N}` embed. Milkdown's
 * Markdown serializer/parser hands a custom node the mdast directive object (not
 * a string), so this module maps between that mdast shape and the editor's node
 * attributes. It is the mirror of backend `markdown/directives.ts`: the backend
 * proves the string↔mdast round-trip, this proves the mdast↔attrs round-trip, so
 * editor content survives a save/reload with ids and labels intact.
 *
 * The module is pure (no DOM, no Milkdown imports). The `$nodeSchema` runners
 * that wire these mappers into Crepe are the untestable editor boundary.
 */

// The mdast directive node shape, narrowed to the fields the mappers read/write.
// `attributes` values are strings on the wire (mdast stores them verbatim); the
// label is carried as the directive's text children.
export interface DirectiveNode {
  type: "textDirective";
  name: string;
  attributes: Record<string, string>;
  children: { type: "text"; value: string }[];
}

export interface MentionAttrs {
  mentionType: string;
  id: number;
  label: string;
}

// The directive's bracket label (`:mention[Alice]`) is its text children; a
// directive always carries exactly one text child for these nodes.
function label(node: DirectiveNode): string {
  return node.children[0]?.value ?? "";
}

// Every custom node serialises to the same skeleton — a named text directive
// whose attributes hold its ids and whose single text child is the bracket
// label. Only the name, attributes, and label differ per node, so the skeleton
// (and its mdast type tag) is defined exactly once here.
function makeDirective(
  name: string,
  attributes: Record<string, string>,
  label: string,
): DirectiveNode {
  return {
    type: "textDirective",
    name,
    attributes,
    children: [{ type: "text", value: label }],
  };
}

export function mentionFromDirective(node: DirectiveNode): MentionAttrs {
  return {
    mentionType: node.attributes.type,
    id: Number(node.attributes.id),
    label: label(node),
  };
}

export function mentionToDirective(attrs: MentionAttrs): DirectiveNode {
  return makeDirective(
    "mention",
    { type: attrs.mentionType, id: String(attrs.id) },
    attrs.label,
  );
}

export interface TicketAttrs {
  id: number;
  label: string;
}

export function ticketFromDirective(node: DirectiveNode): TicketAttrs {
  return { id: Number(node.attributes.id), label: label(node) };
}

export function ticketToDirective(attrs: TicketAttrs): DirectiveNode {
  return makeDirective("ticket", { id: String(attrs.id) }, attrs.label);
}

export interface EmojiAttrs {
  name: string;
}

export function emojiFromDirective(node: DirectiveNode): EmojiAttrs {
  return { name: label(node) };
}

export function emojiToDirective(attrs: EmojiAttrs): DirectiveNode {
  return makeDirective("emoji", {}, attrs.name);
}

// The Drawing store owns the scene; the embed only references it. The id stays a
// string (it is the Drawing record's id, not a numeric foreign key like ticket),
// while the revision is numeric so a stale embed can be detected on render.
export interface ExcalidrawAttrs {
  id: string;
  rev: number;
  label: string;
}

export function excalidrawFromDirective(node: DirectiveNode): ExcalidrawAttrs {
  return {
    id: node.attributes.id,
    rev: Number(node.attributes.rev),
    label: label(node),
  };
}

export function excalidrawToDirective(attrs: ExcalidrawAttrs): DirectiveNode {
  return makeDirective(
    "excalidraw",
    { id: attrs.id, rev: String(attrs.rev) },
    attrs.label,
  );
}
