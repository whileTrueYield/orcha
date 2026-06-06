/**
 * The block ticket embed node for Crepe (PRD #36, issue #42).
 *
 * A ticket reference is a block atom carrying only the ticket's database id; it
 * serialises to the ADR-0007 block directive `::ticket{id="42"}` and renders as
 * the live `TicketEmbed` card via a React node view. The Markdown (de)serialisers
 * are thin adapters over the pure mappers in `directiveNodes.ts`, matching the
 * pattern used by the inline nodes in `editorNodes.ts`.
 *
 * Public API:
 *   - ticketSchema — the $nodeSchema (its `.node` type is referenced by autocomplete)
 *   - ticketPlugins: MilkdownPlugin[] — schema + node view, for `crepe.editor.use`
 */
import { expectDomTypeError } from "@milkdown/kit/exception";
import type { MilkdownPlugin } from "@milkdown/kit/ctx";
import { $nodeSchema, $view } from "@milkdown/kit/utils";

import {
  type DirectiveNode,
  type TicketAttrs,
  ticketFromDirective,
  ticketToDirective,
} from "../directiveNodes";
import { reactNodeView } from "./reactNodeView";
import { TicketEmbed } from "./TicketEmbed";

export const ticketSchema = $nodeSchema("ticket", () => ({
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  attrs: {
    id: { default: 0 },
  },
  parseDOM: [
    {
      tag: 'div[data-directive="ticket"]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom);
        return { id: Number(dom.getAttribute("data-id") ?? "0") };
      },
    },
  ],
  // Fallback DOM (the React node view replaces it live); also what a copy/paste
  // out of the editor carries, so it can be parsed back in.
  toDOM: (node) => [
    "div",
    { "data-directive": "ticket", "data-id": String(node.attrs.id) },
  ],
  parseMarkdown: {
    match: (node) => node.type === "leafDirective" && node.name === "ticket",
    runner: (state, node, type) => {
      state.addNode(type, ticketFromDirective(node as unknown as DirectiveNode));
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === "ticket",
    runner: (state, node) => {
      const directive = ticketToDirective(node.attrs as TicketAttrs);
      state.addNode("leafDirective", directive.children, undefined, {
        name: directive.name,
        attributes: directive.attributes,
      });
    },
  },
}));

const ticketView = $view(ticketSchema.node, () =>
  reactNodeView<TicketAttrs>((attrs) => <TicketEmbed id={attrs.id} />),
);

export const ticketPlugins: MilkdownPlugin[] = [...ticketSchema, ticketView];
