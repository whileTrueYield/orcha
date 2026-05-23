import React from "react";
import cn from "classnames";

import { gql } from "@apollo/client";
import { groupBy, last, map, sortBy, uniqBy } from "lodash";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { Role, ScheduleItem, Ticket } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { Avatar } from "components/views/Avatar";
import { PauseIcon, PlusIcon } from "@heroicons/react/solid";

interface TicketAssigneesProps extends React.HTMLProps<HTMLDivElement> {
  scheduleItems: ScheduleItem[];
  ticket: Ticket;
}

export const TicketAssignees: FCWithFragments<TicketAssigneesProps> = (
  props
) => {
  const { scheduleItems, ticket, ...otherProps } = props;
  const roles = uniqBy(map(scheduleItems, "role"), "id");
  const { orgId } = useParams<{ orgId: string }>();

  const scheduleItemPerRole = groupBy(scheduleItems, "role.id");

  const isActivelyWorkingOnTask = (role: Role): boolean => {
    const scheduleItems = scheduleItemPerRole[role.id];

    if (scheduleItems && scheduleItems.length) {
      const lastWork = last(sortBy(scheduleItems, "startedAt"));
      // if the last job has a stoppedAt date, we are not working
      // on it anymore
      return lastWork?.stoppedAt ? false : true;
    }

    return false;
  };

  const renderAssignee = (assignee: Role) => {
    const isActive = isActivelyWorkingOnTask(assignee);
    const avatarClass = cn(
      "flex-0 shadow w-10 h-10 border-2 border-white rounded-md mr-2 bg-gray-200",
      {
        "filter-grayscale": !isActive,
      }
    );

    return (
      <div
        key={assignee.id}
        className="group mt-1 flex flex-row items-center rounded-lg py-1 pr-2 pl-1 text-gray-700 transition duration-100 hover:bg-gray-200"
      >
        <div
          className="relative"
          title={
            isActive ? "Currently working on task" : "Stopped working on task"
          }
        >
          <Avatar
            src={assignee.avatarUrl}
            className={avatarClass}
            name={assignee.name}
          />
          {isActive ? null : (
            <PauseIcon className="absolute right-0 top-0 -mt-1 inline-block h-5 w-5 rounded-full bg-white align-text-bottom text-gray-400" />
          )}
        </div>
        <Link
          to={urlResolver.role.view(orgId, assignee.id)}
          className="block flex-1 truncate hover:underline"
        >
          {assignee.name}
        </Link>
      </div>
    );
  };

  const renderNoAssignees = () => (
    <div className="p-2">
      <div className="flex h-20 flex-col items-center justify-center rounded-xl bg-gray-100 p-1 text-lg text-gray-600">
        No assignees
        <div className="text-center text-sm text-gray-500">
          Click
          <PlusIcon className="mx-1 inline-block h-4 w-4 rounded bg-gray-200 leading-4" />
          to assign ticket
        </div>
      </div>
    </div>
  );

  return (
    <div {...otherProps}>
      <div className="mb-2 flex flex-row justify-between text-lg text-gray-700">
        Assignees
      </div>

      {roles.length ? map(roles, renderAssignee) : renderNoAssignees()}
    </div>
  );
};

TicketAssignees.fragments = {
  TicketAssigneesDetails: gql`
    fragment TicketAssigneesDetails on ScheduleItem {
      id
      startedAt
      stoppedAt
      done
      role {
        id
        type
        name
        avatarUrl
      }
    }
  `,
};
