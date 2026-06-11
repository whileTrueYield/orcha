import { CheckIcon } from "@heroicons/react/solid";
import {
  useStartTask,
  useStopTask,
  useUnblockState,
} from "components/taskManager/hooks";
import { filter, some } from "lodash";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { ScheduleItem, Ticket, TicketWorkflowState } from "types/graphql";
import { afterItem } from "utils";
import { TicketChangeAssigneeModal } from "../TicketChangeAssigneeAndStartModal";
import cn from "classnames";
import { onMutationComplete } from "utils/GQLClient";
import { PlainTextModal } from "components/modals/PlainTextModal";
interface Props {
  ticketWorkflowStates: TicketWorkflowState[];
  ticketWorkflowState: TicketWorkflowState;
  lastScheduleItem?: ScheduleItem;
  ticket: Ticket;
  className?: string;
  startCta?: string;
}

export const WorkflowStateStartButton: React.FC<Props> = (props) => {
  const {
    ticketWorkflowState,
    ticketWorkflowStates,
    ticket,
    lastScheduleItem,
  } = props;
  const me = useSelector(getMe);
  const { isBlocked } = ticketWorkflowState;

  const [showCloseTicket, setShowCloseTicket] = useState(false);
  const [confirmStartTask, setConfirmStartTask] = useState(false);
  const [nextTicketWorkflowStateId, setNextTicketWorkflowStateId] = useState<
    number | null
  >(null);
  const [unblockTicketWorkflowState, setUnblockTicketWorkflowState] =
    useState(false);

  const [startTaskHook] = useStartTask();
  const [stopTaskHook] = useStopTask();
  const [unblockStateHook] = useUnblockState();

  const onStartClick = () => {
    if (me?.role?.id === ticketWorkflowState.assigneeId) {
      startTask();
    } else {
      setConfirmStartTask(true);
    }
  };

  const myOpenScheduleItems = filter(ticketWorkflowState.scheduleItems, {
    stoppedAt: null,
    roleId: me?.role?.id,
  });
  const isActive = myOpenScheduleItems.length > 0;

  const isAssigne = ticketWorkflowState.assignee?.id === me?.role?.id;
  const isWorkingOnState = some(
    myOpenScheduleItems,
    (si) => si.role.id === me?.role?.id
  );

  const nextTicketWorkflowState = afterItem(
    ticketWorkflowStates,
    ticketWorkflowState,
    "id"
  );

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

  const goToNextState = (note?: string) => {
    if (lastScheduleItem) {
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
  };

  const closeTicket = (note?: string) => {
    if (lastScheduleItem) {
      stopTaskHook({
        variables: {
          scheduleItemId: lastScheduleItem.id,
          input: {
            done: true,
            note,
          },
        },
      });
    }
  };

  const className = cn(props.className, "group");

  // decide of the CTA
  let cta: string | React.ReactNode = props.startCta || "Start";
  if (isActive) {
    if (nextTicketWorkflowState) {
      cta = (
        <div
          className="flex min-w-0 flex-1 flex-row items-start justify-center"
          title={`Send to ${nextTicketWorkflowState.name}`}
        >
          <span className="flex-1 truncate text-sm font-medium">
            Send to{" "}
            <span className="font-semibold">
              {nextTicketWorkflowState.name}
            </span>
          </span>
        </div>
      );
    } else {
      cta = (
        <div className="relative flex flex-row items-center justify-center">
          <div className="absolute left-1 rounded-full bg-brand-600 p-0.5 text-white group-hover:bg-brand-500">
            <CheckIcon className="h-4 w-4" />
          </div>
          <span className="font-semibold">Mark Done</span>
        </div>
      );
    }
  }

  const onMainActionClick = () => {
    if (isBlocked) {
      setUnblockTicketWorkflowState(true);
    } else if (isActive) {
      if (nextTicketWorkflowState) {
        setNextTicketWorkflowStateId(nextTicketWorkflowState.id);
      } else {
        setShowCloseTicket(true);
      }
    } else {
      onStartClick();
    }
  };

  return (
    <>
      <TicketChangeAssigneeModal
        onClose={() => setConfirmStartTask(false)}
        visible={confirmStartTask}
        ticketWorkflowState={ticketWorkflowState}
        ticket={ticket}
        cta="Change Assignee"
      />
      <PlainTextModal
        cta="Change State"
        description="Leave a note for the next assignee. This note will be displayed publicly below the description of the ticket"
        placeholder="Leave a note, use :emoji, mention @people and link #ticket"
        onClose={() => setNextTicketWorkflowStateId(null)}
        title={`Done with ${ticketWorkflowState.name}`}
        label="Note"
        visible={!!nextTicketWorkflowStateId}
        onSubmit={(value) => goToNextState(value)}
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
          unblockStateHook({
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
        visible={showCloseTicket}
        onClose={() => setShowCloseTicket(false)}
        onSubmit={(value) => closeTicket(value)}
      />
      <button type="button" className={className} onClick={onMainActionClick}>
        {isAssigne || isWorkingOnState || isBlocked ? cta : "Change Assignee"}
      </button>
    </>
  );
};
