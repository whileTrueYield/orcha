import { useState } from "react";
import { gql } from "@apollo/client";
import {
  TrashIcon,
  XIcon,
  PauseIcon,
  CheckIcon,
  ArchiveIcon,
  ReplyIcon,
  RefreshIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/outline";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { ModelStage, Ticket, TicketStatus } from "types/graphql";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { PlainTextModal } from "components/modals/PlainTextModal";
import { ChangeWorkflowModal } from "./ChangeWorkflowModal";
import { SupersedeWorkflowModal } from "./SupersedeWorkflowModal";
import { ChangeProductModal } from "./ChangeProductModal";

interface Props {
  ticket: Ticket;
  className?: string;
  onTicketStageChange: (stage: ModelStage) => void;
  onTicketStatusChange: (status: TicketStatus, note?: string) => void;
  onMarkTicketNotDone: () => void;
  onChangeWorkflow: (workflowId: number, productId?: number) => void;
  onSupersedeWorkflow: (workflowId: number, productId?: number) => void;
}

export const TicketOtherActions: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const {
    ticket,
    className,
    onTicketStageChange,
    onMarkTicketNotDone,
    onTicketStatusChange,
    onChangeWorkflow,
    onSupersedeWorkflow,
  } = props;

  const [isCancelWarningModalVisible, setIsCancelWarningModalVisible] =
    useState(false);

  const [isDoneWarningModalVisible, setIsDoneWarningModalVisible] =
    useState(false);

  const [isNotDoneWarningModalVisible, setIsNotDoneWarningModalVisible] =
    useState(false);

  const [isArchiveWarningModalVisible, setIsArchiveWarningModalVisible] =
    useState(false);

  const [isUnscheduleWarningModalVisible, setIsUnscheduleWarningModalVisible] =
    useState(false);

  const [isDeleteDangerModalVisible, setIsDeleteDangerModalVisible] =
    useState(false);

  const [isChangeWorkflowModalVisible, setIsChangeWorkflowModalVisible] =
    useState(false);

  const [isChangeProductModalVisible, setIsChangeProductModalVisible] =
    useState(false);
  const history = useHistory();

  // Changing a workflow is only meaningful for a published ticket that still has
  // both a product and a workflow to swap between.
  const canChangeWorkflow =
    ticket.stage === ModelStage.Published &&
    !!ticket.product?.id &&
    !!ticket.workflow?.id;

  // The fork (ADR 0010): a ticket with logged work can't be rewritten in place —
  // it must be superseded (close the original, continue on a new linked ticket).
  // One "Change Workflow" action picks the matching confirmation. The backend
  // remains the authoritative gate.
  const hasLoggedWork = (ticket.loggedWorkSeconds ?? 0) > 0;

  // Human reference to the ticket being superseded (e.g. "TWKS-42"), used in the
  // supersede confirmation so the user knows exactly which ticket closes.
  const ticketReference =
    ticket.product?.code && ticket.localId
      ? `${ticket.product.code}-${ticket.localId}`
      : `#${ticket.id}`;

  const stageOptions: PopMenuOption[] = [
    {
      label: "Archive Ticket",
      type: "button",
      icon: (className) => <ArchiveIcon className={className} />,
      onClick: () => setIsArchiveWarningModalVisible(true),
      disabled: ticket.stage === ModelStage.Archived,
      danger: true,
    },
    {
      label: "Delete Ticket",
      type: "button",
      danger: true,
      icon: (className) => <TrashIcon className={className} />,
      onClick: () => setIsDeleteDangerModalVisible(true),
    },
  ];

  const doneOptions: PopMenuOption[] = [
    {
      label: "Revert to Not Done",
      type: "button",
      icon: (className) => <ReplyIcon className={`${className} transform`} />,
      onClick: () => setIsNotDoneWarningModalVisible(true),
      disabled:
        ticket.status !== TicketStatus.Done &&
        ticket.stage === ModelStage.Published,
    },
  ];
  const scheduledOptions: PopMenuOption[] = [
    {
      label: "Change Workflow",
      type: "button",
      icon: (className) => <RefreshIcon className={className} />,
      onClick: () => setIsChangeWorkflowModalVisible(true),
      disabled: !canChangeWorkflow,
    },
    {
      label: "Change Product",
      type: "button",
      icon: (className) => <SwitchHorizontalIcon className={className} />,
      onClick: () => setIsChangeProductModalVisible(true),
      disabled: !canChangeWorkflow,
    },
    {
      label: "Unschedule Ticket",
      type: "button",
      icon: (className) => <PauseIcon className={className} />,
      onClick: () => setIsUnscheduleWarningModalVisible(true),
      disabled:
        ticket.status !== TicketStatus.Scheduled ||
        ticket.stage !== ModelStage.Published,
    },
    {
      label: "Cancel Ticket",
      type: "button",
      icon: (className) => <XIcon className={className} />,
      onClick: () => setIsCancelWarningModalVisible(true),
      disabled:
        ticket.status === TicketStatus.Cancelled ||
        ticket.stage !== ModelStage.Published,
    },
    {
      label: "Mark Ticket as Done",
      type: "button",
      icon: (className) => <CheckIcon className={className} />,
      onClick: () => setIsDoneWarningModalVisible(true),
      disabled:
        ticket.status === TicketStatus.Done ||
        ticket.stage !== ModelStage.Published,
    },
  ];

  const scheduledMenuOptions: PopMenuOption[] = [
    ...scheduledOptions,
    { type: "separator" },
    ...stageOptions,
  ];

  const doneMenuOptions: PopMenuOption[] = [
    ...doneOptions,
    { type: "separator" },
    ...stageOptions,
  ];

  const isDone =
    props.ticket.status === TicketStatus.Cancelled ||
    props.ticket.status === TicketStatus.Done;

  return (
    <div className={className}>
      <WarningConfirm
        cta={`Yes, archive ticket`}
        description={`Are you sure you want to archive this ticket? Once archived, a ticket may not be resumed.`}
        onConfirm={() => onTicketStageChange(ModelStage.Archived)}
        onClose={() => setIsArchiveWarningModalVisible(false)}
        title={`Archive ticket?`}
        visible={isArchiveWarningModalVisible}
      />
      <PlainTextModal
        cta={`Yes, Cancel Ticket`}
        label="Cancelling Notes"
        description={`Please confirm you want to cancel this ticket. You may add notes below.`}
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        onSubmit={(note) => onTicketStatusChange(TicketStatus.Cancelled, note)}
        onClose={() => setIsCancelWarningModalVisible(false)}
        title={`Cancel ticket`}
        visible={isCancelWarningModalVisible}
      />
      <PlainTextModal
        description={`Please confirm you want to make this ticket as done. You may add notes below.`}
        cta={`Mark Ticket as Done`}
        label="Closing Notes"
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        onSubmit={(note) => onTicketStatusChange(TicketStatus.Done, note)}
        onClose={() => setIsDoneWarningModalVisible(false)}
        title={`Mark ticket as done?`}
        visible={isDoneWarningModalVisible}
      />
      <ConfirmModal
        description={`Please confirm you want to mark this ticket as not done. This will put this ticket back in the schedule in its last workflow state.`}
        cta={`Revert to Not Done`}
        onConfirm={() => onMarkTicketNotDone()}
        onClose={() => setIsNotDoneWarningModalVisible(false)}
        title={`Revert to Not Done?`}
        visible={isNotDoneWarningModalVisible}
      />
      <ConfirmModal
        cta={`Yes, Unschedule Ticket`}
        description={`Are you sure you want to unschedule this ticket?`}
        onConfirm={() => onTicketStatusChange(TicketStatus.Unscheduled)}
        onClose={() => setIsUnscheduleWarningModalVisible(false)}
        title={`Unschedule ticket?`}
        visible={isUnscheduleWarningModalVisible}
      />
      <DangerConfirm
        cta={`Yes, Delete Ticket`}
        description={`Are you sure you want to delete this ticket? This action cannot be undone.`}
        onConfirm={() => {
          onTicketStageChange(ModelStage.Deleted);
          history.replace(
            ticket.project
              ? urlResolver.explorer.listing(orgId, ticket.project?.id)
              : urlResolver.explorer.root(orgId)
          );
        }}
        onClose={() => setIsDeleteDangerModalVisible(false)}
        title={`Delete ticket?`}
        visible={isDeleteDangerModalVisible}
      />
      {canChangeWorkflow && hasLoggedWork ? (
        <SupersedeWorkflowModal
          productId={ticket.product!.id}
          currentWorkflowId={ticket.workflow!.id}
          ticketReference={ticketReference}
          loggedWorkSeconds={ticket.loggedWorkSeconds ?? 0}
          onConfirm={(workflowId) => onSupersedeWorkflow(workflowId)}
          onClose={() => setIsChangeWorkflowModalVisible(false)}
          visible={isChangeWorkflowModalVisible}
        />
      ) : null}
      {canChangeWorkflow && !hasLoggedWork ? (
        <ChangeWorkflowModal
          productId={ticket.product!.id}
          currentWorkflowId={ticket.workflow!.id}
          onConfirm={(workflowId) => onChangeWorkflow(workflowId)}
          onClose={() => setIsChangeWorkflowModalVisible(false)}
          visible={isChangeWorkflowModalVisible}
        />
      ) : null}
      {canChangeWorkflow ? (
        <ChangeProductModal
          currentProductId={ticket.product!.id}
          currentWorkflowId={ticket.workflow!.id}
          ticketReference={ticketReference}
          hasLoggedWork={hasLoggedWork}
          onChange={(productId, workflowId) =>
            onChangeWorkflow(workflowId, productId)
          }
          onSupersede={(productId, workflowId) =>
            onSupersedeWorkflow(workflowId, productId)
          }
          onClose={() => setIsChangeProductModalVisible(false)}
          visible={isChangeProductModalVisible}
        />
      ) : null}
      <PopMenu
        direction="bottom-left"
        size="large"
        options={isDone ? doneMenuOptions : scheduledMenuOptions}
      >
        <Button
          block
          btnType="white"
          asElement={(className) => (
            <Menu.Button className={className}>
              Other Actions
              <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 shrink-0" />
            </Menu.Button>
          )}
        />
      </PopMenu>
    </div>
  );
};

TicketOtherActions.fragments = {
  TicketOtherActionsDetails: gql`
    fragment TicketOtherActionsDetails on Ticket {
      id
      localId
      status
      stage
      loggedWorkSeconds
      product {
        id
        code
      }
      workflow {
        id
      }
    }
  `,
};
