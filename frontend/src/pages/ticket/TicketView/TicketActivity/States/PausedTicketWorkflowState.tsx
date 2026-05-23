import { Tag } from "components/tags/Tag";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { ScheduleItem, Ticket, TicketWorkflowState } from "types/graphql";
import { WorkflowStateContributors } from "./WorkflowStateContributors";
import { WorkflowStateStartButton } from "./WorkflowStateStartButton";
import cn from "classnames";
import { WorkflowStateActionMenu } from "./WorkflowStateActionMenu";
import { indexOfBy } from "utils";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { TicketWorkflowStateChecklist } from "../../TicketWorkflowStateChecklist";

interface Props {
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStates: TicketWorkflowState[];
  lastScheduleItem?: ScheduleItem;
  ticket: Ticket;
  isCurrent: boolean;
}

export const PausedTicketWorkflowState: FCWithFragments<Props> = (props) => {
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
    "flex items-center shadow-sm h-10 justify-center rounded-md p-2 text-base font-medium transition focus:relative focus:outline-none focus:ring focus:ring-yellow-600 focus:ring-opacity-50",
    {
      "bg-yellow-700 hover:bg-yellow-600 text-yellow-100 hover:text-white":
        isAssigne && !isBlocked,
      "bg-yellow-300 hover:bg-yellow-400 text-yellow-800 hover:text-yellow-900":
        !isAssigne && !isBlocked,
      "bg-red-700 hover:bg-red-600 text-red-100 hover:text-white": isBlocked,
    }
  );

  const leftButtonClass = cn(buttonClass, "flex-1", {
    "border-r-0": !isAssigne && isCurrent,
    "rounded-r-none": isCurrent,
  });
  const rightButtonClass = cn(buttonClass, "shrink-0 rounded-l-none", {
    "ml-px": isAssigne,
  });

  if (isBlocked) {
    return (
      <div className="flex flex-col space-y-4 bg-red-100 px-4 py-2 text-base text-gray-600 last:rounded-b-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex flex-1 flex-row items-center justify-between rounded text-left font-semibold focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
        >
          <div
            title={ticketWorkflowState.name}
            className="truncate text-base font-semibold"
          >
            {index}. {ticketWorkflowState.name}
          </div>

          <Tag className="shrink-0 bg-red-600 text-sm font-semibold text-white">
            BLOCKED
          </Tag>
        </button>

        <div className="flex flex-col">
          <WorkflowStateContributors
            activeScheduleItems={ticketWorkflowState.scheduleItems}
            assignee={ticketWorkflowState.assignee}
          />
        </div>

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="flex flex-col">
          <div className="mb-2 flex min-w-0 flex-row">
            <WorkflowStateStartButton
              className={leftButtonClass}
              ticket={ticket}
              ticketWorkflowState={ticketWorkflowState}
              startCta="Unblock"
              ticketWorkflowStates={ticketWorkflowStates}
              lastScheduleItem={lastScheduleItem}
            />
            {isCurrent && lastScheduleItem ? (
              <WorkflowStateActionMenu
                className={rightButtonClass}
                lastScheduleItem={lastScheduleItem}
                ticketWorkflowState={ticketWorkflowState}
                ticketWorkflowStates={ticketWorkflowStates}
                ticket={ticket}
                isCurrent={isCurrent}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  } else if (isOpen) {
    return (
      <div className="flex flex-col space-y-4 bg-yellow-100 px-4 py-2 text-base text-yellow-900 last:rounded-b-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex flex-1 flex-row items-center justify-between rounded text-left font-semibold focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
        >
          <div
            title={ticketWorkflowState.name}
            className="truncate text-base font-semibold"
          >
            {index}. {ticketWorkflowState.name}
          </div>

          <Tag className="shrink-0 bg-yellow-600 text-sm font-semibold text-white">
            PAUSED
          </Tag>
        </button>

        <div className="flex flex-col">
          <WorkflowStateContributors
            activeScheduleItems={ticketWorkflowState.scheduleItems}
            assignee={ticketWorkflowState.assignee}
          />
        </div>

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="flex flex-col">
          <div className="mb-2 flex min-w-0 flex-row">
            <WorkflowStateStartButton
              className={leftButtonClass}
              ticket={ticket}
              ticketWorkflowState={ticketWorkflowState}
              startCta="Resume"
              ticketWorkflowStates={ticketWorkflowStates}
              lastScheduleItem={lastScheduleItem}
            />
            {isCurrent && lastScheduleItem ? (
              <WorkflowStateActionMenu
                className={rightButtonClass}
                lastScheduleItem={lastScheduleItem}
                ticketWorkflowState={ticketWorkflowState}
                ticketWorkflowStates={ticketWorkflowStates}
                ticket={ticket}
                isCurrent={isCurrent}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex flex-1 flex-row items-center justify-between  bg-yellow-100 px-4 py-2 text-left text-base font-semibold text-white transition last:rounded-b-xl hover:bg-yellow-600 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50"
      >
        <div
          title={ticketWorkflowState.name}
          className="truncate text-base font-semibold text-yellow-800 transition group-hover:text-yellow-50"
        >
          {index}. {ticketWorkflowState.name}
        </div>
        <Tag className="group-hover:200 shrink-0 bg-yellow-600 text-sm font-semibold text-white transition group-hover:bg-yellow-100 group-hover:text-yellow-600">
          PAUSED
        </Tag>
      </button>
    );
  }
};

PausedTicketWorkflowState.fragments = {
  PausedTicketWorkflowStateFragment: gql`
    fragment PausedTicketWorkflowStateFragment on TicketWorkflowState {
      id
      name
      ...TicketWorkflowStateChecklistFragment
      scheduleItems {
        role {
          id
          ...WorkflowStateContributorsFragment
        }
      }
      assignee {
        id
        ...WorkflowStateContributorsFragment
      }
    }
    ${WorkflowStateContributors.fragments.WorkflowStateContributorsFragment}
    ${TicketWorkflowStateChecklist.fragments
      .TicketWorkflowStateChecklistFragment}
  `,
};
