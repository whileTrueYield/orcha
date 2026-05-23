import { subDays, format, addDays } from "date-fns";
import React, { useMemo } from "react";
import { plural } from "utils/string";
import { ProjectedProgress } from "./ProjectAnalyticPeriod/ProjectedProgress";
import { ProjectedTicketList } from "./ProjectAnalyticPeriod/ProjectedTicketList";
import { ProjectedWorkflowDistribution } from "./ProjectAnalyticPeriod/ProjectedWorkflowDistribution";

interface Props {
  duration: number;
  projectId: number;
  onEditTicket: (ticketId: number) => void;
}

export const ProjectNextPeriod: React.FC<Props> = (props) => {
  const { duration, projectId } = props;

  // we use memo here because with every rendering (any interaction
  // with the ui), we would get a new date object, forcing a data
  // refresh and flooding the backend
  const startDate = useMemo(() => new Date(), []);
  const stopDate = useMemo(
    () => addDays(startDate, duration),
    [duration, startDate]
  );

  // we want to display the included boundary, go back by one day for UI
  const displayEndDate = subDays(stopDate, 1);

  const periodLabel =
    duration % 7
      ? plural("day", "{} days", duration)
      : plural("week", "{} weeks", duration / 7);

  return (
    <div>
      <div className="p-y-1 flex flex-row justify-between border-b border-gray-300">
        <div className="text-lg font-medium text-gray-700">
          Next {periodLabel}
        </div>
        <div className="hidden text-base text-gray-600 sm:block">
          {format(startDate, "ccc, PP")} - {format(displayEndDate, "ccc, PP")}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-7 lg:gap-6">
        <div className="lg:col-span-4">
          <ProjectedTicketList
            onEditTicket={props.onEditTicket}
            projectId={projectId}
            startDate={startDate}
            stopDate={stopDate}
          />
        </div>
        <div className="col-span-3 mt-4 lg:mt-0">
          <ProjectedWorkflowDistribution
            projectId={projectId}
            startDate={startDate}
            stopDate={stopDate}
          />
        </div>
      </div>
      <div className="mt-6">
        <h2 className="mb-2 flex flex-row justify-between space-x-4">
          <div className="text-lg text-gray-800">
            Project Progress: Scheduled Tickets
          </div>
          <div className="hidden text-base text-gray-600 sm:block">
            {format(startDate, "ccc, PP")} - {format(displayEndDate, "ccc, PP")}
          </div>
        </h2>
        <ProjectedProgress
          projectId={projectId}
          startDate={startDate}
          stopDate={stopDate}
        />
      </div>
    </div>
  );
};
