import React, { useCallback, useRef, useState } from "react";
import { useOutsideClick } from "hooks/useOutsideClick";
import { ScheduleItem } from "./ScheduleItem";
import { WeeklyCalendarItem } from "./types";
import { converTimeToEpoch, formatTime, parseTime } from "../../utils/time";
import { useClock } from "components/Clock";
import { utcToZonedTime } from "date-fns-tz";
import { differenceInMinutes, format, startOfDay } from "date-fns";

interface Props extends React.HTMLProps<HTMLDivElement> {
  height: number;
  dayOfTheWeek: string;
  timeZone: string;
  workTimes: WeeklyCalendarItem[];
  createForm?: (
    item: WeeklyCalendarItem,
    onClose: () => void
  ) => React.ReactNode;
  editForm?: (item: WeeklyCalendarItem, onClose: () => void) => React.ReactNode;
  viewItem?: (item: WeeklyCalendarItem, onClose: () => void) => React.ReactNode;
}

export const WeeklyScheduleDay: React.FC<Props> = (props) => {
  const {
    height,
    dayOfTheWeek,
    createForm,
    editForm,
    viewItem,
    workTimes,
    timeZone,
    ...divProps
  } = props;

  const [showCreateModal, setShowCreateModal] =
    useState<CreateModalProps | null>(null);
  const [showEditModal, setShowEditModal] = useState<EditModalProps | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState<ViewModalProps | null>(
    null
  );

  const computeTopValue = useCallback(() => {
    const zonedTime = utcToZonedTime(new Date(), timeZone);
    const midnight = startOfDay(zonedTime);
    const localDayOfTheWeek = format(zonedTime, "EEEE").toLowerCase();

    // only display the topValue if this section represents today's date
    if (dayOfTheWeek !== localDayOfTheWeek) {
      return "";
    }

    const minutesSinceMidnight = differenceInMinutes(zonedTime, midnight);
    const top = (height / (60 * 24)) * minutesSinceMidnight;
    return `${Math.round(top)}px`;
  }, [timeZone, height, dayOfTheWeek]);

  const [topValue] = useClock(computeTopValue);

  const createWrapperRef = useRef(null);
  const editWrapperRef = useRef(null);
  const viewWrapperRef = useRef(null);
  useOutsideClick(createWrapperRef, () => setShowCreateModal(null));
  useOutsideClick(editWrapperRef, () => setShowEditModal(null));
  useOutsideClick(viewWrapperRef, () => setShowViewModal(null));

  const secondHeight = height / (24 * 3600);

  const onDayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (createForm) {
      const bounds = event.currentTarget.getBoundingClientRect();

      const x =
        bounds.left > 350
          ? event.clientX - bounds.left - 260
          : event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      // divide the possible positions in 15mins
      const top = Math.floor((y / height) * 96);

      setShowCreateModal({
        x,
        y: (top / 96) * height,
        secondHeight,
        dayOfTheWeek,
        createForm,
        onClose: () => setShowCreateModal(null),
      });
    }
  };

  const renderWorkTime = (item: WeeklyCalendarItem, index: number) => {
    if (editForm) {
      return (
        <ScheduleItem
          key={index}
          item={item}
          secondHeight={secondHeight}
          className="bg-brand-300 hover:bg-brand-400"
          onClick={(item, event) =>
            setShowEditModal({
              align:
                event.pageX > window.window.innerWidth / 2 ? "right" : "left",
              item,
              editForm,
              onClose: () => setShowEditModal(null),
              secondHeight,
            })
          }
        />
      );
    } else if (viewItem) {
      return (
        <ScheduleItem
          key={index}
          item={item}
          className="bg-brand-300 hover:bg-brand-400"
          secondHeight={secondHeight}
          onClick={(item, event) => {
            setShowViewModal({
              align:
                event.pageX > window.window.innerWidth / 2 ? "right" : "left",
              item,
              viewItem,
              onClose: () => setShowViewModal(null),
              secondHeight,
            });
          }}
        />
      );
    } else {
      return (
        <ScheduleItem
          className="bg-brand-300"
          key={index}
          item={item}
          secondHeight={secondHeight}
        />
      );
    }
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

  return (
    <div {...divProps}>
      <div
        className="timeline-container relative"
        style={{ height }}
        onClick={onDayClick}
      >
        {workTimes.map(renderWorkTime)}
        {renderCurrentTimeline()}

        <div ref={createWrapperRef}>
          {showCreateModal ? <CreateModal {...showCreateModal} /> : null}
        </div>
        <div ref={editWrapperRef}>
          {showEditModal ? <EditModal {...showEditModal} /> : null}
        </div>
        <div ref={viewWrapperRef}>
          {showViewModal ? <ViewModal {...showViewModal} /> : null}
        </div>
      </div>
    </div>
  );
};

