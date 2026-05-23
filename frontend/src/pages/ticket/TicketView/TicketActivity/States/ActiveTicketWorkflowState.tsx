import { Tag } from "components/tags/Tag";
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

interface Props {
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStates: TicketWorkflowState[];
  lastScheduleItem?: ScheduleItem;
  ticket: Ticket;
  isCurrent: boolean;
}

export const ActiveTicketWorkflowState: FCWithFragments<Props> = (props) => {
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

  useEffect(() => {
    setOpen(isCurrent);
  }, [isCurrent]);

  const buttonClass = cn(
    "shadow-sm h-10 justify-center rounded-md p-2 text-base font-medium transition focus:relative focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50",
    {
      "bg-white text-brand-700 hover:text-brand-500": isAssigne,
      "bg-brand-700 border-brand-900 text-brand-100 hover:bg-brand-800 hover:text-white":
        !isAssigne,
    }
  );

  const leftButtonClass = cn(buttonClass, "flex-1 rounded-r-none truncate", {
    "border-r-0": !isAssigne && isCurrent,
    "rounded-r-none": isCurrent,
  });
  const rightButtonClass = cn(buttonClass, "shrink-0 rounded-l-none", {
    "ml-px": isAssigne,
  });

  if (isOpen) {
    return (
      <div className="space-y-4 bg-brand-200 px-4 py-2 text-base text-gray-700  last:rounded-b-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-full flex-row items-center justify-between rounded text-left font-semibold focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
        >
          <div
            title={ticketWorkflowState.name}
            className="flex-1 truncate text-base font-semibold"
          >
            {index}. {ticketWorkflowState.name}
          </div>

          <Tag className="shrink-0 bg-white text-sm font-medium text-brand-700">
            IN PROGRESS
          </Tag>
        </button>

        <WorkflowStateContributors
          activeScheduleItems={ticketWorkflowState.scheduleItems}
          assignee={ticketWorkflowState.assignee}
        />

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="mb-2 flex w-full min-w-0 flex-row">
          <WorkflowStateStartButton
            className={leftButtonClass}
            ticket={ticket}
            ticketWorkflowState={ticketWorkflowState}
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
    );
  } else {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex flex-1 flex-row items-center justify-between bg-brand-700 px-4 py-2 text-left text-base font-semibold text-white transition hover:bg-brand-600 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50"
      >
        <div
          title={ticketWorkflowState.name}
          className="truncate text-base font-semibold text-white"
        >
          {index}. {ticketWorkflowState.name}
        </div>
        <Tag className="shrink-0 bg-white text-sm font-medium text-brand-700">
          IN PROGRESS
        </Tag>
      </button>
    );
  }
};

ActiveTicketWorkflowState.fragments = {
  ActiveTicketWorkflowStateFragment: gql`
    fragment ActiveTicketWorkflowStateFragment on TicketWorkflowState {
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
