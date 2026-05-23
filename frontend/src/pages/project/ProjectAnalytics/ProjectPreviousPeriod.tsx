import React, { useMemo } from "react";
import { subDays, format } from "date-fns";
import { plural } from "utils/string";
import { WorkedTicketList } from "./ProjectAnalyticPeriod/WorkedTicketList";
import { PastProgress } from "./ProjectAnalyticPeriod/PastProgress";
import { PastWorkflowDistribution } from "./ProjectAnalyticPeriod/PastWorkflowDistribution";

interface Props {
  projectId: number;
  duration: number;
  onEditTicket: (ticketId: number) => void;
}

export const ProjectPreviousPeriod: React.FC<Props> = (props) => {
  const { projectId, duration } = props;

  // we use memo here because with every rendering (any interaction
  // with the ui), we would get a new date object, forcing a data
  // refresh and flooding the backend
  const stopDate = useMemo(() => new Date(), []);
  const startDate = useMemo(
    () => subDays(stopDate, duration),
    [duration, stopDate]
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
          Past {periodLabel}
        </div>
        <div className="hidden text-base text-gray-600 sm:block">
          {format(startDate, "ccc, PP")} - {format(displayEndDate, "ccc, PP")}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-7 lg:gap-6">
        <div className="lg:col-span-4">
          <WorkedTicketList
            projectId={projectId}
            startDate={startDate}
            stopDate={stopDate}
            onEditTicket={props.onEditTicket}
          />
        </div>
        <div className="col-span-3 mt-4 lg:mt-0">
          <PastWorkflowDistribution
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
        <PastProgress
          projectId={projectId}
          startDate={startDate}
          stopDate={stopDate}
        />
      </div>
    </div>
  );
};
