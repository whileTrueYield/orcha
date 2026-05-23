import { gql, useQuery } from "@apollo/client";
import { EmptyState } from "components/views/EmtpyState";
import { format, formatDistanceToNow } from "date-fns";
import { groupBy, keyBy, without } from "lodash";
import React, { useMemo, useState } from "react";
import { ProjectGoalProgress, QueryPastGoalProgressArgs } from "types/graphql";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { sortProjectsByAncestry } from "./sortProjectGoals";
import { QueryReturnValue } from "types/queryTypes";
import { ProjectProgressBar } from "./ProjectProgressBar";
import { cumulateProjectProgress } from "./cumulateProjectProgress";

interface Props {
  projectId: number;
  startDate: Date;
  stopDate: Date;
}

export const PastProgress: React.FC<Props> = (props) => {
  const { projectId, startDate, stopDate } = props;
  const [openProjects, setOpenProjects] = useState<number[]>([]);

  const toggleProject = (projectId: number) => {
    if (openProjects.indexOf(projectId) > -1) {
      setOpenProjects(without(openProjects, projectId));
    } else {
      setOpenProjects([...openProjects, projectId]);
    }
  };

  const { data, error, loading } = useQuery<
    QueryReturnValue["pastGoalProgress"],
    QueryPastGoalProgressArgs
  >(GET_PAST_GOAL_PROGRESS, {
    variables: {
      projectId,
      startDate,
      stopDate,
    },
  });

  const goals = useMemo(
    () =>
      cumulateProjectProgress(sortProjectsByAncestry(data?.pastGoalProgress)),
    [data?.pastGoalProgress]
  );
  const goalsByParentId = groupBy(goals, "parentId");
  const goalsByProjectId = keyBy(goals, "id");

  const hasChildren = (goal: ProjectGoalProgress): boolean => {
    const children = goalsByParentId[goal.id];
    return children ? children.length > 0 : false;
  };

  const getDepthFor = (goal?: ProjectGoalProgress, depth = 0): number => {
    if (goal?.parentId && goalsByProjectId[goal.parentId]) {
      return getDepthFor(goalsByProjectId[goal.parentId], depth + 1);
    }

    return depth;
  };

  const isProjectOpen = (goal?: ProjectGoalProgress): boolean => {
    // this is a recursive method it check if the parent is open all the
    // way to the initial folder.
    if (!goal || goal.id === projectId || !goal.parentId) {
      return true;
    }

    if (openProjects.indexOf(goal.parentId) === -1) {
      return false;
    }

    return isProjectOpen(goalsByProjectId[goal.parentId]);
  };

  if (error) {
    return <EmptyState title="Error" subTitle={error?.message} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-10">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data?.pastGoalProgress.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-10">
        <div className="text-lg text-gray-500">No Progress to Report</div>
      </div>
    );
  }

  const tdClass =
    "px-6 py-4 relative whitespace-nowrap text-sm leading-5 text-gray-500";
  const thClassText =
    "px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap";

  const renderGoal = (goal: ProjectGoalProgress) => {
    if (!isProjectOpen(goal)) {
      return null;
    }

    const renderProgress = () => {
      return (
        <>
          <td className={`${tdClass} min-w-[18rem]`}>
            <ProjectProgressBar
              goal={goal}
              title="Done in the Past 2 Weeks"
              labelPreviousWork="previous period"
              labelLeftToDo="left to do"
              labelProgress="past 2 weeks"
              labelTotal="total"
            />
          </td>
        </>
      );
    };
    const renderNoWork = () => {
      return (
        <>
          <td className={`${tdClass} pl-24 text-sm text-gray-400`} colSpan={2}>
            No scheduled tickets in this project
          </td>
        </>
      );
    };

    const renderEta = () => {
      if (goal.eta < new Date().toISOString()) {
        return <td className={`${tdClass} pr-0`}></td>;
      }

      return (
        <td className={`${tdClass} pr-0`}>
          <time
            dateTime={format(new Date(goal.eta), "PPPP")}
            title={format(new Date(goal.eta), "PPPP")}
          >
            {formatDistanceToNow(new Date(goal.eta), {
              addSuffix: true,
            })}
          </time>
        </td>
      );
    };

    return (
      <tr key={goal.id} className="group">
        <td className={tdClass}>
          <div
            className="absolute top-0 left-0 bottom-0 bg-gray-200"
            style={{ width: `${getDepthFor(goal) * 8}px` }}
          />
          <button
            className="flex flex-row items-center space-x-1"
            type="button"
            style={{ paddingLeft: `${getDepthFor(goal) * 8}px` }}
            onClick={() => toggleProject(goal.id)}
          >
            {hasChildren(goal) ? (
              openProjects.indexOf(goal.id) > -1 ? (
                <ChevronDownIcon className="-ml-4 mr-1 h-4 w-4 shrink-0 transition-all" />
              ) : (
                <ChevronDownIcon className="-ml-4 mr-1 h-4 w-4 shrink-0 -rotate-90 transition-all" />
              )
            ) : null}
            <div title={goal.name} className="truncate">
              {goal.name}
            </div>
          </button>
        </td>

        {goal.total ? renderProgress() : renderNoWork()}
        {renderEta()}
      </tr>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto py-2 sm:-mx-4 sm:px-4 ">
        <div className="inline-block min-w-full overflow-y-auto border-b border-gray-200 bg-white align-middle shadow sm:rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thClassText}>Project</th>
                <th className={thClassText}>Progress</th>
                <th className={thClassText}>Completion</th>
                <th className="hidden md:table-cell"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {goals.map(renderGoal)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GET_PAST_GOAL_PROGRESS = gql`
  query PastGoalProgress(
    $projectId: Int!
    $startDate: DateTime!
    $stopDate: DateTime!
  ) {
    pastGoalProgress(
      projectId: $projectId
      startDate: $startDate
      stopDate: $stopDate
    ) {
      id
      name
      parentId
      progress
      accomplished
      total
      eta
    }
  }
`;
