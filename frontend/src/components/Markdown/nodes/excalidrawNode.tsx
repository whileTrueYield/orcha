/**
 * The block Excalidraw embed node for Crepe (PRD #36, issue #42).
 *
 * A drawing reference is a block atom carrying the Drawing record's id and an
 * optional caption label; it serialises to the block directive
 * `::excalidraw[label]{id="5"}` and renders the live canvas via a React node
 * view. The Markdown (de)serialisers are thin adapters over the pure mappers in
 * `directiveNodes.ts`, matching `ticketNode.tsx`.
 *
 * Public API:
 *   - excalidrawSchema — the $nodeSchema (its `.node` type is referenced by autocomplete)
 *   - excalidrawPlugins: MilkdownPlugin[] — schema + node view, for `crepe.editor.use`
 */
import { expectDomTypeError } from "@milkdown/kit/exception";
import type { MilkdownPlugin } from "@milkdown/kit/ctx";
import { $nodeSchema, $view } from "@milkdown/kit/utils";

import {
  type DirectiveNode,
  type ExcalidrawAttrs,
  excalidrawFromDirective,
  excalidrawToDirective,
} from "../directiveNodes";
import { reactNodeView } from "./reactNodeView";
import { ExcalidrawEmbed } from "./ExcalidrawEmbed";

export const excalidrawSchema = $nodeSchema("excalidraw", () => ({
  group: "block",
  atom: true,
  selectable: true,
  // NOT draggable: ProseMirror would set the native `draggable` attribute on
  // the node view DOM, and the browser then starts an HTML5 drag of the whole
  // block when the user drags an element across the canvas.
  draggable: false,
  attrs: {
    id: { default: 0 },
    label: { default: "" },
  },
  parseDOM: [
    {
      tag: 'div[data-directive="excalidraw"]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom);
        return {
          id: Number(dom.getAttribute("data-id") ?? "0"),
          label: dom.getAttribute("data-label") ?? "",
        };
      },
    },
  ],
  // Fallback DOM (the React node view replaces it live); also what a copy/paste
  // out of the editor carries, so it can be parsed back in.
  toDOM: (node) => [
    "div",
    {
      "data-directive": "excalidraw",
      "data-id": String(node.attrs.id),
      "data-label": String(node.attrs.label),
    },
  ],
  parseMarkdown: {
    match: (node) => node.type === "leafDirective" && node.name === "excalidraw",
    runner: (state, node, type) => {
      state.addNode(
        type,
        excalidrawFromDirective(node as unknown as DirectiveNode),
      );
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "excalidraw",
    runner: (state, node) => {
      const directive = excalidrawToDirective(node.attrs as ExcalidrawAttrs);
      state.addNode("leafDirective", directive.children, undefined, {
        name: directive.name,
        attributes: directive.attributes,
      });
    },
  },
}));

const excalidrawView = $view(excalidrawSchema.node, () =>
  reactNodeView<ExcalidrawAttrs>((attrs, helpers) => (
    <ExcalidrawEmbed id={attrs.id} onDelete={helpers.deleteNode} />
  )),
);

export const excalidrawPlugins: MilkdownPlugin[] = [
  ...excalidrawSchema,
  excalidrawView,
];
