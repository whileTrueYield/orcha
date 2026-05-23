import { Link, useParams } from "react-router-dom";
import { Tag } from "components/tags/Tag";
import { urlResolver } from "utils/navigation";
import {
  ModelStage,
  MutationUnwatchTicketArgs,
  MutationWatchTicketArgs,
  ScheduleItem,
  Ticket,
  TicketStatus,
} from "types/graphql";
import { formatDistanceToNow } from "date-fns";
import { TicketStatusBadge } from "./TicketStatusBadge";
import {
  ArrowCircleRightIcon,
  ClockIcon,
  BookmarkIcon,
  PauseIcon,
  PlayIcon,
  ExternalLinkIcon,
} from "@heroicons/react/solid";
import { BookmarkIcon as OutlineBookmarkIcon } from "@heroicons/react/outline";
import { find, orderBy } from "lodash";
import { SmartTime } from "components/views/Time";
import cn from "classnames";
import { getColor } from "config";
import { useMiniProjects } from "components/fields/ProjectName";
import { gql, useMutation } from "@apollo/client";
import { FCWithFragments } from "types";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  ticket: Ticket;
  index: number;
  visibleFields: string[];
  onEditTicket: (ticketId: number) => void;
}

export const TicketFavoriteRow: FCWithFragments<Props> = (props) => {
  const { ticket, visibleFields } = props;
  const miniProjects = useMiniProjects();
  const role = useSelector(getMe);
  const { orgId } = useParams<{ orgId: string }>();

  const regularCell =
    "px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500";
  const nextState = ticket.lastScheduleItem?.nextTicketWorkflowState;

  const [watchTicket] = useMutation<
    MutationReturnValue["watchTicket"],
    MutationWatchTicketArgs
  >(MUTATE_WATCH_TICKET, {
    onError: onGraphQLError({ title: "Could not favorite ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket added to your favorites",
    }),
  });

  const [unwatchTicket] = useMutation<
    MutationReturnValue["unwatchTicket"],
    MutationUnwatchTicketArgs
  >(MUTATE_UNWATCH_TICKET, {
    onError: onGraphQLError({
      title: "Could not remove ticket from your favorite",
    }),
    onCompleted: onMutationComplete({
      title: "Ticket removed from your favorite",
    }),
  });

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
        return <div className="max-w-[12rem] truncate">{project.name}</div>;
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

  if (!role || !role.role) {
    return null;
  }

  return (
    <tr>
      <td className="pl-1 text-center">
        {ticket.isWatching ? (
          <button
            type="button"
            className="rounded-full p-2 text-pink-400 hover:bg-gray-100 hover:text-pink-500"
            onClick={() =>
              unwatchTicket({ variables: { ticketId: ticket.id } })
            }
            aria-label="Remove ticket from your favorites"
          >
            <BookmarkIcon className="h-6 w-6" />
          </button>
        ) : (
          <button
            type="button"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            onClick={() => watchTicket({ variables: { ticketId: ticket.id } })}
            aria-label="Add ticket to your favorites"
          >
            <OutlineBookmarkIcon className="h-6 w-6" />
          </button>
        )}
      </td>
      <td className={fieldClass("id", `${regularCell} pr-0`)}>
        <TicketIdTag
          localId={ticket.localId}
          milestone={ticket.milestone}
          productCode={ticket.product?.code}
          className="text-xs"
          status={ticket.status}
        />
      </td>
      <td
        className={fieldClass(
          "title",
          `${regularCell} max-w-xs md:max-w-sm lg:max-w-md`
        )}
      >
        <div className="flex min-w-0 flex-row items-center space-x-1">
          <button
            type="button"
            onClick={() => props.onEditTicket(ticket.id)}
            title={ticket.title}
            className="truncate font-medium text-gray-700 hover:text-brand-600 hover:underline"
          >
            {ticket.title}
          </button>
          <Link
            to={urlResolver.ticket.view(orgId, ticket.id)}
            title="Open ticket view"
            className="text-brand-600 hover:text-brand-800"
          >
            <ExternalLinkIcon className="h-4 w-4" />
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

TicketFavoriteRow.fragments = {
  TicketFavoriteRowFragment: gql`
    fragment TicketFavoriteRowFragment on Ticket {
      id
      isWatching
    }
  `,
};

const MUTATE_WATCH_TICKET = gql`
  mutation FavoriteTicket($ticketId: Int!) {
    watchTicket(ticketId: $ticketId) {
      id
      ...TicketFavoriteRowFragment
    }
  }
  ${TicketFavoriteRow.fragments.TicketFavoriteRowFragment}
`;

const MUTATE_UNWATCH_TICKET = gql`
  mutation UnfavoriteTickdet($ticketId: Int!) {
    unwatchTicket(ticketId: $ticketId) {
      id
      ...TicketFavoriteRowFragment
    }
  }
  ${TicketFavoriteRow.fragments.TicketFavoriteRowFragment}
`;
