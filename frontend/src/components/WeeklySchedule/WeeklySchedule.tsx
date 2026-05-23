import { filter, range } from "lodash";
import { WeeklyScheduleDay } from "./WeeklyScheduleDay";

import "./WeeklySchedule.css";
import { WeeklyCalendarItem } from "./types";

interface Props extends React.HTMLProps<HTMLDivElement> {
  height: number;
  workTimes: WeeklyCalendarItem[];
  timeZone: string;
  createForm?: (
    item: WeeklyCalendarItem,
    onClose: () => void
  ) => React.ReactNode;
  editForm?: (item: WeeklyCalendarItem, onClose: () => void) => React.ReactNode;
  viewItem?: (item: WeeklyCalendarItem, onClose: () => void) => React.ReactNode;
}

export const WeeklySchedule: React.FC<Props> = (props) => {
  const {
    height,
    createForm,
    editForm,
    viewItem,
    workTimes,
    timeZone,
    ...divProps
  } = props;

  const renderTime = (hour: number) => {
    if (height < 1000) {
      if (hour % 2 === 0) {
        return (
          <div
            key={hour}
            className="absolute right-0 border-b pr-2 text-right text-xs text-gray-400"
            style={{ top: (height / 24) * hour - 18, height: 18 }}
          >
            {hour > 12 ? hour - 12 : hour} {hour < 12 ? "AM" : "PM"}
          </div>
        );
      }
    } else {
      return (
        <div
          key={hour}
          className="absolute right-0 border-b pr-2 text-right text-xs text-gray-400"
          style={{ top: (height / 24) * hour - 18, height: 18 }}
        >
          {hour > 12 ? hour - 12 : hour} {hour < 12 ? "AM" : "PM"}
        </div>
      );
    }
  };

  return (
    <div {...divProps}>
      <div className="flex flex-row">
        <div className="flex flex-col">
          <div className="h-10 w-14 text-center text-sm text-gray-600" />

          <div className="relative border-r" style={{ height }}>
            {range(1, 24).map(renderTime)}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Sunday</span>
            <span className="md:hidden">Su</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "sunday" })}
            dayOfTheWeek="sunday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Monday</span>
            <span className="md:hidden">Mo</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "monday" })}
            dayOfTheWeek="monday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Tuesday</span>
            <span className="md:hidden">Tu</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "tuesday" })}
            dayOfTheWeek="tuesday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Wednesday</span>
            <span className="md:hidden">We</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "wednesday" })}
            dayOfTheWeek="wednesday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Thursday</span>
            <span className="md:hidden">Th</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "thursday" })}
            dayOfTheWeek="thursday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Friday</span>
            <span className="md:hidden">Fr</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "friday" })}
            dayOfTheWeek="friday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Saturday</span>
            <span className="md:hidden">Sa</span>
          </div>
          <WeeklyScheduleDay
            timeZone={timeZone}
            height={height}
            workTimes={filter(workTimes, { dayOfTheWeek: "saturday" })}
            dayOfTheWeek="saturday"
            className="border-r border-b"
            createForm={createForm}
            editForm={editForm}
            viewItem={viewItem}
          />
        </div>
      </div>
    </div>
  );
};
