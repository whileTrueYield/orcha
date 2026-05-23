import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DrawingComponent } from "./Drawing";

type DrawingOptions = {
  drawingId?: number;
};

export const TipTapDrawing = Node.create<DrawingOptions>({
  name: "drawingComponent",

  draggable: true,

  group: "block",

  atom: true,

  addAttributes() {
    return {
      drawingId: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "drawing-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["drawing-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView(attrs?: {}) {
    return ReactNodeViewRenderer(DrawingComponent);
  },
});
