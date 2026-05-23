import { XIcon } from "@heroicons/react/solid";
import { differenceInMinutes, format, startOfDay } from "date-fns";
import { ceil, floor } from "lodash";
import React, { ReactNode, useState } from "react";
import { TimeOff } from "types/graphql";
import { getColStart, splitDates } from "./utils";
import "./TimeOffEvent.css";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { CalendarUpdateTimeOffModal } from "./CalendarUpdateTimeOffModal";

interface Props {
  timeOff: TimeOff;
  onChange: (timeOffId: number, startAt: Date, stopAt: Date) => void;
  onDelete: (timeOffId: number) => void;
  period: { fromDate: Date; toDate: Date };
}

export const TimeOffEvent: React.FC<Props> = (props) => {
  const { timeOff, period } = props;
  const [isDeleteWarningVisible, setDeleteWarningVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);

  const onDeleteTimeOff = () => {
    props.onDelete(timeOff.id);
  };

  const renderTimeOff = (): ReactNode[] => {
    const nodes: ReactNode[] = [];

    for (const [startTime, stopTime] of splitDates(
      new Date(timeOff.startAt),
      new Date(timeOff.stopAt)
    )) {
      if (stopTime < period.fromDate) {
        continue;
      }

      if (startTime > period.toDate) {
        continue;
      }

      const currentDay = startOfDay(startTime);
      const gridStart = floor(differenceInMinutes(startTime, currentDay) / 5);
      const gridEnd = ceil(differenceInMinutes(stopTime, currentDay) / 5);
      const colStart = getColStart(format(startTime, "c"));

      nodes.push(
        <li
          key={startTime.toISOString()}
          className={`relative mt-px hidden select-none ${colStart} sm:flex`}
          style={{
            gridRow: `${gridStart + 2} / span ${gridEnd - gridStart || 1}`,
          }}
        >
          <div
            role="button"
            onClick={() => setUpdateModalVisible(true)}
            className="time-off-event group absolute inset-x-1.5 inset-y-0.5 flex flex-col items-center justify-center rounded-xl border-4 border-gray-200 px-2 text-xs leading-5 transition-colors hover:border-gray-300"
          >
            <span className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 group-hover:bg-gray-300 group-hover:text-gray-600">
              Blackout Time
            </span>
            <button
              type="button"
              onClick={(event) => {
                setDeleteWarningVisible(true);
                event.stopPropagation();
              }}
              className="absolute top-1 right-1 rounded-full border-2 border-white bg-red-400 p-1 text-red-100 opacity-0 transition-opacity hover:bg-red-600 hover:text-white group-hover:opacity-100"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </li>
      );
    }

    return nodes;
  };

  return (
    <>
      <DangerConfirm
        cta="Delete Blackout Time"
        title="Delete Blackout Time"
        description="Are you sure you want to delete this time off ?"
        visible={isDeleteWarningVisible}
        onClose={() => setDeleteWarningVisible(false)}
        onConfirm={onDeleteTimeOff}
      />
      <CalendarUpdateTimeOffModal
        visible={isUpdateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
        timeOff={timeOff}
        onChange={(startAt, stopAt) =>
          props.onChange(timeOff.id, startAt, stopAt)
        }
      />
      {renderTimeOff()}
    </>
  );
};
