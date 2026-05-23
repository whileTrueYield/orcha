import { CheckIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { ScheduleItem, Ticket, TicketWorkflowState } from "types/graphql";
import { WorkflowStateContributors } from "./WorkflowStateContributors";
import cn from "classnames";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { WorkflowStateActionMenu } from "./WorkflowStateActionMenu";
import { WorkflowStateStartButton } from "./WorkflowStateStartButton";
import { indexOfBy } from "utils";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { TicketWorkflowStateChecklist } from "../../TicketWorkflowStateChecklist";
import { Tag } from "components/tags/Tag";

interface Props {
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStates: TicketWorkflowState[];
  lastScheduleItem?: ScheduleItem;
  ticket: Ticket;
  isCurrent: boolean;
}

export const DoneTicketWorkflowState: FCWithFragments<Props> = (props) => {
  const {
    ticketWorkflowState,
    lastScheduleItem,
    ticketWorkflowStates,
    ticket,
    isCurrent,
  } = props;
  const [isOpen, setOpen] = useState(isCurrent);
  const me = useSelector(getMe);
  const isAssigne = ticketWorkflowState.assignee?.id === me?.role?.id;
  const index = indexOfBy(ticketWorkflowStates, ticketWorkflowState, "id") + 1;
  const { isBlocked } = ticketWorkflowState;

  useEffect(() => {
    setOpen(isCurrent);
  }, [isCurrent]);

  const buttonClass = cn(
    "min-w-0 flex items-center shadow-sm h-10 justify-center rounded-md p-2 text-base font-medium transition focus:relative focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50",
    {
      "bg-green-700 hover:bg-green-600 text-green-100 hover:text-white":
        isAssigne && !isBlocked,
      "bg-green-300 hover:bg-green-400 text-green-800 hover:text-green-900":
        !isAssigne && !isBlocked,
      "bg-red-700 hover:bg-red-600 text-red-100 hover:text-white": isBlocked,
    }
  );

  const leftButtonClass = cn(buttonClass, "flex-1 rounded-r-none", {
    "border-r-0": !isAssigne,
  });
  const rightButtonClass = cn(buttonClass, "shrink-0 rounded-l-none", {
    "ml-px": isAssigne,
  });
  if (isBlocked) {
    return (
      <div className="space-y-4 bg-red-100 px-4 py-2 text-base text-red-900 last:rounded-b-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full flex-row items-center justify-between rounded text-left font-semibold focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
        >
          <span title={ticketWorkflowState.name}>
            {index}. {ticketWorkflowState.name}
          </span>
          <Tag className="shrink-0 bg-red-600 text-sm font-semibold text-white">
            BLOCKED
          </Tag>{" "}
        </button>

        <WorkflowStateContributors
          activeScheduleItems={ticketWorkflowState.scheduleItems}
          assignee={ticketWorkflowState.assignee}
        />

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="mb-2 flex min-w-0 flex-row">
          <WorkflowStateStartButton
            className={leftButtonClass}
            ticket={ticket}
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            lastScheduleItem={lastScheduleItem}
            startCta="Unblock"
          />

          <WorkflowStateActionMenu
            className={rightButtonClass}
            lastScheduleItem={lastScheduleItem}
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            ticket={ticket}
            isCurrent={isCurrent}
          />
        </div>
      </div>
    );
  } else if (isOpen) {
    return (
      <div className="space-y-4 bg-green-100 px-4 py-2 text-base text-green-900 last:rounded-b-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full flex-row items-center justify-between rounded text-left font-semibold focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
        >
          <span title={ticketWorkflowState.name}>
            {index}. {ticketWorkflowState.name}
          </span>
          <CheckIcon className="h-6 w-6 text-green-800" />
        </button>

        <WorkflowStateContributors
          activeScheduleItems={ticketWorkflowState.scheduleItems}
          assignee={ticketWorkflowState.assignee}
        />

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="mb-2 flex min-w-0 flex-row">
          <WorkflowStateStartButton
            className={leftButtonClass}
            ticket={ticket}
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            lastScheduleItem={lastScheduleItem}
            startCta="Resume"
          />

          <WorkflowStateActionMenu
            className={rightButtonClass}
            lastScheduleItem={lastScheduleItem}
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            ticket={ticket}
            isCurrent={isCurrent}
          />
        </div>
      </div>
    );
  } else {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex flex-row items-center justify-between bg-gray-500 bg-opacity-25 px-4 py-2 text-left text-base font-semibold text-green-400 transition last:rounded-b-xl hover:bg-green-600 hover:text-green-100 focus:outline-none focus:ring focus:ring-green-500 focus:ring-opacity-50"
      >
        <span title={ticketWorkflowState.name}>
          {index}. {ticketWorkflowState.name}
        </span>
        <CheckIcon className="h-6 w-6 text-green-300 group-hover:text-brand-100" />
      </button>
    );
  }
};

DoneTicketWorkflowState.fragments = {
  DoneTicketWorkflowStateFragment: gql`
    fragment DoneTicketWorkflowStateFragment on TicketWorkflowState {
      id
      name
      ...TicketWorkflowStateChecklistFragment
      scheduleItems {
        role {
          id
          ...WorkflowStateContributorsFragment
        }
      }
    }
    ${WorkflowStateContributors.fragments.WorkflowStateContributorsFragment}
    ${TicketWorkflowStateChecklist.fragments
      .TicketWorkflowStateChecklistFragment}
  `,
};
