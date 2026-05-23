import { useState } from "react";
import { gql } from "@apollo/client";
import {
  TrashIcon,
  XIcon,
  PauseIcon,
  CheckIcon,
  ArchiveIcon,
  ReplyIcon,
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
import { TipTapTextModal } from "components/modals/TipTapTextModal";

interface Props {
  ticket: Ticket;
  className?: string;
  onTicketStageChange: (stage: ModelStage) => void;
  onTicketStatusChange: (status: TicketStatus, note?: string) => void;
  onMarkTicketNotDone: () => void;
}

export const TicketOtherActions: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const {
    ticket,
    className,
    onTicketStageChange,
    onMarkTicketNotDone,
    onTicketStatusChange,
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
  const history = useHistory();

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
      <TipTapTextModal
        cta={`Yes, Cancel Ticket`}
        label="Cancelling Notes"
        description={`Please confirm you want to cancel this ticket. You may add notes below.`}
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        onSubmit={(note) => onTicketStatusChange(TicketStatus.Cancelled, note)}
        onClose={() => setIsCancelWarningModalVisible(false)}
        title={`Cancel ticket`}
        visible={isCancelWarningModalVisible}
      />
      <TipTapTextModal
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
      status
      stage
    }
  `,
};
