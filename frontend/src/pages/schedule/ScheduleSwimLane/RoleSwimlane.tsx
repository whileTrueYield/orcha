import { Avatar } from "components/views/Avatar";
import { differenceInMinutes } from "date-fns";
import {
  ScheduleRole,
  ScheduleEstimate,
  ScheduleItem,
  TicketStatus,
} from "types/graphql";
import cn from "classnames";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { showTicketEditModal } from "actions";
import { useAppDispatch } from "store";
import { findIndex, map, range, reduce, sortBy, sumBy } from "lodash";
import "./Swimlane.css";
import { minuteToHours, TaskToolTip } from "./TaskToolTip";
import { SwimlaneScheduleItem } from "./types";

interface Props {
  role: ScheduleRole;
  scheduleItems: ScheduleItem[];
  estimates: ScheduleEstimate[];
  isFirstRow?: boolean;
  isLastRow?: boolean;
}

export const RoleSwimlaneAvatars: React.FC<Props> = (props) => {
  const { role, estimates } = props;

  const ratio = sumBy(estimates, "duration") / 3600 / role.futureCapacity;

  const progressClassName = cn("absolute left-0 inset-y-0", {
    "bg-red-300": ratio < 0.2,
    "bg-yellow-300": ratio >= 0.2 && ratio < 0.5,
    "bg-sky-300": ratio >= 0.5 && ratio < 0.8,
    "bg-green-300": ratio >= 0.8,
  });

  return (
    <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center space-y-px border-r bg-white">
      <Avatar
        className="relative block h-14 w-14 rounded-md"
        name={role.name}
        src={role.avatarUrl}
      />
      <div
        title={role.name}
        className="truncate text-center text-xs font-medium"
      >
        {role.name}
      </div>
      <div className="w-full px-2">
        <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 shadow-inner">
          <div
            className={progressClassName}
            style={{ width: `${ratio * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const RoleSwmilLanePreviousWork: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const { scheduleItems, role, isFirstRow, isLastRow } = props;

  const consolidatedScheduleItems = reduce(
    scheduleItems,
    (acc: SwimlaneScheduleItem[], scheduleItem) => {
      const index = findIndex(acc, {
        ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
      });

      const stoppedAt = scheduleItem.stoppedAt
        ? new Date(scheduleItem.stoppedAt)
        : new Date();
      const startedAt = new Date(scheduleItem.startedAt);

      const duration = differenceInMinutes(stoppedAt, startedAt);

      if (index > -1) {
        acc[index].duration += duration;

        // if the work is ongoing, keep it ongoing
        if (!scheduleItem.stoppedAt) {
          acc[index].stoppedAt = null;
        }
      } else {
        acc.push({
          duration,
          ticketId: scheduleItem.ticket.id,
          ticketTitle: scheduleItem.ticket.title,
          ticketLocalId: scheduleItem.ticket.localId,
          ticketProductCode: scheduleItem.ticket.product?.code,
          ticketWorkflowStateName: scheduleItem.ticketWorkflowState.name,
          ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
          ticketStatus: scheduleItem.ticket.status,
          stoppedAt: scheduleItem.stoppedAt,
        });
      }

      return acc;
    },
    [],
  );

  const renderPastScheduleItems = () => {
    return sortBy(consolidatedScheduleItems, "stoppedAt").map(
      (scheduleItem) => {
        const isCancelled =
          scheduleItem.ticketStatus === TicketStatus.Cancelled;
        const isDone = scheduleItem.ticketStatus === TicketStatus.Done;
        const isScheduled =
          scheduleItem.ticketStatus === TicketStatus.Scheduled;
        const className = cn("rounded border py-2 overflow-hidden", {
          "cancelled-ticket border-gray-200 text-gray-700 hover:border-gray-300":
            isCancelled,
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300":
            isDone,
          "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300":
            scheduleItem.stoppedAt && isScheduled,
          "border-sky-700 bg-sky-600 text-white hover:bg-sky-500 hover:border-sky-600":
            !scheduleItem.stoppedAt && isScheduled,
          "px-2": scheduleItem.duration >= 64,
          "pl-1": scheduleItem.duration < 64 && scheduleItem.duration > 18, // 2 x 1px border + 2 x 8px padding
        });

        // we cannot render anything less than 6px (6 mins) width
        if (scheduleItem.duration < 6) {
          return null;
        }

        return (
          <TaskToolTip
            ticketTitle={scheduleItem.ticketTitle}
            ticketProductCode={scheduleItem.ticketProductCode}
            ticketWorkflowStateName={scheduleItem.ticketWorkflowStateName}
            ticketStatus={scheduleItem.ticketStatus}
            ticketLocalId={scheduleItem.ticketLocalId}
            role="button"
            note={`Duration ${minuteToHours(scheduleItem.duration)}`}
            key={scheduleItem.ticketWorkflowStateId}
            className={className}
            style={{ width: `${scheduleItem.duration - 4}px` }}
            onClick={() => dispatch(showTicketEditModal(scheduleItem.ticketId))}
          >
            <div className="transform truncate text-sm">
              <TicketIdTag
                productCode={scheduleItem.ticketProductCode}
                localId={scheduleItem.ticketLocalId}
                className="text-xs"
              />
              <span className="ml-1 font-medium">
                {scheduleItem.ticketTitle}
              </span>
            </div>
            <div className="transform truncate text-sm font-normal">
              {scheduleItem.ticketWorkflowStateName}
            </div>
          </TaskToolTip>
        );
      },
    );
  };

  const timeScale = role.pastCapacity >= 40 ? 4 : 2;
  const tickClassName = cn(
    "absolute z-10 w-8 rounded bg-gray-50 px-1 text-center text-xs text-gray-400 opacity-0 transition group-hover:opacity-100",
    {
      "-top-2": !isFirstRow,
      "-bottom-2": isFirstRow,
    },
  );

  const renderTime = map(range(role.futureCapacity / timeScale), (tick) => (
    <div
      className={tickClassName}
      style={{ right: (tick + 1) * (60 * timeScale) - 16 }}
      key={`${tick + 1}-hour`}
    >
      {(tick + 1) * timeScale}h
    </div>
  ));

  const percentClassName = cn(
    "absolute -left-4 w-10 rounded-full bg-gray-50 px-2 text-xs font-semibold ",
    {
      "-top-4": isLastRow,
      "-bottom-2": !isLastRow,
    },
  );

  return (
    <div className="h-24 bg-gray-50 px-4">
      <div
        className="swim-lane dark group relative h-full py-2"
        style={{ minWidth: role.pastCapacity * 60 }}
      >
        {renderTime}
        <div
          className="absolute top-2 bottom-0 z-10 w-0.5 bg-green-300 pt-0.5 text-green-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            right: role.pastCapacity * 60 * 0.8 - 1,
          }}
        >
          <div className={percentClassName}>80%</div>
        </div>
        <div
          className="absolute top-2 bottom-0 z-10 w-0.5 bg-sky-300 pt-0.5 text-sky-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            right: role.pastCapacity * 60 * 0.5 - 1,
          }}
        >
          <div className={percentClassName}>50%</div>
        </div>
        <div
          className="absolute top-2 bottom-0 z-10 w-0.5 bg-yellow-300 pt-0.5 text-yellow-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            right: role.pastCapacity * 60 * 0.2 - 1,
          }}
        >
          <div className={percentClassName}>20%</div>
        </div>
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-gray-300 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            right: role.pastCapacity * 60,
          }}
        >
          <div className="absolute top-[50%] -left-[7px] -mt-11 origin-bottom-left rotate-90 bg-gray-50 px-1 text-xs text-gray-400">
            capacity
          </div>
        </div>
        <div className="flex h-full flex-row justify-end space-x-1">
          {renderPastScheduleItems()}
        </div>
      </div>
    </div>
  );
};

export const RoleSwmilLaneFutureWork: React.FC<Props> = (props) => {
  const { estimates, role, isFirstRow, isLastRow } = props;
  const dispatch = useAppDispatch();

  let consumedTime = 0;
  // duration is in minute (1 minute === 1 px)
  const capacity = role.futureCapacity * 60;

  const renderEstimates = () => {
    return estimates.map((estimate) => {
      // convert duration from seconds to minutes
      const duration = estimate.duration / 60;
      const size = Math.min(capacity - consumedTime, duration);

      // we cannot render anything less than 6px (6 mins) width
      if (size < 6) {
        return null;
      }

      consumedTime = consumedTime + size;

      // We do not use any X-padding if the width of the
      const className = cn(
        "space-y-1 overflow-hidden rounded border border-gray-300 bg-gray-50 py-2 hover:border-gray-300 hover:bg-gray-100",
        {
          "px-2": size >= 64,
          "pl-1": size > 18 && size < 64, // 2 x 1px border + 2 x 8px padding
        },
      );

      return (
        <TaskToolTip
          ticketTitle={estimate.ticketTitle}
          ticketProductCode={estimate.ticketProductCode}
          ticketWorkflowStateName={estimate.ticketWorkflowStateName}
          ticketLocalId={estimate.ticketLocalId}
          ticketStatus={TicketStatus.Scheduled}
          key={`${estimate.ticketWorkflowStateId}-${estimate.startEpoch}-${estimate.roleId}`}
          className={className}
          style={{ width: `${size - 4}px` }}
          role="button"
          onClick={() => dispatch(showTicketEditModal(estimate.ticketId))}
          note={`Most likely duration ${minuteToHours(duration)}`}
        >
          <div className="transform truncate text-sm text-gray-700">
            <TicketIdTag
              productCode={estimate.ticketProductCode}
              localId={estimate.ticketLocalId}
              className="text-xs"
            />
            <span className="ml-1 font-medium">{estimate.ticketTitle}</span>
          </div>
          <div className="transform truncate text-sm font-normal text-gray-600">
            {estimate.ticketWorkflowStateName}
          </div>
        </TaskToolTip>
      );
    });
  };

  const timeScale = role.futureCapacity >= 40 ? 4 : 2;
  const tickClassName = cn(
    "absolute z-10 w-8 rounded bg-white px-1 text-center text-xs text-gray-400 opacity-0 transition group-hover:opacity-100",
    {
      "-top-2": !isFirstRow,
      "-bottom-2": isFirstRow,
    },
  );

  const renderTime = map(range(role.futureCapacity / timeScale), (tick) => (
    <div
      className={tickClassName}
      style={{ left: (tick + 1) * (60 * timeScale) - 16 }}
      key={`${tick + 1}-hour`}
    >
      {(tick + 1) * timeScale}h
    </div>
  ));

  const percentClassName = cn(
    "absolute -left-4 w-10 rounded-full bg-white px-2 text-xs font-semibold ",
    {
      "-top-4": isLastRow,
      "-bottom-2": !isLastRow,
    },
  );

  return (
    <div className="h-24 px-4">
      <div
        className="swim-lane group relative h-full py-2"
        style={{ minWidth: role.futureCapacity * 60 }}
      >
        {renderTime}
        <div
          className="absolute top-2 bottom-0 z-10 w-0.5 bg-green-300 pt-0.5 text-green-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            left: role.futureCapacity * 60 * 0.8 - 1,
          }}
        >
          <div className={percentClassName}>80%</div>
        </div>
        <div
          className="absolute top-2 bottom-0 z-10 w-0.5 bg-sky-300 pt-0.5 text-sky-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            left: role.futureCapacity * 60 * 0.5 - 1,
          }}
        >
          <div className={percentClassName}>50%</div>
        </div>
        <div
          className="absolute top-2 bottom-0 z-10 w-0.5 bg-yellow-300 pt-0.5 text-yellow-400 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            left: role.futureCapacity * 60 * 0.2 - 1,
          }}
        >
          <div className={percentClassName}>20%</div>
        </div>
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-gray-300 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            left: role.futureCapacity * 60,
          }}
        >
          <div className="absolute top-[50%] -left-[4px] -mt-11 origin-bottom-left rotate-90 bg-white px-1 text-xs text-gray-400">
            capacity
          </div>
        </div>
        <div className="flex h-full flex-row justify-start space-x-1">
          {renderEstimates()}
        </div>
      </div>
    </div>
  );
};
