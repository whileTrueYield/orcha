import { Menu } from "@headlessui/react";
import {
  CheckCircleIcon,
  CollectionIcon,
  UserAddIcon,
  UserRemoveIcon,
} from "@heroicons/react/outline";
import {
  CheckIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/solid";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import {
  useBlockState,
  useStartTask,
  useStopLastTask,
  useStopTask,
  useUnblockState,
} from "components/taskManager/hooks";
import { filter, some } from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { ScheduleItem, Ticket, TicketWorkflowState } from "types/graphql";
import { TicketChangeAssigneeModal } from "../TicketChangeAssigneeAndStartModal";
import { onMutationComplete } from "utils/GQLClient";
import { PlainTextModal } from "components/modals/PlainTextModal";

interface Props {
  className?: string;
  lastScheduleItem?: ScheduleItem;
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStates: TicketWorkflowState[];
  ticket: Ticket;
  isCurrent?: boolean;
}

export const WorkflowStateActionMenu: React.FC<Props> = (props) => {
  const {
    className,
    lastScheduleItem,
    ticket,
    ticketWorkflowState,
    ticketWorkflowStates,
    isCurrent,
  } = props;

  const [nextTicketWorkflowStateId, setNextTicketWorkflowStateId] = useState<
    number | null
  >(null);
  const [confirmJoinTask, setConfirmJoinTask] = useState(false);
  const [confirmChangeAssignee, setConfirmChangeAssignee] = useState(false);
  const [closeScheduleItemId, setCloseScheduleItemId] = useState<number | null>(
    null
  );
  const [blockTicketWorkflowState, setBlockTicketWorkflowState] =
    useState(false);
  const [unblockTicketWorkflowState, setUnblockTicketWorkflowState] =
    useState(false);

  // All the task interaction hooks
  const [startTaskHook] = useStartTask();
  const [stopTaskHook] = useStopTask();
  const [stopLastTaskHook] = useStopLastTask();

  // const [blockTicket] = useMutation<
  //   MutationReturnValue["blockTicket"],
  //   MutationBlockTicketArgs
  // >(BLOCK_TICKET_WORKFLOW_STATE, {
  //   onCompleted: onMutationComplete({ title: "ticket has been blocked" }),
  //   onError: onGraphQLError({ title: "Could not block ticket" }),
  //   refetchQueries: [
  //     "lastTicketWorkflowStateNote",
  //     "GetSingleTicket",
  //     "HookMyOpenScheduleItems",
  //     "HookMyUnfinishedScheduleItems",
  //   ],
  // });

  const [unblockTicket] = useUnblockState();
  const [blockTicket] = useBlockState();

  const me = useSelector(getMe);

  const openScheduleItems = filter(
    ticketWorkflowState.scheduleItems,
    ({ stoppedAt }) => !stoppedAt
  );
  const isWorkingOnState = some(
    openScheduleItems,
    (si) => si.role.id === me?.role?.id
  );

  const closeTicket = (note?: string) => {
    if (closeScheduleItemId) {
      stopLastTaskHook({
        variables: {
          ticketId: ticket.id,
          input: {
            done: true,
            note,
          },
        },
      });
    }
  };

  const startTask = () => {
    startTaskHook({
      variables: {
        input: {
          ticketId: ticketWorkflowState.ticketId,
          ticketWorkflowStateId: ticketWorkflowState.id,
        },
      },
    });
  };

  const stopTask = (note?: string) => {
    if (lastScheduleItem) {
      // if the task has been paused, we are switching to closing
      // the last schedule item
      if (lastScheduleItem.stoppedAt) {
        stopLastTaskHook({
          variables: {
            ticketId: ticket.id,
            input: {
              nextTicketWorkflowStateId,
              done: true,
              note: note ? note : null,
            },
          },
        });
      } else {
        stopTaskHook({
          variables: {
            scheduleItemId: lastScheduleItem.id,
            input: {
              nextTicketWorkflowStateId,
              done: true,
              note: note ? note : null,
              stoppedAt: lastScheduleItem.stoppedAt,
            },
          },
        });
      }
    }
  };

  // Define the menu
  const isCurrentMenu: PopMenuOption[] = [
    {
      type: "info",
      component: (
        <div className="bg-gradient-to-br from-gray-900 to-brand-800 px-4 py-2">
          <div className="text-base font-medium text-gray-100">
            Workflow Actions
          </div>
        </div>
      ),
    },
  ];

  const RegularMenu: PopMenuOption[] = [
    {
      type: "info",
      component: (
        <div className="bg-gradient-to-br from-gray-900 to-brand-800 px-4 py-2">
          <div className="text-base font-medium text-gray-100">
            Workflow Actions
          </div>
        </div>
      ),
    },
    {
      type: "button",
      label: "Change assignee",
      onClick: () => setConfirmChangeAssignee(true),
      icon: (className) => <UserAddIcon className={className} />,
    },
  ];

  if (ticketWorkflowStates.length > 1) {
    isCurrentMenu.push({
      type: "info",
      component: (
        <div className="bg-white py-2 pb-0.5 pl-4 text-xs font-semibold text-gray-500">
          NEXT STATE
        </div>
      ),
    });

    for (const state of ticketWorkflowStates) {
      isCurrentMenu.push({
        type: "button",
        label: ticketWorkflowStates.indexOf(state) + 1 + ". " + state.name,
        icon: (className) => <CollectionIcon className={className} />,
        onClick: () => setNextTicketWorkflowStateId(state.id),
        disabled: state.id === ticketWorkflowState.id,
      });
    }
  }

  isCurrentMenu.push({ type: "separator" });
  isCurrentMenu.push({
    type: "button",
    label: "Change assignee",
    onClick: () => setConfirmChangeAssignee(true),
    icon: (className) => <UserRemoveIcon className={className} />,
  });

  if (lastScheduleItem) {
    isCurrentMenu.push({
      type: "button",
      label: "Mark ticket as done",
      onClick: () => setCloseScheduleItemId(lastScheduleItem.id),
      icon: (className) => <CheckCircleIcon className={className} />,
    });
  }

  if (ticketWorkflowState.assigneeId !== me?.role?.id) {
    isCurrentMenu.push({
      type: "button",
      icon: (className) => <UserAddIcon className={className} />,
      disabled: isWorkingOnState,
      label: (
        <span>
          Pair on{" "}
          <span className="font-semibold">{ticketWorkflowState.name}</span>
        </span>
      ),
      onClick: () => setConfirmJoinTask(true),
    });
  }

  isCurrentMenu.push({ type: "separator" });
  if (ticketWorkflowState.isBlocked) {
    isCurrentMenu.push({
      type: "button",
      success: true,
      label: "Unblock ticket",
      onClick: () => setUnblockTicketWorkflowState(true),
      icon: (className) => <CheckIcon className={className} />,
    });
  } else {
    isCurrentMenu.push({
      type: "button",
      danger: true,
      label: "Mark ticket as blocked",
      onClick: () => setBlockTicketWorkflowState(true),
      icon: (className) => <ExclamationCircleIcon className={className} />,
    });
  }

  return (
    <>
      <ConfirmModal
        title={`Join ${ticketWorkflowState.name}?`}
        description={`Confirm you want to join the effort on ${ticketWorkflowState.name}. The current assignee and their time estimate will remain the same.`}
        visible={!!confirmJoinTask}
        onClose={() => setConfirmJoinTask(false)}
        onConfirm={() => startTask()}
        cta="Join Task"
      />
      <PlainTextModal
        title="Mark ticket as blocked"
        description="Once blocked, nobody will be able to work on that ticket until it is unblocked."
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        cta="Mark ticket as blocked"
        label="Blocking Notes"
        visible={!!blockTicketWorkflowState}
        onClose={() => setBlockTicketWorkflowState(false)}
        onSubmit={(value) => {
          setBlockTicketWorkflowState(false);
          blockTicket({
            variables: {
              ticketId: ticket.id,
              ticketWorkflowStateId: ticketWorkflowState.id,
              note: value,
            },
            onCompleted: onMutationComplete({
              title: "ticket has been blocked",
            }),
          });
        }}
        id="change-state-modal"
      />
      <PlainTextModal
        title="Unblock ticket"
        description="Once unblocked assignees will be able to resume work on this ticket."
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        cta="Unblock ticket"
        label="Unblocking Notes"
        visible={!!unblockTicketWorkflowState}
        onClose={() => setUnblockTicketWorkflowState(false)}
        onSubmit={(value) => {
          setUnblockTicketWorkflowState(false);
          unblockTicket({
            variables: {
              ticketId: ticket.id,
              ticketWorkflowStateId: ticketWorkflowState.id,
              note: value,
            },
            onCompleted: onMutationComplete({
              title: "ticket has been unblocked",
            }),
          });
        }}
      />
      <PlainTextModal
        title="Mark ticket as done"
        description="Once closed, the ticket will no longer be part of the schedule. Make sure the ticket is completed before closing it."
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        cta="Mark ticket as done"
        label="Closing Notes"
        visible={!!closeScheduleItemId}
        onClose={() => setCloseScheduleItemId(null)}
        onSubmit={(value) => closeTicket(value)}
      />
      <PlainTextModal
        cta="Change State"
        description="Leave a note for the next assignee. This note will be displayed publicly below the description of the ticket"
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        onClose={() => setNextTicketWorkflowStateId(null)}
        title={`Done with ${ticketWorkflowState.name}`}
        label="Note"
        visible={!!nextTicketWorkflowStateId}
        onSubmit={(value) => stopTask(value)}
      />
      <TicketChangeAssigneeModal
        onClose={() => setConfirmChangeAssignee(false)}
        visible={confirmChangeAssignee}
        ticketWorkflowState={ticketWorkflowState}
        ticket={ticket}
        cta="Change the assignee"
      />

      <PopMenu
        direction="bottom-left"
        options={isCurrent ? isCurrentMenu : RegularMenu}
        size="xlarge"
      >
        <Menu.Button type="button" className={className}>
          <span className="sr-only">Workflow Actions</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </PopMenu>
    </>
  );
};