interface CreateModalProps extends React.HTMLProps<HTMLDivElement> {
  x: number;
  y: number;
  secondHeight: number;
  dayOfTheWeek: string;
  onClose: () => void;
  createForm: (
    item: WeeklyCalendarItem,
    onClose: () => void
  ) => React.ReactNode;
}

const CreateModal: React.FC<CreateModalProps> = (props: CreateModalProps) => {
  const { x, y, secondHeight, dayOfTheWeek, createForm, onClose } = props;
  const periodLength = 4;

  // convert y (pixels) in a time string (8:23)
  const floatHours = y / secondHeight / 3600;
  const floatMinutes = (floatHours - Math.floor(floatHours)) * 60;

  const hours = Math.floor(floatHours);
  const minutes = Math.floor(floatMinutes);

  const startTime = formatTime(hours, minutes);
  const stopTime =
    hours < 24 - periodLength
      ? formatTime(hours + periodLength, minutes)
      : "23:59";

  const item: WeeklyCalendarItem = {
    startTime,
    stopTime,
    startEpoch: converTimeToEpoch(startTime),
    stopEpoch: converTimeToEpoch(stopTime),
    dayOfTheWeek,
  };

  return (
    <>
      <ScheduleItem
        className="bg-green-400 opacity-50"
        item={item}
        secondHeight={secondHeight}
      />
      <div
        className="absolute z-20"
        onClick={(e) => e.stopPropagation()}
        style={{ top: y + 20, left: x - 5 }}
      >
        {createForm(item, onClose)}
      </div>
    </>
  );
};

interface ViewModalProps extends React.HTMLProps<HTMLDivElement> {
  align: "left" | "right";
  item: WeeklyCalendarItem;
  secondHeight: number;
  onClose: () => void;
  viewItem: (item: WeeklyCalendarItem, onClose: () => void) => React.ReactNode;
}

const ViewModal: React.FC<ViewModalProps> = (props) => {
  const { viewItem, onClose, item, secondHeight, align } = props;

  const [hours, minutes] = parseTime(item.startTime);
  const y = hours * 3600 * secondHeight + minutes * 60 * secondHeight;

  return (
    <div
      className="absolute z-20"
      onClick={(e) => e.stopPropagation()}
      style={{ top: y + 20, left: align === "left" ? 50 : -130 }}
    >
      {viewItem(item, onClose)}
    </div>
  );
};

interface EditModalProps extends React.HTMLProps<HTMLDivElement> {
  align: "left" | "right";
  item: WeeklyCalendarItem;
  secondHeight: number;
  onClose: () => void;
  editForm: (item: WeeklyCalendarItem, onClose: () => void) => React.ReactNode;
}

const EditModal: React.FC<EditModalProps> = (props) => {
  const { editForm, onClose, item, secondHeight, align } = props;

  const [hours, minutes] = parseTime(item.startTime);
  const y = hours * 3600 * secondHeight + minutes * 60 * secondHeight;

  return (
    <div
      className="absolute z-20"
      onClick={(e) => e.stopPropagation()}
      style={{ top: y + 20, left: align === "left" ? 20 : -200 }}
    >
      {editForm(item, onClose)}
    </div>
  );
};
