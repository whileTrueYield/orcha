import { ReactNodeViewRenderer } from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import { TicketCreateComponent } from "./TicketComponent";

type TicketOptions = TicketIdOptions | TicketDetailOptions;

type TicketIdOptions = {
  ticketId?: number;
};

type TicketDetailOptions = {
  showCreateModal?: boolean;
  title?: string;
  description?: string;
  productId?: number;
  workflowId?: number;
  projectId?: number;
};

export const TipTapTicket = Node.create<TicketOptions>({
  name: "ticketComponent",

  draggable: true,

  group: "block",

  atom: true,

  addAttributes() {
    return {
      showCreateModal: { default: false },
      title: { default: "" },
      description: { default: "" },
      productId: { default: null },
      workflowId: { default: null },
      projectId: { default: null },
      ticketId: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "ticket-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["ticket-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView(attrs?: {}) {
    return ReactNodeViewRenderer(TicketCreateComponent);
  },
});
