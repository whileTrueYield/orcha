import { useRef, useState } from "react";

import { gql, useMutation, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { addDays, endOfWeek, format, startOfWeek, subDays } from "date-fns";
import {
  MutationCreateScheduleItemArgs,
  MutationDeleteScheduleItemArgs,
  MutationUpdateMyScheduleItemArgs,
  ScheduleItem,
} from "types/graphql";
import { Button } from "components/fields/Button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/solid";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { ScheduleView } from "pages/calendar/Week/ScheduleView";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { filter, max, maxBy, min, minBy } from "lodash";
import { CalendarCreateScheduleItemModal } from "pages/calendar/Week/CalendarCreateScheduleItemModal";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { DangerConfirm } from "components/modals/DangerConfirm";

export const MyCalendar: FCWithFragments = () => {
  const [fromDate, setFromDate] = useState(startOfWeek(new Date()));
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<
    number | null
  >(null);
  const [toDate, setToDate] = useState(endOfWeek(fromDate));
  const [isNewScheduleItemBoundaries, setNewScheduleItemBoundaries] = useState<
    [Date, Date] | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const forward = () => {
    const newFromDate = addDays(fromDate, 7);
    setFromDate(newFromDate);
    setToDate(endOfWeek(newFromDate));
  };

  const backward = () => {
    const newFromDate = subDays(fromDate, 7);
    setFromDate(newFromDate);
    setToDate(endOfWeek(newFromDate));
  };

  const [updateMyScheduleItem] = useMutation<
    MutationReturnValue["updateMyScheduleItem"],
    MutationUpdateMyScheduleItemArgs
  >(UPDATE_MY_SCHEDULE_ITEM_MUTATION, {
    onError: onGraphQLError({ title: "Could not update schedule" }),
    onCompleted: onMutationComplete({ title: "Schedule updated" }),
  });

  const { data, refetch } = useQuery<QueryReturnValue["myScheduleItemPeriod"]>(
    GET_MY_SCHEDULE_ITEMS_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        fromDate: fromDate,
        toDate: toDate,
      },
    }
  );

  useRefetchOnVisible([GET_MY_SCHEDULE_ITEMS_QUERY, GET_TIME_OFFS_QUERY]);

  const { data: dataRole } =
    useQuery<QueryReturnValue["myRole"]>(GET_ROLE_QUERY);

  const scheduleItems = data?.myScheduleItemPeriod || [];
  const myRole = dataRole?.myRole;

  const [createScheduleItem] = useMutation<
    MutationReturnValue["createScheduleItem"],
    MutationCreateScheduleItemArgs
  >(CREATE_SCHEDULE_ITEM);

  const [deleteScheduleItem] = useMutation<
    MutationReturnValue["deleteScheduleItem"],
    MutationDeleteScheduleItemArgs
  >(DELETE_SCHEDULE_ITEM);

  const onCreateScheduleItem = (
    startedAt: Date,
    stoppedAt: Date,
    ticketId: number,
    ticketWorkflowStateId: number
  ) => {
    createScheduleItem({
      variables: {
        input: {
          startedAt: startedAt.toISOString(),
          stoppedAt: stoppedAt.toISOString(),
          ticketId,
          ticketWorkflowStateId,
        },
      },
      onCompleted: onMutationComplete({
        title: "Work Record Created",
        callback: refetch,
      }),
      onError: onGraphQLError({ title: "Work Record Failed" }),
    });
  };

  const onDeleteScheduleItem = (scheduleItemId: number) => {
    deleteScheduleItem({
      variables: { scheduleItemId },

      onCompleted: onMutationComplete({
        title: "Work Record Deleted",
        callback: refetch,
      }),
      onError: onGraphQLError({ title: "Could not delete Record" }),
    });
  };

  const onNewCreateScheduleItem = (startAt: Date, boundaries: [Date, Date]) => {
    // Establish the start and end datetime information for the new event.
    // The event will be bound by the work our of the role but also by
    // any previous and following task around the click point
    const previousScheduleItem = maxBy(
      filter(
        scheduleItems,
        (si) => si.stoppedAt && si.stoppedAt < startAt.toISOString()
      ),
      "stoppedAt"
    ) as ScheduleItem | null;

    const followingScheduleItem = minBy(
      filter(scheduleItems, (si) => si.startedAt > startAt.toISOString()),
      "startedAt"
    ) as ScheduleItem | null;

    if (startAt > new Date()) {
      return;
    }

    const startDate = max([
      boundaries[0].toISOString(),
      previousScheduleItem?.stoppedAt,
    ]) as string;

    const stopDate = min([
      boundaries[1].toISOString(),
      followingScheduleItem?.startedAt,
      new Date().toISOString(),
    ]) as string;

    setNewScheduleItemBoundaries([new Date(startDate), new Date(stopDate)]);
  };

  const onScheduleItemChange = (
    editScheduleItem: ScheduleItem,
    startDate: Date,
    stopDate: Date | null
  ) => {
    let sameStartDate = false;
    let sameStopDate = false;

    if (startDate.toISOString() === editScheduleItem.startedAt) {
      sameStartDate = true;
    }

    if (stopDate === null && editScheduleItem.stoppedAt === null) {
      sameStopDate = true;
    }

    if (stopDate && stopDate.toISOString() === editScheduleItem.stoppedAt) {
      sameStopDate = true;
    }

    // do not do anything if no changes detected
    if (sameStopDate && sameStartDate) {
      return;
    }

    updateMyScheduleItem({
      variables: {
        scheduleItemId: editScheduleItem.id,
        input: {
          startedAt: startDate.toISOString(),
          stoppedAt: stopDate ? stopDate.toISOString() : null,
        },
      },
    });
  };

  if (!myRole) {
    return null;
  }

  return (
    <div className="flex w-full flex-col" ref={containerRef}>
      {isNewScheduleItemBoundaries && (
        <CalendarCreateScheduleItemModal
          startedAt={isNewScheduleItemBoundaries[0]}
          stoppedAt={isNewScheduleItemBoundaries[1]}
          visible={true}
          onClose={() => setNewScheduleItemBoundaries(null)}
          onCreate={onCreateScheduleItem}
          roleId={myRole.id}
        />
      )}
      <DangerConfirm
        title="Delete Work Record?"
        cta="Yes, delete record"
        visible={showConfirmDeleteModal !== null}
        onClose={() => setShowConfirmDeleteModal(null)}
        description="Confirm you want to delete that record of work. This action cannot be undone."
        onConfirm={() => onDeleteScheduleItem(showConfirmDeleteModal!)}
      />
      <div className="sticky top-0 z-10 -mx-4 my-4 flex flex-col items-center space-y-6 bg-gray-100 bg-opacity-75 px-4 py-4 backdrop-blur sm:my-0 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="z-20 flex flex-row items-center">
          <Button
            type="button"
            btnType="white"
            btnGroup="start"
            onClick={backward}
          >
            <ChevronLeftIcon className="-mx-2 h-5 w-5 text-gray-700" />
          </Button>
          <span className="inline-block h-full w-48 flex-1 border border-gray-300 bg-white py-2 text-center align-top  text-sm font-medium text-gray-700 shadow-sm">
            <span className="font-normal text-gray-600">Week of: </span>
            {format(fromDate, "PP")}
          </span>
          <Button
            onClick={forward}
            type="button"
            btnType="white"
            btnGroup="end"
          >
            <ChevronRightIcon className="-mx-2 h-5 w-5 text-gray-700" />
          </Button>
        </div>
        <div className="hidden items-center justify-center rounded-md border border-brand-200 bg-brand-100 py-1.5 pl-2 pr-3 text-base text-brand-700 lg:flex">
          <InformationCircleIcon className="mr-1 h-5 w-5 text-brand-600 opacity-75" />
          Your schedule is only visible to you
        </div>
      </div>
      <ScheduleView
        className="flex-1"
        scheduleItems={scheduleItems}
        fromDate={fromDate}
        onChange={onScheduleItemChange}
        workweek={myRole.workWeek}
        timezone={myRole.timeZone}
        onCreate={onNewCreateScheduleItem}
        onDelete={setShowConfirmDeleteModal}
      />
    </div>
  );
};

