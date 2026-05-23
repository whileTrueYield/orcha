import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { gql } from "@apollo/client";
import { addDays, addHours, format, startOfDay } from "date-fns";
import { filter, map, range } from "lodash";
import { FCWithFragments } from "types";
import { ScheduleItem, WorkWeekTime } from "types/graphql";
import { useOutsideClick } from "hooks/useOutsideClick";
import { CalendarScheduleItem } from "./CalendarScheduleItem";

import cn from "classnames";
import { splitScheduleItem } from "./utils";
import { WorkWeekToEvent } from "./WorkWeekEvents";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";

interface Props {
  scheduleItems: ScheduleItem[];
  workweek: WorkWeekTime;
  timezone: string;
  fromDate: Date;
  className?: string;
  onCreate: (startAt: Date, boundaries: [Date, Date]) => void;
  onDelete: (scheduleItemId: number) => void;
  onChange: (
    scheduleItem: ScheduleItem,
    startDate: Date,
    stopDate: Date | null
  ) => void;
}

export const ScheduleView: FCWithFragments<Props> = (props) => {
  const { scheduleItems, fromDate, onChange, onDelete } = props;

  const dispatch = useAppDispatch();

  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  const period = { fromDate, toDate: addDays(fromDate, 7) };

  useOutsideClick(modalContainerRef, () => {
    if (editScheduleItem) {
      setEditScheduleItem(null);
    }
  });

  const [editScheduleItem, setEditScheduleItem] = useState<ScheduleItem | null>(
    null
  );

  useEffect(() => {
    if (container.current && containerNav.current && containerOffset.current) {
      // Set the container scroll position based on the current time.
      const currentMinute = new Date().getHours() * 60;
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  const events = useMemo(() => {
    // break down over-midnight schedule items
    const events = scheduleItems.reduce(
      (acc: ScheduleItem[], scheduleItem): ScheduleItem[] => [
        ...acc,
        ...splitScheduleItem(scheduleItem),
      ],
      []
    );

    // event dates are string, to speedup filtering we convert the
    // upper and lower limits of the current schedule view to strings
    const nowStr = new Date().toISOString();
    const fromPeriodStr = period.fromDate.toISOString();
    const toPeriodStr = period.toDate.toISOString();

    return filter(
      map(events, (event, index) => {
        if ((event.stoppedAt || nowStr) < fromPeriodStr) {
          return;
        }

        if (event.startedAt > toPeriodStr) {
          return;
        }

        return (
          <CalendarScheduleItem
            key={`${event.id} - ${index}`}
            scheduleItem={event}
            onDelete={() => onDelete(event.id)}
            onChange={(scheduleItem, start, stop) => {
              if (onChange) {
                onChange(scheduleItem, start, stop);
              }
            }}
          >
            <div className="order-1 font-semibold text-sky-700">
              <button
                type="button"
                className="text-left font-semibold hover:underline"
                onClick={(evt) => {
                  evt.stopPropagation();
                  dispatch(showTicketEditModal(event.ticket.id));
                }}
              >
                {event.ticket.title}
              </button>
            </div>
          </CalendarScheduleItem>
        );
      })
    );
  }, [
    scheduleItems,
    onChange,
    period.fromDate,
    period.toDate,
    onDelete,
    dispatch,
  ]);

  const days = map(range(0, 7), (days): Date => addDays(fromDate, days));

  const hours = useMemo(() => {
    const firstHour = startOfDay(new Date());
    return map(range(0, 24), (hour): Date => addHours(firstHour, hour));
  }, []);

  const containerClass = cn(
    "rounded-lg bg-white shadow",
    {
      "overflow-hidden": editScheduleItem,
    },
    props.className
  );

  return (
    <>
      <div className={containerClass} ref={container}>
        <div className="relative flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
          <div
            ref={containerNav}
            className="sticky top-16 z-10 min-w-[1250px] flex-none shadow ring-1 ring-black ring-opacity-5 backdrop-blur sm:pr-8 md:min-w-[700px] lg:min-w-[900px]"
          >
            <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
              {map(days, (day) => (
                <button
                  key={format(day, "EEE ")}
                  type="button"
                  className="flex flex-col items-center pt-2 pb-3"
                >
                  {format(day, "ccccc ")}
                  <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                    {format(day, "PPP") === format(new Date(), "PPP") ? (
                      <span className="flex-1 shrink-0 rounded-full bg-sky-700 p-1 text-white">
                        {format(day, "d")}
                      </span>
                    ) : (
                      format(day, "d")
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
              <div className="col-end-1 w-14"></div>
              {map(days, (day) => (
                <div
                  key={format(day, "EEE ")}
                  className="flex items-center justify-center py-3"
                >
                  {format(day, "EEE ")}
                  {format(day, "PPP") === format(new Date(), "PPP") ? (
                    <span className="flex items-baseline">
                      <span className="ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 font-semibold text-white">
                        {format(day, "d")}
                      </span>
                    </span>
                  ) : (
                    <span>
                      <span className="ml-1 items-center justify-center font-semibold text-gray-900">
                        {format(day, "d")}
                      </span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-[1250px] flex-auto bg-white md:min-w-[700px] lg:min-w-[900px]">
            <div className="sticky left-0 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                style={{ gridTemplateRows: "repeat(48, minmax(3.5rem, 1fr))" }}
              >
                <div ref={containerOffset} className="row-end-1 h-7"></div>
                {hours.map((hour) => (
                  <Fragment key={`hour-${hour}`}>
                    <div>
                      <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                        {format(hour, "p").replace(":00 ", "")}
                      </div>
                    </div>
                    <div></div>
                  </Fragment>
                ))}
              </div>

              {/* Vertical lines */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                <div className="col-start-1 row-span-full" />
                <div className="col-start-2 row-span-full" />
                <div className="col-start-3 row-span-full" />
                <div className="col-start-4 row-span-full" />
                <div className="col-start-5 row-span-full" />
                <div className="col-start-6 row-span-full" />
                <div className="col-start-7 row-span-full" />
                <div className="col-start-8 row-span-full w-8" />
              </div>

              {/* Workweek */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                style={{
                  gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto",
                }}
              >
                <WorkWeekToEvent
                  workweek={props.workweek}
                  timezone={props.timezone}
                  period={period}
                  onClick={props.onCreate}
                />
              </ol>

              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                style={{
                  gridTemplateRows: "1.75rem repeat(288, minmax(0, 1fr)) auto",
                }}
              >
                {events}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ScheduleView.fragments = {
  ScheduleViewFragments: gql`
    fragment ScheduleViewFragments on ScheduleItem {
      id
      roleId
      ticketWorkflowState {
        id
        name
      }
      startedAt
      stoppedAt
      ticket {
        id
        localId
        title
        product {
          id
          code
        }
      }
      ...calendarScheduleItemFragment
    }
    ${CalendarScheduleItem.fragments.calendarScheduleItemFragment}
  `,
};
