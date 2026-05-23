import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import {
  RoleStatus,
  ScheduleItem,
  Ticket,
  TicketWorkflowState,
} from "types/graphql";
import { WorkflowStateContributors } from "./WorkflowStateContributors";
import cn from "classnames";
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

export const NewTicketWorkflowState: FCWithFragments<Props> = (props) => {
  const {
    ticketWorkflowState,
    lastScheduleItem,
    ticketWorkflowStates,
    ticket,
    isCurrent,
  } = props;
  const [isOpen, setOpen] = useState(isCurrent);
  const me = useSelector(getMe);
  const isAssignee = ticketWorkflowState.assignee?.id === me?.role?.id;
  const isAssigneeDeactivated =
    ticketWorkflowState.assignee?.status === RoleStatus.Deactivated;
  const index = indexOfBy(ticketWorkflowStates, ticketWorkflowState, "id") + 1;
  const { isBlocked } = ticketWorkflowState;

  useEffect(() => {
    setOpen(isCurrent);
  }, [isCurrent]);

  const buttonClass = cn(
    "flex items-center shadow-sm h-10 justify-center rounded-md p-2 text-base font-medium transition focus:relative focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50",
    {
      "bg-brand-600 hover:bg-brand-700 text-white": isAssignee && !isBlocked,
      "border text-gray-700 border-gray-300 hover:text-gray-500":
        !isAssignee && !isBlocked,
      "bg-red-500 text-red-50": isAssigneeDeactivated && !isBlocked,
      "bg-red-700 hover:bg-red-600 text-red-100 hover:text-white": isBlocked,
      // "bg-white": !isAssigneeDeactivated && !isAssignee,
    }
  );

  const leftButtonClass = cn(buttonClass, "flex-1 rounded-r-none", {
    "border-r-0": !isAssignee,
    // exception to the rule, we don't display a menu on new ticket (without schedule item)
  });
  const rightButtonClass = cn(buttonClass, "shrink-0 rounded-l-none", {
    "ml-px": isAssignee,
  });

  const openStateClass = cn(
    "flex flex-col space-y-4  px-4 py-2 text-base text-gray-600 last:rounded-b-xl",
    {
      "bg-red-100": isAssigneeDeactivated || isBlocked,
      "bg-white": !isAssigneeDeactivated && !isBlocked,
    }
  );

  if (isBlocked) {
    return (
      <div className={openStateClass}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex flex-1 flex-row items-center justify-between rounded text-left font-semibold transition focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
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

        <WorkflowStateContributors
          activeScheduleItems={ticketWorkflowState.scheduleItems}
          assignee={ticketWorkflowState.assignee}
        />

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="flex flex-col">
          <div className="mb-2 flex min-w-0 flex-row">
            <WorkflowStateStartButton
              className={leftButtonClass}
              ticket={ticket}
              startCta="Unblock"
              ticketWorkflowState={ticketWorkflowState}
              ticketWorkflowStates={ticketWorkflowStates}
              lastScheduleItem={lastScheduleItem}
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
      </div>
    );
  } else if (isOpen) {
    return (
      <div className={openStateClass}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex flex-1 flex-row items-center rounded text-left font-semibold transition focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25"
        >
          <span className="mr-1 font-medium text-gray-500">{index}.</span>
          {ticketWorkflowState.name}
        </button>

        <WorkflowStateContributors
          activeScheduleItems={ticketWorkflowState.scheduleItems}
          assignee={ticketWorkflowState.assignee}
        />

        <TicketWorkflowStateChecklist
          ticketWorkflowState={ticketWorkflowState}
        />

        <div className="flex flex-col">
          <div className="mb-2 flex min-w-0 flex-row">
            <WorkflowStateStartButton
              className={leftButtonClass}
              ticket={ticket}
              ticketWorkflowState={ticketWorkflowState}
              ticketWorkflowStates={ticketWorkflowStates}
              lastScheduleItem={lastScheduleItem}
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
      </div>
    );
  } else {
    const className = cn(
      "bg-opacity-25 bg-gray-500 px-4 py-2 text-left text-base font-semibold  transition last:rounded-b-xl focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50",
      {
        "text-red-400 hover:bg-red-400 hover:text-red-100":
          isAssigneeDeactivated,
        "text-brand-400 hover:bg-brand-400 hover:text-brand-100":
          !isAssigneeDeactivated,
      }
    );

    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={ticketWorkflowState.name}
        className={className}
      >
        {index}. {ticketWorkflowState.name}
      </button>
    );
  }
};

NewTicketWorkflowState.fragments = {
  NewTicketWorkflowStateFragment: gql`
    fragment NewTicketWorkflowStateFragment on TicketWorkflowState {
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
