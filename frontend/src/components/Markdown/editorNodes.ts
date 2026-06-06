/**
 * The Crepe (Milkdown) plugins that teach the editor Orcha's custom inline nodes
 * — role/user mentions, ticket references, and emoji (PRD #36, issue #42).
 *
 * Milkdown's bundled remark pipeline does not understand the ADR-0007 directive
 * grammar on its own, so `:mention[Alice]{…}` would render as literal text. This
 * module supplies the two halves that fix that:
 *   1. `directiveRemark` — registers `remark-directive`, so directive syntax
 *      parses to mdast `textDirective` nodes (matching the backend pipeline in
 *      `markdown/directives.ts`).
 *   2. one `$nodeSchema` per custom node — declares an inline atom whose
 *      Markdown (de)serialisers are thin adapters over the pure mappers in
 *      `directiveNodes.ts`. The schema owns only the editor-boundary concerns
 *      (ProseMirror attrs, DOM rendering of the chip); the attrs↔directive
 *      mapping stays in the tested, headless module.
 *
 * Public API:
 *   - directiveEditorPlugins: MilkdownPlugin[] — pass to `crepe.editor.use(...)`
 *   - mentionSchema / ticketSchema / emojiSchema — the individual node schemas
 *     (exported so commands and autocomplete can reference their node types)
 *
 * The block embeds (ticket card, Excalidraw) live under `nodes/`: they need
 * React node views, which this DOM-only file deliberately avoids.
 */
import { expectDomTypeError } from "@milkdown/kit/exception";
import type { MilkdownPlugin } from "@milkdown/kit/ctx";
import { $nodeSchema, $remark } from "@milkdown/kit/utils";
import remarkDirective from "remark-directive";

import { directiveAutocomplete } from "./autocomplete/autocompletePlugin";
import {
  type DirectiveNode,
  type EmojiAttrs,
  type MentionAttrs,
  emojiFromDirective,
  emojiToDirective,
  mentionFromDirective,
  mentionToDirective,
} from "./directiveNodes";
import { findEmojiChar } from "./emoji";
import { legacyDirectiveDowngrade } from "./legacyDirectives";
import { excalidrawPlugins } from "./nodes/excalidrawNode";
import { ticketPlugins } from "./nodes/ticketNode";

// Each editor attr is either a string or a number on the wire. The DOM stores
// every attr as a `data-*` string, so the schema needs the type to coerce it
// back when ProseMirror re-parses a pasted chip — without this, a mention id
// would round-trip through the DOM as the string "5" instead of the number 5.
type AttrType = "string" | "number";

interface DirectiveNodeConfig<Attrs extends object> {
  // The directive name — used as both the mdast directive `name` and the
  // ProseMirror node name, so the two map one-to-one.
  name: string;
  // The editor attrs and their wire types, in declaration order.
  attrs: { [Key in keyof Attrs]: AttrType };
  fromDirective: (node: DirectiveNode) => Attrs;
  toDirective: (attrs: Attrs) => DirectiveNode;
  // The visible chip text (e.g. `@Alice`, `#123`, an emoji glyph). The label is
  // recovered from attrs on parse, so this is presentation only.
  renderText: (attrs: Attrs) => string;
}

// Build the $nodeSchema for one inline directive node. Every custom node shares
// the same skeleton (inline atom, DOM round-tripped through `data-*` attributes,
// Markdown delegated to directiveNodes.ts); only the name, attrs, mappers, and
// chip text differ, so the skeleton is defined exactly once here.
function inlineDirectiveNode<Attrs extends object>(
  config: DirectiveNodeConfig<Attrs>,
) {
  const attrNames = Object.keys(config.attrs) as (keyof Attrs)[];
  const dataAttr = (key: keyof Attrs) => `data-${String(key)}`;

  return $nodeSchema(config.name, () => ({
    inline: true,
    group: "inline",
    atom: true,
    selectable: true,
    marks: "",
    attrs: Object.fromEntries(
      attrNames.map((key) => [
        key,
        { default: config.attrs[key] === "number" ? 0 : "" },
      ]),
    ),
    parseDOM: [
      {
        tag: `span[data-directive="${config.name}"]`,
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom);
          return Object.fromEntries(
            attrNames.map((key) => {
              const raw = dom.getAttribute(dataAttr(key)) ?? "";
              return [key, config.attrs[key] === "number" ? Number(raw) : raw];
            }),
          );
        },
      },
    ],
    toDOM: (node) => {
      const attrs = node.attrs as Attrs;
      const dom: Record<string, string> = {
        "data-directive": config.name,
        class: `orcha-directive orcha-${config.name}`,
      };
      for (const key of attrNames) dom[dataAttr(key)] = String(attrs[key]);
      return ["span", dom, config.renderText(attrs)];
    },
    parseMarkdown: {
      match: (node) =>
        node.type === "textDirective" && node.name === config.name,
      runner: (state, node, type) => {
        state.addNode(
          type,
          config.fromDirective(node as unknown as DirectiveNode),
        );
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === config.name,
      runner: (state, node) => {
        const directive = config.toDirective(node.attrs as Attrs);
        state.addNode("textDirective", directive.children, undefined, {
          name: directive.name,
          attributes: directive.attributes,
        });
      },
    },
  }));
}

export const mentionSchema = inlineDirectiveNode<MentionAttrs>({
  name: "mention",
  attrs: { mentionType: "string", id: "number", label: "string" },
  fromDirective: mentionFromDirective,
  toDirective: mentionToDirective,
  renderText: (attrs) => `@${attrs.label}`,
});

export const emojiSchema = inlineDirectiveNode<EmojiAttrs>({
  name: "emoji",
  attrs: { name: "string" },
  fromDirective: emojiFromDirective,
  toDirective: emojiToDirective,
  // An unknown shortcode degrades to its literal `:name:` rather than vanishing.
  renderText: (attrs) => findEmojiChar(attrs.name) ?? `:${attrs.name}:`,
});

// remark-directive carries no options; the factory just hands Milkdown the
// plugin. The cast bridges its argless unified signature to the options-typed
// shape `$remark` expects.
export const directiveRemark = $remark(
  "orchaDirective",
  () => remarkDirective as never,
);

// A single flat list so callers register everything with one `editor.use(...)`.
// Each schema/remark helper is a [ctx, plugin] tuple; spreading flattens them so
// Milkdown receives plain MilkdownPlugins, not nested arrays.
export const directiveEditorPlugins: MilkdownPlugin[] = [
  ...directiveRemark,
  ...legacyDirectiveDowngrade,
  ...mentionSchema,
  ...emojiSchema,
  ...ticketPlugins,
  ...excalidrawPlugins,
  directiveAutocomplete,
];
