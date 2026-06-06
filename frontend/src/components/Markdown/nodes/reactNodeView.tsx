/**
 * A bridge for rendering a React component as a ProseMirror block node view
 * inside the Crepe editor (PRD #36, issue #42).
 *
 * Crepe is a plain Milkdown editor (not `@milkdown/react`), so there is no React
 * tree to portal into. Each embed therefore mounts its own React root via
 * `createRoot` and re-provides the app singletons it needs — Apollo and Redux —
 * so an embedded card can query its data and dispatch (e.g. open the ticket
 * modal). React Router context is deliberately NOT re-provided: a detached root
 * with its own router would break the app's navigation, so embeds must use
 * dispatch/handlers rather than `<Link>`.
 *
 * Public API:
 *   - reactNodeView(render): NodeViewConstructor — wrap a render fn as a node
 *     view; `render` receives the node attrs plus editor helpers (deleteNode)
 *
 * Used for atom block embeds (ticket card, Excalidraw); the node holds no editable
 * content, so the view stops ProseMirror from touching its DOM.
 */
import { ApolloProvider } from "@apollo/client";
import type { Node } from "@milkdown/kit/prose/model";
import type {
  EditorView,
  NodeView,
  NodeViewConstructor,
} from "@milkdown/kit/prose/view";
import { type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createRoot } from "react-dom/client";

import { GQLClient } from "utils/GQLClient";
import { store } from "store";

function EmbedProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={GQLClient}>
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </ApolloProvider>
  );
}

// Editor actions an embedded component may need; passed alongside the attrs so
// e.g. the Excalidraw embed's trash button can remove its own node.
export interface EmbedHelpers {
  deleteNode: () => void;
}

export function reactNodeView<Attrs>(
  render: (attrs: Attrs, helpers: EmbedHelpers) => ReactNode,
): NodeViewConstructor {
  return (node: Node, view: EditorView, getPos: () => number | undefined): NodeView => {
    const dom = document.createElement("div");
    dom.className = "orcha-embed";
    // The embed is not editable text; ProseMirror should treat it as opaque.
    dom.contentEditable = "false";
    // A draggable embed (ticket card) drags via the native HTML5 attribute on
    // its wrapper; set it explicitly rather than relying on ProseMirror, which
    // only guarantees it for its own (non-custom) node views.
    if (node.type.spec.draggable) dom.draggable = true;

    const helpers: EmbedHelpers = {
      deleteNode: () => {
        const pos = getPos();
        if (pos === undefined) return;
        view.dispatch(view.state.tr.delete(pos, pos + node.nodeSize));
      },
    };

    const root = createRoot(dom);
    const draw = (current: Node) =>
      root.render(
        <EmbedProviders>
          {render(current.attrs as Attrs, helpers)}
        </EmbedProviders>,
      );
    draw(node);

    return {
      dom,
      // The embed owns its DOM and events; keep ProseMirror's selection and
      // mutation observer out of it. One exception: a draggable embed (ticket
      // card) must let PM see drag-and-drop events, or it could never move the
      // node. A non-draggable embed (Excalidraw) keeps even those — the canvas
      // handles its own DnD (e.g. dropping an image onto it).
      stopEvent: (event) =>
        !(node.type.spec.draggable && /^(drag|drop)/.test(event.type)),
      ignoreMutation: () => true,
      // ProseMirror's DEFAULT selectNode sets `dom.draggable = true` on a
      // selected non-draggable node (so the selection can be dragged) — which
      // hijacks pointer drags inside an interactive embed: dragging an
      // Excalidraw element would drag the whole block. Own the selection
      // styling and never touch draggable.
      selectNode: () => dom.classList.add("ProseMirror-selectednode"),
      deselectNode: () => dom.classList.remove("ProseMirror-selectednode"),
      update: (updated) => {
        if (updated.type !== node.type) return false;
        draw(updated);
        return true;
      },
      // Unmount on a microtask: React refuses to unmount a root synchronously
      // while it may be rendering, which a synchronous PM destroy can trigger.
      destroy: () => queueMicrotask(() => root.unmount()),
    };
  };
}
