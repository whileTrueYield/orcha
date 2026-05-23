import React from "react";
import { Link, useParams } from "react-router-dom";
import { Tag } from "components/tags/Tag";
import { urlResolver } from "utils/navigation";
import { ModelStage, ScheduleItem, Ticket, TicketStatus } from "types/graphql";
import { formatDistanceToNow } from "date-fns";
import { TicketStatusBadge } from "./TicketStatusBadge";
import {
  ArrowCircleRightIcon,
  ClockIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/solid";
import { find, orderBy } from "lodash";
import { SmartTime } from "components/views/Time";
import cn from "classnames";
import { getColor } from "config";
import { useMiniProjects } from "components/fields/ProjectName";

interface Props {
  ticket: Ticket;
  index: number;
  url: string;
  visibleFields: string[];
}

export const TicketListRow: React.FC<Props> = (props) => {
  const { ticket, visibleFields } = props;
  const miniProjects = useMiniProjects();
  const { orgId } = useParams<{ orgId: string }>();

  const regularCell =
    "px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500";
  const nextState = ticket.lastScheduleItem?.nextTicketWorkflowState;

  const renderAssignee = () => {
    if (
      ticket.lastScheduleItem &&
      ticket.stage === ModelStage.Published &&
      ticket.status === TicketStatus.Scheduled
    ) {
      if (nextState && nextState.assignee) {
        return nextState.assignee.name;
      } else {
        return ticket.lastScheduleItem.role.name;
      }
    } else if (ticket.ticketWorkflowStates.length > 0) {
      const firstState = orderBy(ticket.ticketWorkflowStates, "position")[0];
      return firstState.assignee?.name;
    }
    return null;
  };

  const renderStatus = () => {
    if (
      ticket.lastScheduleItem &&
      ticket.stage === ModelStage.Published &&
      ticket.status === TicketStatus.Scheduled
    ) {
      if (nextState && nextState.assignee) {
        return (
          <div
            className="flex min-w-0 flex-row items-center space-x-1"
            title={`Ready to start on ${nextState.name}`}
          >
            <div className="inline-flex min-w-0 items-center rounded bg-pink-100 px-2 py-0.5  text-xs font-medium leading-5 text-pink-800">
              <ArrowCircleRightIcon className="mr-1 h-4 w-4 flex-none text-pink-400" />
              <div className="truncate font-medium">{nextState.name}</div>
            </div>
          </div>
        );
      } else {
        const getTicketWorkflowState = (scheduleItem: ScheduleItem) => {
          // is it active?
          if (scheduleItem.stoppedAt) {
            return (
              <div
                className="flex min-w-0 flex-row items-center space-x-1"
                title={`${scheduleItem.ticketWorkflowState.name} is paused`}
              >
                <div className="inline-flex min-w-0 items-center rounded bg-yellow-100 px-2 py-0.5  text-xs font-medium leading-5 text-yellow-800">
                  <PauseIcon className="mr-1 h-4 w-4 flex-none text-yellow-500" />
                  <div className="truncate font-medium">
                    {scheduleItem.ticketWorkflowState.name}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div
                className="flex min-w-0 flex-row items-center space-x-1"
                title={`${scheduleItem.ticketWorkflowState.name} is active`}
              >
                <div className="inline-flex min-w-0 items-center rounded bg-brand-100 px-2 py-0.5  text-xs font-medium leading-5 text-blue-800">
                  <PlayIcon className="mr-1 h-4 w-4 flex-none text-brand-500" />
                  <div className="truncate font-medium">
                    {scheduleItem.ticketWorkflowState.name}
                  </div>
                </div>
              </div>
            );
          }
        };

        return (
          <div className="flex flex-row items-center space-x-1">
            {getTicketWorkflowState(ticket.lastScheduleItem)}
          </div>
        );
      }
    } else if (ticket.ticketWorkflowStates.length > 0) {
      return (
        <div className="inline-flex min-w-0 items-center rounded bg-gray-100 px-2 py-0.5  text-xs font-medium leading-5">
          <ClockIcon className="mr-1 h-4 w-4 flex-none text-gray-400" />
          <div className="truncate font-medium text-gray-700">Not Started</div>
        </div>
      );
    }
    return null;
  };

  const renderWorkflow = () => {
    if (ticket.workflow) {
      const colorSet = getColor(ticket.workflow.color);
      return (
        <Tag
          large
          className={`${colorSet.bgColor} ${colorSet.textColor} text-xs font-medium`}
        >
          {ticket.workflow.name}
        </Tag>
      );
    }

    return null;
  };

  const renderProject = (projectId?: number | null) => {
    if (projectId) {
      const project = find(miniProjects, { id: projectId });
      if (project) {
        return <div className="max-w-[12rem] truncate">/{project.name}</div>;
      }
    }
    return <div className="max-w-[12rem]"></div>;
  };

  const fieldClass = (fieldName: string, className?: string) => {
    const visible = visibleFields.indexOf(fieldName) > -1;
    return cn(className, {
      "table-cell": visible,
      hidden: !visible,
    });
  };

  return (
    <tr>
      <td className={fieldClass("id", `${regularCell} pr-0`)}>
        {ticket.localId ? (
          <Tag className="bg-gray-100">
            <span className="mr-1 text-gray-600">
              {ticket.product ? ticket.product.code : "N/A"}
            </span>
            <span className="text-gray-800">{ticket.localId || "--"}</span>
          </Tag>
        ) : null}
      </td>
      <td
        className={fieldClass(
          "title",
          `${regularCell} max-w-xs md:max-w-sm lg:max-w-md`
        )}
      >
        <div className="truncate">
          <Link
            to={urlResolver.ticket.view(orgId, ticket.id)}
            title={ticket.title}
            className="font-medium text-brand-600 hover:text-brand-800"
          >
            {ticket.title}
          </Link>
        </div>
      </td>
      <td className={fieldClass("assignee", regularCell)}>
        {ticket.status === TicketStatus.Scheduled ? (
          <div className="min-w-[10rem]">{renderAssignee()}</div>
        ) : null}
      </td>
      <td className={fieldClass("status", regularCell)}>
        {ticket.status === TicketStatus.Scheduled ? (
          <div className="min-w-[10rem]">{renderStatus()}</div>
        ) : (
          <TicketStatusBadge status={ticket.status} stage={ticket.stage} />
        )}
      </td>
      <td className={fieldClass("eta", regularCell)}>
        {ticket.eta ? (
          <div>
            <div className="font-medium text-gray-700">
              {formatDistanceToNow(new Date(ticket.eta), {
                addSuffix: true,
              })}
            </div>
            <SmartTime date={ticket.eta} />
          </div>
        ) : null}
      </td>
      <td className={fieldClass("product", regularCell)}>
        <div className="truncate">
          {ticket.product ? (
            <div className="max-w-[12rem] truncate" title={ticket.product.name}>
              {ticket.product.name}
            </div>
          ) : (
            ""
          )}
        </div>
      </td>
      <td className={fieldClass("workflow", regularCell)}>
        {renderWorkflow()}
      </td>
      <td className={fieldClass("author", regularCell)}>
        {ticket.author ? (
          <div className="max-w-[12rem] truncate" title={ticket.author.name}>
            {ticket.author.name}
          </div>
        ) : null}
      </td>
      <td className={fieldClass("project", regularCell)}>
        {renderProject(ticket.projectId)}
      </td>

      <td className={fieldClass("creation date", regularCell)}>
        <div className="font-medium text-gray-700">
          {formatDistanceToNow(new Date(ticket.createdAt), {
            addSuffix: true,
          })}
        </div>
        <SmartTime date={ticket.createdAt} />
      </td>
    </tr>
  );
};