MyCalendar.fragments = {
  MyCalendarFragments: gql`
    fragment MyCalendarFragments on ScheduleItem {
      id
      createdAt
      startedAt
      stoppedAt
      ticketWorkflowState {
        id
        name
      }
    }
  `,
};

const GET_MY_SCHEDULE_ITEMS_QUERY = gql`
  query MyCalendarScheduleItems($fromDate: DateTime!, $toDate: DateTime!) {
    myScheduleItemPeriod(fromDate: $fromDate, toDate: $toDate) {
      id
      ...ScheduleViewFragments
    }
  }
  ${ScheduleView.fragments.ScheduleViewFragments}
`;

const UPDATE_MY_SCHEDULE_ITEM_MUTATION = gql`
  mutation UpdateMyCalendarScheduleItem(
    $scheduleItemId: Int!
    $input: UpdateScheduleItemInput!
  ) {
    updateMyScheduleItem(scheduleItemId: $scheduleItemId, input: $input) {
      id
      ...ScheduleViewFragments
    }
  }
  ${ScheduleView.fragments.ScheduleViewFragments}
`;

const GET_TIME_OFFS_QUERY = gql`
  query GetTimeOffs($fromDate: DateTime!, $toDate: DateTime!) {
    timeOffs(fromDate: $fromDate, toDate: $toDate) {
      id
      startAt
      stopAt
    }
  }
`;

const CREATE_SCHEDULE_ITEM = gql`
  mutation CreateScheduleItemForMyCalendar($input: CreateScheduleItemInput!) {
    createScheduleItem(input: $input) {
      id
      startedAt
      stoppedAt
    }
  }
`;

const DELETE_SCHEDULE_ITEM = gql`
  mutation DeleteScheduleItemForMyCalendar($scheduleItemId: Int!) {
    deleteScheduleItem(scheduleItemId: $scheduleItemId)
  }
`;

const GET_ROLE_QUERY = gql`
  query GetRoleForMyCalendar {
    myRole {
      id
      name
      timeZone
      avatarUrl
      workWeek {
        monday {
          startTime
          stopTime
        }
        tuesday {
          startTime
          stopTime
        }
        wednesday {
          startTime
          stopTime
        }
        thursday {
          startTime
          stopTime
        }
        friday {
          startTime
          stopTime
        }
        saturday {
          startTime
          stopTime
        }
        sunday {
          startTime
          stopTime
        }
      }
    }
  }
`;
