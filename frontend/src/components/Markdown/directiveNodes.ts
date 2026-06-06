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
// label is carried as the directive's text children. Inline nodes (mention,
// emoji) are `textDirective`; block embeds (ticket, and the Excalidraw embed)
// are `leafDirective` — `::ticket{id}` on its own line — so ProseMirror can
// render them as block node views rather than inside a paragraph.
export interface DirectiveNode {
  type: "textDirective" | "leafDirective";
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

// Every custom node serialises to the same skeleton — a named directive whose
// attributes hold its ids and whose single text child is the bracket label.
// Only the directive kind (inline vs block), name, attributes, and label differ
// per node, so the skeleton is defined exactly once here. A label of `undefined`
// produces a directive with no bracket (e.g. block `::ticket{id}`).
function makeDirective(
  type: DirectiveNode["type"],
  name: string,
  attributes: Record<string, string>,
  label?: string,
): DirectiveNode {
  return {
    type,
    name,
    attributes,
    children: label === undefined ? [] : [{ type: "text", value: label }],
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
    "textDirective",
    "mention",
    { type: attrs.mentionType, id: String(attrs.id) },
    attrs.label,
  );
}

// A ticket reference is a block embed that renders the live ticket card, so it
// only needs to carry the database id — the card fetches title, status, etc. by
// id. It serialises to the block directive `::ticket{id="42"}` (no bracket
// label), distinct from the inline mention/emoji directives.
export interface TicketAttrs {
  id: number;
}

export function ticketFromDirective(node: DirectiveNode): TicketAttrs {
  return { id: Number(node.attributes.id) };
}

export function ticketToDirective(attrs: TicketAttrs): DirectiveNode {
  return makeDirective("leafDirective", "ticket", { id: String(attrs.id) });
}

export interface EmojiAttrs {
  name: string;
}

export function emojiFromDirective(node: DirectiveNode): EmojiAttrs {
  return { name: label(node) };
}

export function emojiToDirective(attrs: EmojiAttrs): DirectiveNode {
  return makeDirective("textDirective", "emoji", {}, attrs.name);
}

// The Drawing store owns the scene; the embed only references it by the Drawing
// record's numeric id, like ticket. The bracket label keeps the raw Markdown
// readable (`::excalidraw[Architecture sketch]{id="5"}`). ADR-0007 sketched a
// `rev=N` attribute, but `Drawing` has no revision field and the store stays
// unchanged (issue #42) — freshness comes from `updatedAt`, so `rev` is dropped.
export interface ExcalidrawAttrs {
  id: number;
  label: string;
}

export function excalidrawFromDirective(node: DirectiveNode): ExcalidrawAttrs {
  return {
    id: Number(node.attributes.id),
    label: label(node),
  };
}

export function excalidrawToDirective(attrs: ExcalidrawAttrs): DirectiveNode {
  return makeDirective(
    "leafDirective",
    "excalidraw",
    { id: String(attrs.id) },
    // An unlabelled embed serialises without a bracket (`::excalidraw{id}`),
    // not with an empty one — mirroring how it parses back (`label: ""`).
    attrs.label === "" ? undefined : attrs.label,
  );
}
