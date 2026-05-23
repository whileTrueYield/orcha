import { subDays } from "date-fns";
import React, { useState } from "react";
import { WorkflowHistogram } from "./ProjectAnalyticPeriod/WorkflowHistogram";

interface Props {
  projectId: number;
}

export const ProjectAnalyticInsight: React.FC<Props> = (props) => {
  const { projectId } = props;
  const [period, setPeriod] = useState(28);

  const stopDate = new Date();
  const startDate = subDays(stopDate, period);

  return (
    <div>
      <div className="p-y-1 flex flex-row justify-between border-b border-gray-300">
        <div className="text-lg font-medium text-gray-700">Insights</div>
        <div className="hidden text-base text-gray-600 sm:block">
          Past
          <select
            value={period}
            className="ml-0.5 rounded-md border-0 bg-gray-100 py-0.5 pl-2 pr-8 text-base font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-brand-300"
            onChange={(event) => setPeriod(parseInt(event.currentTarget.value))}
          >
            <option value={14}>14 days</option>
            <option value={28}>28 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>
      <div className="mt-6">
        <WorkflowHistogram
          projectId={projectId}
          startDate={startDate}
          stopDate={stopDate}
        />
      </div>
    </div>
  );
};
