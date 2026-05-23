import { GroupTag } from "components/tags/GroupTag";
import { format } from "date-fns";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ScheduleItem } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { TaskTimer } from "./TaskTimer";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
} from "@heroicons/react/solid";

interface TaskManagerCurrentTaskProps {
  scheduleItem: ScheduleItem;
  onClose: () => void;
}

export const TaskManagerCurrentTask: React.FC<TaskManagerCurrentTaskProps> = (
  props
) => {
  const { scheduleItem, onClose } = props;
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <div className="group relative">
      <div className="absolute inset-0.5 bg-green-400 opacity-0 blur transition-all duration-1000 hover:duration-300 group-hover:opacity-75"></div>
      <div
        className="group relative mb-1 flex flex-col rounded-xl bg-brand-600 p-4 transition hover:bg-brand-700"
        key={`open-schedule-item-${scheduleItem.id}`}
      >
        <div className="flex flex-1 flex-row items-center justify-between">
          <div className="truncate text-gray-100">
            <Link
              to={urlResolver.ticket.view(orgId, scheduleItem.ticket.id)}
              onClick={onClose}
              className="truncate text-lg font-medium hover:underline"
            >
              {scheduleItem.ticket.title}
            </Link>
          </div>
        </div>

        <div className="mt-1 flex flex-row justify-between">
          <div>
            <GroupTag
              className="text-white shadow"
              groupBgColor="bg-brand-800"
              groupLabel={
                scheduleItem.ticket.product
                  ? scheduleItem.ticket.product.code
                  : "N/A"
              }
              label={`#${scheduleItem.ticket.localId}`}
            />
          </div>
          {isDetailVisible ? null : (
            <div className="mt-2 hidden flex-row justify-center text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
              <button
                className="rounded px-2 focus:outline-none"
                onClick={() => setIsDetailVisible(!isDetailVisible)}
              >
                Click for details
                {isDetailVisible ? (
                  <ChevronUpIcon className="ml-0.5 inline-block h-4 w-4 align-bottom text-gray-300" />
                ) : (
                  <ChevronDownIcon className="ml-0.5 inline-block h-4 w-4 align-bottom text-gray-300" />
                )}
              </button>
            </div>
          )}
          <div>
            <GroupTag
              className="text-white shadow"
              groupBgColor="bg-brand-800"
              label={scheduleItem.ticketWorkflowState.name}
              groupLabel={
                scheduleItem.ticket.workflow
                  ? scheduleItem.ticket.workflow.name
                  : "N/A"
              }
            />
          </div>
        </div>
        {isDetailVisible ? (
          <div>
            <div className="mt-4 mb-2">
              <div className="border-t border-white opacity-30"></div>
            </div>
            <div className="flex flex-1 flex-row justify-between">
              <div className="text-sm text-gray-100">
                <PlayIcon className="mr-1 inline-block h-4 w-4 align-text-bottom" />
                <span className="font-semibold">
                  <TaskTimer date={scheduleItem.startedAt} showSeconds />
                </span>{" "}
                so far
              </div>
              <div className="inline text-sm text-gray-100">
                started at
                <span className="ml-1 font-semibold">
                  {format(new Date(scheduleItem.startedAt), "p")}
                </span>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex flex-row justify-center text-xs text-white sm:hidden">
          <button
            className="-mb-2 rounded py-1 px-2 align-text-bottom focus:outline-none"
            onClick={() => setIsDetailVisible(!isDetailVisible)}
          >
            Tap for details
            {isDetailVisible ? (
              <ChevronUpIcon className="ml-0.5 inline-block h-4 w-4 align-bottom text-gray-300" />
            ) : (
              <ChevronDownIcon className="ml-0.5 inline-block h-4 w-4 align-bottom text-gray-300" />
            )}
          </button>
        </div>
        {isDetailVisible ? (
          <div className="mt-2 hidden flex-row justify-center text-xs text-white sm:flex">
            <button
              className="-mb-1 rounded py-1 px-2 focus:outline-none "
              onClick={() => setIsDetailVisible(!isDetailVisible)}
            >
              Hide details
              {isDetailVisible ? (
                <ChevronUpIcon className="ml-0.5 inline-block h-4 w-4 align-bottom text-gray-300" />
              ) : (
                <ChevronDownIcon className="ml-0.5 inline-block h-4 w-4 align-bottom text-gray-300" />
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
