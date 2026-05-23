import React, { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { ProjectGoalStats } from "types/graphql";
import { XIcon } from "@heroicons/react/solid";
import { CalendarIcon, CheckIcon } from "@heroicons/react/outline";
import { sortProjectsByAncestry } from "../ProjectAnalyticPeriod/sortProjectGoals";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  projectId: number;
  className?: string;
}

export const ProjectAnalyticGoals: React.FC<Props> = (props) => {
  const { className } = props;
  const projectId = props.projectId;

  const { data, loading } = useQuery<QueryReturnValue["projectGoalStats"]>(
    GET_PROJECT_GOAL_STATS,
    { variables: { projectId } }
  );

  const projectGoalStats = useMemo(
    () => sortProjectsByAncestry(data?.projectGoalStats),
    [data?.projectGoalStats]
  );

  if (loading || !projectGoalStats) {
    return <div>Loading....</div>;
  }

  // TODO: fix the project name, replace by it by the complete path
  const renderGoal = (goal: ProjectGoalStats) => (
    <tr key={goal.id} className="group">
      <td className={tdClass} title={goal.name}>
        {goal.name}
      </td>
      <td className={tdClassNumbers}>{goal.scheduled}</td>
      <td className={tdClassNumbers}>{goal.done}</td>
      <td className={tdClassNumbers}>{goal.cancelled}</td>
    </tr>
  );

  const tdClass = "px-6 py-4 truncate text-sm leading-5 text-gray-500 max-w-xs";
  const tdClassNumbers = tdClass + " w-6";
  const thClassText =
    "px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap";

  return (
    <div className={className}>
      <h2 className="mb-2 flex flex-row justify-between space-x-4">
        <div className="text-lg text-gray-800">Project Stats</div>
      </h2>
      <div className="-my-2 overflow-x-auto py-2 sm:-mx-4 sm:px-4 ">
        <div className="relative inline-block max-h-96 min-w-full overflow-y-auto border-b border-gray-200 bg-white align-middle shadow sm:rounded-lg">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="">
                <th className={thClassText}>Project</th>
                <th className={thClassText} title="Scheduled">
                  <CalendarIcon className="h-5 w-5 text-brand-600" />
                  <span className="sr-only">Scheduled</span>
                </th>
                <th className={thClassText} title="Done">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <span className="sr-only">Done</span>
                </th>
                <th className={thClassText} title="Cancelled">
                  <XIcon className="h-5 w-5 text-red-600" />
                  <span className="sr-only">Cancelled</span>
                </th>
                <th className={`border-b border-gray-200`}></th>
              </tr>
            </thead>
            <tbody className="max-h-48 divide-y divide-gray-200 overflow-y-auto bg-white">
              {projectGoalStats.map(renderGoal)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GET_PROJECT_GOAL_STATS = gql`
  query ProjectAnalyticGoals($projectId: Int!) {
    projectGoalStats(projectId: $projectId) {
      id
      name
      parentId
      total
      done
      scheduled
      unScheduled
      cancelled
    }
  }
`;
