import { partition, uniqBy } from "lodash";
import React from "react";
import { Role, ScheduleItem } from "types/graphql";
import { StateAssigneeAvatar } from "./StateAssigneeAvatar";
import { StateCollaboratorAvatar } from "./StateCollaboratorAvatar";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  activeScheduleItems: ScheduleItem[];
  assignee?: Role | null;
}

export const WorkflowStateContributors: FCWithFragments<Props> = (props) => {
  const { activeScheduleItems, assignee } = props;

  const nodes = [];

  if (activeScheduleItems.length) {
    // prevent having the same role appearing twice
    const scheduleItems = uniqBy(activeScheduleItems, "roleId");

    const [assignees, collaborators] = partition(scheduleItems, (item) =>
      assignee ? assignee.id === item.role.id : true
    );

    if (assignees.length) {
      nodes.push(
        <div className="flex flex-col" key="assignees">
          {assignees.map((item) => (
            <StateAssigneeAvatar role={item.role} key={item.role.id} />
          ))}
        </div>
      );
    } else if (assignee) {
      nodes.push(
        <div className="flex flex-col" key="assignees">
          <StateAssigneeAvatar role={assignee} />
        </div>
      );
    } else {
      nodes.push(
        <div className="flex flex-col text-center italic" key="assignees">
          No assignees
        </div>
      );
    }

    if (collaborators.length) {
      nodes.push(
        <div key="spacer" className="flex flex-row items-center">
          <div className="h-px flex-1 bg-gray-600 opacity-30"></div>
          <div className="mx-2 text-xs">collaborators</div>
          <div className="h-px flex-1 bg-gray-600 opacity-30"></div>
        </div>
      );
      nodes.push(
        <div className="flex flex-col space-y-2" key="collaborators">
          {collaborators.map((item) => (
            <StateCollaboratorAvatar role={item.role} key={item.role.id} />
          ))}
        </div>
      );
    }
    return <div className="flex flex-col space-y-2">{nodes}</div>;
  } else if (assignee) {
    return <StateAssigneeAvatar role={assignee} key={assignee.id} />;
  }

  return null;
};

WorkflowStateContributors.fragments = {
  WorkflowStateContributorsFragment: gql`
    fragment WorkflowStateContributorsFragment on Role {
      id
      ...StateCollaboratorAvatarFragment
      ...StateAssigneeAvatarFragment
    }
    ${StateCollaboratorAvatar.fragments.StateCollaboratorAvatarFragment}
    ${StateAssigneeAvatar.fragments.StateAssigneeAvatarFragment}
  `,
};
