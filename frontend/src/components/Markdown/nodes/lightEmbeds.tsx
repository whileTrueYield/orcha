/**
 * The lightweight block-embed views for read-only Markdown viewers (PRD #36,
 * post-#42 read-surfaces slice).
 *
 * The viewer preset (`directiveViewerPlugins`) reuses the SAME node schemas as
 * the editor — an unregistered block directive crashes Milkdown's parser — but
 * binds cheaper views: many small surfaces (comments, notes) each mount their
 * own Crepe instance, so per-mount cost matters more than richness here.
 *   - `::ticket{id}`        → `TicketInlineEmbed` (TicketIdTag + title, no card)
 *   - `::excalidraw[label]` → a static chip; never mounts the Excalidraw canvas
 *
 * Public API:
 *   - lightEmbedViews: MilkdownPlugin[] — the two $view bindings; compose with
 *     the schemas in `editorNodes.ts` (`directiveViewerPlugins`)
 */
import type { MilkdownPlugin } from "@milkdown/kit/ctx";
import { $view } from "@milkdown/kit/utils";

import { type ExcalidrawAttrs, type TicketAttrs } from "../directiveNodes";
import { excalidrawSchema } from "./excalidrawNode";
import { reactNodeView } from "./reactNodeView";
import { TicketInlineEmbed } from "./TicketInlineEmbed";
import { ticketSchema } from "./ticketNode";

const ticketInlineView = $view(ticketSchema.node, () =>
  reactNodeView<TicketAttrs>((attrs) => <TicketInlineEmbed id={attrs.id} />),
);

// A drawing is far too heavy to mount per comment, and a static chip is all a
// small read surface needs; plain DOM (no React root) keeps it nearly free.
const excalidrawChipView = $view(excalidrawSchema.node, () => (node) => {
  const dom = document.createElement("div");
  dom.className = "orcha-embed";
  dom.contentEditable = "false";

  const attrs = node.attrs as ExcalidrawAttrs;
  const chip = document.createElement("span");
  chip.className =
    "inline-flex max-w-full items-center gap-x-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-sm text-gray-600";
  chip.textContent = `📐 ${attrs.label || `Drawing ${attrs.id}`}`;
  dom.appendChild(chip);

  return {
    dom,
    stopEvent: () => true,
    ignoreMutation: () => true,
  };
});

export const lightEmbedViews: MilkdownPlugin[] = [
  ticketInlineView,
  excalidrawChipView,
];
