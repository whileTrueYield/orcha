import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  endOfDay,
  format,
  startOfDay,
  differenceInMinutes,
  addMinutes,
  roundToNearestMinutes,
} from "date-fns";
import { floor } from "lodash";
import { gql, useLazyQuery } from "@apollo/client";
import { ScheduleItem } from "types/graphql";
import { CalendarItemEditModal } from "./CalendarItemEditModal";
import { getColStart } from "./utils";
import { FCWithFragments } from "types";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  children?: React.ReactNode;
  onChange: (
    scheduleItem: ScheduleItem,
    startDate: Date,
    stopDate: Date | null
  ) => void;
  scheduleItem: ScheduleItem;
  onDelete: () => void;
}

export const CalendarScheduleItem: FCWithFragments<Props> = (props) => {
  const { onChange, scheduleItem } = props;

  const [showEditForm, setShowEditForm] = useState(false);

  const startedAt = useMemo(
    () => new Date(scheduleItem.startedAt),
    [scheduleItem.startedAt]
  );

  const stoppedAt = useMemo(
    () =>
      scheduleItem.stoppedAt ? new Date(scheduleItem.stoppedAt) : new Date(),
    [scheduleItem.stoppedAt]
  );

  const [startDate, setStartDate] = useState(startedAt);
  const [stopDate, setStopDate] = useState(stoppedAt);

  useEffect(() => {
    setStartDate(startedAt);
    setStopDate(stoppedAt);
  }, [startedAt, stoppedAt, setStartDate, setStopDate]);

  const topResizeRef = useRef<HTMLDivElement>(null);
  const bottomResizeRef = useRef<HTMLDivElement>(null);
  const liElementRef = useRef<HTMLLIElement>(null);

  const [topResizeMouseDown, setTopResizeMouseDown] = useState(false);
  const [bottomResizeMouseDown, setBottomResizeMouseDown] = useState(false);

  const [getItemBoundary] = useLazyQuery<
    QueryReturnValue["scheduleItemUpdateBoundaries"]
  >(GET_SCHEDULE_ITEM_BOUNDARIES_QUERY, { fetchPolicy: "network-only" });

  const todayStartOfDay = useMemo(() => startOfDay(startedAt), [startedAt]);
  const todayEndOfDay = useMemo(() => endOfDay(startedAt), [startedAt]);

  const [minDateTime, setMinDateTime] = useState(todayStartOfDay);
  const [maxDateTime, setMaxDateTime] = useState(todayEndOfDay);

  const startDay = useMemo(() => format(startedAt, "c"), [startedAt]);

  const gridStart = floor(differenceInMinutes(startDate, todayStartOfDay) / 5);
  const gridEnd = floor(differenceInMinutes(stopDate, todayStartOfDay) / 5);

  const setBoundaries = async () => {
    const { data } = await getItemBoundary({
      variables: { scheduleItemId: scheduleItem.id },
    });

    if (data?.scheduleItemUpdateBoundaries?.maxDate) {
      const maxDate = new Date(data.scheduleItemUpdateBoundaries.maxDate);
      setMaxDateTime(maxDate < maxDateTime ? maxDate : maxDateTime);
    }

    if (data?.scheduleItemUpdateBoundaries?.minDate) {
      const minDate = new Date(data.scheduleItemUpdateBoundaries.minDate);
      setMinDateTime(minDate > minDateTime ? minDate : minDateTime);
    }
  };

  // Top stretch of the event
  useEffect(() => {
    const elt = topResizeRef.current;
    const liElt = liElementRef.current;

    if (elt && topResizeMouseDown && liElt) {
      const containerRect = liElt.parentElement!.getBoundingClientRect();
      const eltRect = elt.getBoundingClientRect();

      const pxMinute = containerRect.height / (24 * 60);

      let newStartDate = startedAt;
      const onMove = (event: MouseEvent) => {
        const delta = (event.clientY - eltRect.y) / pxMinute;
        newStartDate = roundToNearestMinutes(addMinutes(startedAt, delta), {
          nearestTo: 5,
        });
        newStartDate = minDateTime < newStartDate ? newStartDate : minDateTime;
        setStartDate(newStartDate);
      };

      const onMouseUp = () => {
        setTopResizeMouseDown(false);
        onChange(
          scheduleItem,
          newStartDate,
          scheduleItem.stoppedAt ? stopDate : null // ongoing task do not have a stop date
        );
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onMouseUp);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [
    topResizeRef,
    topResizeMouseDown,
    setTopResizeMouseDown,
    stopDate,
    setStartDate,
    minDateTime,
    stoppedAt,
    startedAt,
    onChange,
    scheduleItem,
  ]);

  // Bottom stretch of the event
  useEffect(() => {
    const elt = bottomResizeRef.current;
    const liElt = liElementRef.current;

    if (elt && bottomResizeMouseDown && liElt) {
      const containerRect = liElt.parentElement!.getBoundingClientRect();
      const eltRect = elt.getBoundingClientRect();

      const pxMinute = containerRect.height / (24 * 60);
      let newStopDate = stoppedAt;

      const onMove = (event: MouseEvent) => {
        const delta = Math.round(event.clientY - eltRect.y) / pxMinute;
        newStopDate = roundToNearestMinutes(addMinutes(stoppedAt, delta), {
          nearestTo: 5,
        });
        newStopDate = maxDateTime > newStopDate ? newStopDate : maxDateTime;
        setStopDate(newStopDate);
      };

      const onMouseUp = () => {
        setBottomResizeMouseDown(false);
        onChange(
          scheduleItem,
          startDate,
          scheduleItem.stoppedAt ? newStopDate : null // ongoing task do not have a stop date
        );
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onMouseUp);

      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [
    bottomResizeRef,
    bottomResizeMouseDown,
    setBottomResizeMouseDown,
    startDate,
    setStopDate,
    maxDateTime,
    stoppedAt,
    startedAt,
    onChange,
    scheduleItem,
  ]);

  // hide task of 1 minutes or less
  if (stoppedAt.getTime() - startedAt.getTime() < 60 * 1000) {
    return null;
  }

  const small = gridEnd - gridStart < 4;

  return (
    <>
      <CalendarItemEditModal
        visible={showEditForm}
        onClose={() => setShowEditForm(false)}
        onChange={props.onChange}
        scheduleItem={scheduleItem}
        onDelete={props.onDelete}
      />
      <li
        ref={liElementRef}
        className={`relative mt-px hidden ${getColStart(
          startDay
        )} select-none sm:flex`}
        style={{
          gridRow: `${gridStart + 2} / span ${gridEnd - gridStart || 1}`,
        }}
      >
        <div className="group absolute inset-x-1 inset-y-0.5 flex cursor-pointer flex-col rounded-lg bg-sky-100 px-2 text-xs leading-5 transition hover:bg-sky-200">
          {small ? (
            <div
              onClick={() => setShowEditForm(true)}
              className="flex h-full min-w-0 items-center text-sky-700 hover:text-sky-800"
              title={scheduleItem.ticket.title}
            >
              <div className="truncate">{scheduleItem.ticket.title}</div>
            </div>
          ) : (
            <>
              <div
                onMouseDown={(event) => {
                  setBoundaries();
                  setTopResizeMouseDown(true);
                  event.stopPropagation();
                }}
                ref={topResizeRef}
                className="absolute left-0 right-0 top-0 h-2 cursor-ns-resize"
              ></div>
              <div
                onMouseDown={(event) => {
                  setBoundaries();
                  setBottomResizeMouseDown(true);
                  event.stopPropagation();
                }}
                ref={bottomResizeRef}
                className={`left-0 right-0 bottom-0 h-2 cursor-ns-resize ${
                  scheduleItem.stoppedAt ? "absolute" : "hidden"
                }`}
              ></div>
              <div
                onClick={() => setShowEditForm(true)}
                className={`h-full overflow-y-auto ${
                  small ? "cursor-pointer" : ""
                }`}
              >
                <div className="space-y-1 py-2">
                  <button
                    type="button"
                    className="flex-rpw flex text-sky-700 hover:no-underline sm:flex-col lg:flex-row lg:justify-between"
                  >
                    <time dateTime={startDate.toString()}>
                      <span className="whitespace-nowrap">
                        {format(startDate, "p")}
                      </span>
                    </time>
                  </button>
                  {props.children}
                </div>
              </div>
            </>
          )}
        </div>
      </li>
    </>
  );
};

CalendarScheduleItem.fragments = {
  calendarScheduleItemFragment: gql`
    fragment calendarScheduleItemFragment on ScheduleItem {
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
      ...calendarItemEditModalFragment
    }
    ${CalendarItemEditModal.fragments.calendarItemEditModalFragment}
  `,
};

const GET_SCHEDULE_ITEM_BOUNDARIES_QUERY = gql`
  query ScheduleItemUpdateBoundaries($scheduleItemId: Int!) {
    scheduleItemUpdateBoundaries(scheduleItemId: $scheduleItemId) {
      minDate
      maxDate
    }
  }
`;
