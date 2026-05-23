import React, { useCallback, useState } from "react";
import { ScheduleItem } from "./ScheduleItem";
import { WeeklyCalendarEvent } from "./types";
import { useClock } from "components/Clock";
import { differenceInMinutes, format, startOfDay } from "date-fns";
import { filter } from "lodash";
import { PlusIcon } from "@heroicons/react/solid";

interface CalendarTime {
  hours: number;
  minutes: number;
}

export interface CalendarTimePeriod {
  start: CalendarTime;
  stop: CalendarTime;
  day: string;
}

interface Props extends React.HTMLProps<HTMLDivElement> {
  height: number;
  dayOfTheWeek: string;
  events: WeeklyCalendarEvent[];
  onEventClick: (event: WeeklyCalendarEvent) => void;
  onVoidClick?: (period: CalendarTimePeriod) => void;
}

export const WeekCalendarDay: React.FC<Props> = (props) => {
  const {
    height,
    dayOfTheWeek,
    onEventClick,
    events,
    onVoidClick,
    ...divProps
  } = props;
  const [isOver, setIsOver] = useState(false);
  const [hoverLinePosition, setHoverLinePosition] = useState(0);

  const computeTopValue = useCallback(() => {
    const zonedTime = new Date();
    const midnight = startOfDay(zonedTime);
    const localDayOfTheWeek = format(zonedTime, "EEEE").toLowerCase();

    // only display the topValue if this section represents today's date
    if (dayOfTheWeek !== localDayOfTheWeek) {
      return "";
    }

    const minutesSinceMidnight = differenceInMinutes(zonedTime, midnight);
    const top = (height / (60 * 24)) * minutesSinceMidnight;
    return `${Math.round(top)}px`;
  }, [height, dayOfTheWeek]);

  const [topValue] = useClock(computeTopValue);

  const secondHeight = height / (24 * 3600);

  const renderEvent = (item: WeeklyCalendarEvent, index: number) => {
    return (
      <ScheduleItem
        className={item.className}
        onItemClick={props.onEventClick}
        onMouseEnter={() => setIsOver(false)}
        onMouseLeave={() => setIsOver(true)}
        key={index}
        item={item}
        secondHeight={secondHeight}
      />
    );
  };

  const renderCurrentTimeline = () => {
    if (topValue) {
      return (
        <div
          style={{ top: topValue }}
          className="pointer-events-none absolute inset-x-0 h-0.5 bg-pink-400 shadow"
        />
      );
    }

    return null;
  };

  const dayEvents = filter(events, (event) => {
    // only show events that are on the same day as this section
    return (
      format(event.startDate, "EEEE").toLowerCase() === dayOfTheWeek ||
      format(event.stopDate, "EEEE").toLowerCase() === dayOfTheWeek
    );
  });

  const roundToTheNextMinutes = (minutes: number, precision: number = 15) => {
    return Math.floor(minutes / precision) * precision;
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // trigger the callback with the top position of the event converted into a time
    const time = (hoverLinePosition / height) * 24 * 3600;
    const startHour = Math.floor(time / 3600);
    const startMinute = roundToTheNextMinutes(Math.round((time % 3600) / 60));
    let stopHour = startHour;
    let stopMinute = startMinute + 30;

    if (stopMinute >= 60) {
      stopHour = stopHour + 1;
      stopMinute = stopMinute - 30;
    }

    if (stopHour >= 24) {
      stopHour = 23;
      stopMinute = 59;
    }

    onVoidClick?.({
      start: { hours: startHour, minutes: startMinute },
      stop: { hours: stopHour, minutes: stopMinute },
      day: dayOfTheWeek,
    });
  };

  // draw a line at the current time but at a 5 minute interval
  const onMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { top } = event.currentTarget.getBoundingClientRect();
    const time = ((event.clientY - top) / height) * 24 * 3600;
    const hours = Math.floor(time / 3600);
    const minutes = roundToTheNextMinutes(Math.round((time % 3600) / 60));
    if (hours > 22 && minutes > 30) {
      setHoverLinePosition((23 * 3600 + 30 * 60) * secondHeight);
    } else {
      setHoverLinePosition((hours * 3600 + minutes * 60) * secondHeight);
    }
  };

  return (
    <div {...divProps}>
      <div
        className="timeline-container relative"
        onClick={onVoidClick && onClick}
        style={{ height }}
        onMouseEnter={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
        onMouseMove={onVoidClick && onMouseMove}
      >
        {isOver && (
          <div
            style={{ top: hoverLinePosition, height: secondHeight * 60 * 30 }}
            className="absolute inset-x-1 flex items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400"
          >
            <PlusIcon className="h-4 w-4" />
          </div>
        )}
        {dayEvents.map(renderEvent)}
        {renderCurrentTimeline()}
      </div>
    </div>
  );
};
