import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "components/fields/Button";
import { XIcon } from "@heroicons/react/solid";
import { TicketCombobox } from "components/fields/TicketCombobox";
import { TicketCreateModal } from "pages/ticket/TicketCreate/TicketCreateModal";
import { Ticket } from "types/graphql";
import { get } from "lodash";
import { TicketView } from "./TicketView";

export const TicketCreateComponent: React.FC<NodeViewProps> = (props) => {
  const params = useParams<{ orgId: string; projectId: string }>();
  const projectId = parseInt(params.projectId);
  const { updateAttributes, node } = props;

  const [isModalVisible, _setModalVisible] = useState(
    !!node.attrs.showCreateModal
  );

  const setModalVisible = (visible: boolean) => {
    _setModalVisible(visible);

    // on close store that state
    if (!visible) {
      updateAttributes({ showCreateModal: false });
    }
  };

  const onChangeTicketId = (ticketId: number) => {
    updateAttributes({ ticketId });
  };

  const renderSelectTicket = () => (
    <div className="flex flex-1 flex-row items-center justify-between space-x-2 text-gray-500">
      <div className="flex flex-1 flex-row items-center space-x-2">
        <TicketCombobox
          projectId={projectId}
          className="w-full max-w-md"
          onChange={(ticket) => onChangeTicketId(ticket.id)}
        />
        <span>or</span>
        <Button
          type="button"
          onClick={() => setModalVisible(true)}
          btnType="white"
        >
          New Ticket
        </Button>
      </div>
      <Button
        btnType="secondaryWhite"
        btnSize="icon"
        onClick={() => {
          props.deleteNode();
        }}
      >
        <XIcon className="h-6 w-6" />
      </Button>
    </div>
  );

  const onChange = (ticket: Partial<Ticket>) => {
    const attributes: { [key: string]: any } = {
      title: node.attrs.title,
      description: node.attrs.description,
      projectId: node.attrs.projectId,
      workflowId: node.attrs.workflowId,
      productId: node.attrs.productId,
    };

    for (const attr in attributes) {
      const value = attributes[attr] as any;
      if (get(ticket, attr) !== value) {
        attributes[attr] = get(ticket, attr);
      }
    }

    console.log(attributes);

    updateAttributes(attributes);
  };

  if (node.attrs.ticketId) {
    return (
      <NodeViewWrapper className="react-component" data-drag-handle>
        <TicketView
          ticketId={node.attrs.ticketId}
          onChange={(ticketId) => updateAttributes({ ticketId })}
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="react-component">
      <div
        className="not-prose my-2 flex flex-row items-center space-x-2 py-1"
        contentEditable={false}
      >
        {renderSelectTicket()}
        <TicketCreateModal
          defaultTitle={props.node.attrs.title}
          defaultDescription={props.node.attrs.description}
          defaultProjectId={props.node.attrs.projectId || projectId}
          defaultWorkflowId={props.node.attrs.workflowId}
          defaultProductId={props.node.attrs.productId}
          onCreate={onChangeTicketId}
          onChange={onChange}
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      </div>
    </NodeViewWrapper>
  );
};
