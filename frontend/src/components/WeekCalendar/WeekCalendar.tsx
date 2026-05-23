import { range } from "lodash";
import { CalendarTimePeriod, WeekCalendarDay } from "./WeekCalendarDay";

import "./WeekCalendar.css";
import { WeeklyCalendarEvent } from "./types";

interface Props extends React.HTMLProps<HTMLDivElement> {
  height: number;
  currentDay: Date;
  events: WeeklyCalendarEvent[];
  timeZone: string;
  onEventClick: (event: WeeklyCalendarEvent) => void;
  onVoidClick?: (period: CalendarTimePeriod) => void;
}

export const WeekCalendar: React.FC<Props> = (props) => {
  const {
    height,
    events,
    timeZone,
    currentDay,
    onEventClick,
    onVoidClick,
    ...divProps
  } = props;

  const renderLegend = (hour: number) => {
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
            {range(1, 24).map(renderLegend)}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Sunday</span>
            <span className="md:hidden">Sun</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="sunday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Monday</span>
            <span className="md:hidden">Mon</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="monday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Tuesday</span>
            <span className="md:hidden">Tue</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="tuesday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Wednesday</span>
            <span className="md:hidden">Wed</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="wednesday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Thursday</span>
            <span className="md:hidden">Thu</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="thursday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Friday</span>
            <span className="md:hidden">Fri</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="friday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-10 flex h-10 flex-col justify-center bg-white bg-opacity-50 text-center text-sm font-semibold text-gray-600 backdrop-blur">
            <span className="hidden md:block">Saturday</span>
            <span className="md:hidden">Sat</span>
          </div>
          <WeekCalendarDay
            height={height}
            events={events}
            dayOfTheWeek="saturday"
            className="border-r border-b"
            onEventClick={onEventClick}
            onVoidClick={onVoidClick}
          />
        </div>
      </div>
    </div>
  );
};
