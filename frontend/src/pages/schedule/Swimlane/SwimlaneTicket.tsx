import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { ScheduleItem, Ticket, TicketWorkflowState } from "types/graphql";
import cn from "classnames";
import { Tag } from "components/tags/Tag";
import { GroupTag } from "components/tags/GroupTag";
import { GripIcon } from "./GripIcon";
import { orderBy } from "lodash";

interface Props extends React.ComponentProps<"div"> {
  ticket: Ticket;
  state?: TicketWorkflowState;
  scheduleItem?: ScheduleItem | null;
}

export const SwimlaneTicket: FCWithFragments<Props> = (props) => {
  const { ticket, state, scheduleItem, className, ...divProps } = props;
  const tws = state || ticket.ticketWorkflowStates[0];

  const isBlocked = tws.isBlocked;
  const isActive = !isBlocked && scheduleItem && !scheduleItem.stoppedAt;
  const isNext = !scheduleItem || scheduleItem.nextTicketWorkflowState !== null;
  const isPaused =
    !isBlocked && scheduleItem && !isNext && scheduleItem.stoppedAt !== null;

  const containerClass = cn(
    "sm:w-72 4xl:w-80 group transform translate-x-0 translate-y-0 rounded-md max-w-sm border-2 flex-col text-sm transition-all",
    {
      "hover:bg-red-50 bg-red-100 text-red-800 border-red-200": isBlocked,
      "hover:bg-sky-50 bg-sky-100 text-sky-800 border-sky-200": isActive,
      "hover:bg-orange-50 bg-orange-100 text-orange-800 border-orange-200":
        isPaused,
      "hover:bg-gray-50 bg-white text-gray-600 hover:text-gray-700": isNext,
      relative: props.draggable,
    },
    className
  );

  const footerClassName = cn({
    "bg-sky-200 text-sky-800": isActive,
    "bg-orange-200 text-orange-800": isPaused,
    "bg-gray-200 text-gray-700": isNext,
    "bg-red-200 text-red-700": isBlocked,
  });

  const TagDarkClassName = cn("truncate", {
    "bg-sky-500 text-sky-50": isActive,
    "bg-orange-500 text-orange-50": isPaused,
    "bg-gray-200 text-gray-800": isNext,
  });

  const TagLightClassName = cn("truncate", {
    "bg-sky-200 text-sky-800": isActive,
    "bg-orange-200 text-orange-800": isPaused,
    "bg-gray-100 text-gray-700": isNext,
  });

  const renderTag = () => {
    if (isBlocked) {
      return (
        <Tag className="shrink-0 bg-red-500 font-semibold text-white">
          Blocked
        </Tag>
      );
    } else if (isActive) {
      return (
        <Tag className="shrink-0 bg-sky-500 font-semibold text-white">
          ACTIVE
        </Tag>
      );
    } else if (isPaused) {
      return (
        <Tag className="shrink-0 bg-orange-500 font-semibold text-white">
          PAUSED
        </Tag>
      );
    } else {
      return null;
    }
  };

  const renderProgress = () => {
    return orderBy(ticket.ticketWorkflowStates, "position").map((state) =>
      state.position < tws.position ? (
        <div
          key={state.id}
          className="h-2 w-2 shrink-0 rounded-full bg-sky-400"
        ></div>
      ) : (
        <div
          key={state.id}
          className="h-2 w-2 shrink-0 rounded-full bg-white"
        ></div>
      )
    );
  };

  return (
    <div className={containerClass} {...divProps}>
      <div
        className={cn("flex min-w-0 justify-between space-x-2 p-2 py-3", {
          "pl-6": props.draggable,
        })}
      >
        <div className="truncate font-medium" title={ticket.title}>
          {ticket.title}
        </div>
        {renderTag()}
      </div>
      <div
        className={cn(
          footerClassName,
          "flex flex-row items-center space-x-2 px-1 pb-0.5 pt-1 text-xs"
        )}
      >
        <div className="shrink-0 font-semibold">
          {ticket.product?.code}-{ticket.localId}
        </div>
        <div className="flex-1 truncate text-center font-medium">
          {ticket.workflow?.name}/{tws.name}
        </div>
        <div className="flex shrink-0 flex-row space-x-1 overflow-hidden rounded-br-md px-0.5">
          {renderProgress()}
        </div>
      </div>
      <div className="hidden min-w-0 justify-between space-x-2">
        <GroupTag
          label={`${ticket.localId}`}
          groupLabel={`${ticket.product?.code}`}
          groupBgColor={TagDarkClassName}
          bgColor={TagLightClassName}
        />
        <GroupTag
          className="text-white"
          label={tws.name}
          groupLabel={ticket.workflow ? ticket.workflow.name : "N/A"}
          groupBgColor={TagDarkClassName}
          bgColor={TagLightClassName}
        />
      </div>
      {props.draggable && (
        <div
          className="absolute left-0 top-2 !mt-0 flex flex-row items-center"
          onClick={(event) => event.stopPropagation()}
        >
          <GripIcon className="h-7 w-5 cursor-move text-gray-200 hover:text-gray-400"></GripIcon>
        </div>
      )}
    </div>
  );
};

SwimlaneTicket.fragments = {
  SwimlaneTicketFragment: gql`
    fragment SwimlaneTicketFragment on Ticket {
      id
      title
      localId
      lastScheduleItem {
        id
        stoppedAt
        ticketWorkflowState {
          id
          name
          position
          isActive
          isBlocked
        }
        nextTicketWorkflowState {
          id
          name
          position
          isActive
          isBlocked
        }
      }
      ticketWorkflowStates {
        id
        name
        position
        isActive
        isBlocked
      }
      product {
        id
        code
        name
      }
      workflow {
        id
        name
      }
    }
  `,
};
