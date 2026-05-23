import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { Panel, PanelBody } from "components/views/Panel";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { WeekCalendar } from "components/WeekCalendar";
import {
  MutationDeleteRecurringBlackoutTimeArgs,
  RecurringBlackoutTime,
} from "types/graphql";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { recurringBlackoutTimeToCalendarEvents } from "./utils";
import { filter, flatten } from "lodash";
import { RecurringBlackoutTimeEditModal } from "./RecurringBlackoutTimeEditModal";
import { CalendarTimePeriod } from "components/WeekCalendar/WeekCalendarDay";
import { transformToDate } from "utils/time";
import { RecurringBlackoutTimeCreateModal } from "./RecurringBlackoutTimeCreateModal";
import { Tab, Tabs } from "components/fields/Tab";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { converTimeToEpoch } from "utils/time";
import { plural } from "utils/string";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { DangerConfirm } from "components/modals/DangerConfirm";

export const BlackoutTimeCalendar: React.FC = (props) => {
  usePageTitle("Blackout Events");
  const me = useSelector(getMe);
  const { orgId } = useParams<{ orgId: string }>();
  const [currentDay] = useState(new Date());
  const [deleteBlackoutTime, setDeleteBlackoutTime] =
    useState<RecurringBlackoutTime | null>(null);
  const [recurringBlackoutTimes, setRecurringBlackoutTimes] = useState<
    RecurringBlackoutTime[]
  >([]);
  const [updateCreateBlackoutTimeModal, setUpdateCreateBlackoutTimeModal] =
    useState<null | RecurringBlackoutTime>(null);

  const [createBlackoutTimeAt, setCreateBlackoutTimeAt] =
    useState<CalendarTimePeriod | null>(null);

  const fromDate = startOfWeek(currentDay);
  const toDate = endOfWeek(currentDay);

  const { refetch } = useQuery<QueryReturnValue["recurringBlackoutTimes"]>(
    GET_ALL_RECURRING_BLACKOUT_TIMES,
    {
      variables: { fromDate, toDate },
      onCompleted: ({ recurringBlackoutTimes }) =>
        setRecurringBlackoutTimes(recurringBlackoutTimes),
    }
  );

  const [deleteRecurringBlackoutTime] = useBlockingMutation<
    MutationReturnValue["deleteRecurringBlackoutTime"],
    MutationDeleteRecurringBlackoutTimeArgs
  >(DELETE_RECURRING_BLACKOUT_TIME_MUTATION, {
    onError: onGraphQLError({
      title: "Blackout Time deletion failed",
    }),
    onCompleted: onMutationComplete({
      title: "Blackout Time deleted",
      callback: () => setDeleteBlackoutTime(null),
    }),
    update(cache, { data }) {
      if (!data) {
        return;
      }

      cache.evict({
        id: `RecurringBlackoutTime:${data.deleteRecurringBlackoutTime}`,
      });
    },
  });

  if (!me?.role) {
    return null;
  }

  const events = flatten(
    recurringBlackoutTimes.map((bot) =>
      recurringBlackoutTimeToCalendarEvents(
        bot,
        fromDate,
        toDate,
        "bg-gray-700 text-xs font-medium p-1 text-gray-100 rounded-md hover:bg-gray-900"
      )
    )
  );

  const seconds = recurringBlackoutTimes.reduce((acc, rbt) => {
    const delta =
      converTimeToEpoch(rbt.stopTime) - converTimeToEpoch(rbt.startTime);
    const days = filter([
      rbt.monday,
      rbt.tuesday,
      rbt.wednesday,
      rbt.thursday,
      rbt.friday,
      rbt.saturday,
      rbt.sunday,
    ]).length;
    return acc + delta * rbt.roles.length * days;
  }, 0);

  const getDefaultTimes = () => {
    if (createBlackoutTimeAt) {
      const { start, stop } = createBlackoutTimeAt;
      return {
        startTime: format(transformToDate(start.hours, start.minutes), "p"),
        stopTime: format(transformToDate(stop.hours, stop.minutes), "p"),
      };
    }

    return {
      startTime: 0,
      stopTime: 0,
    };
  };

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start">
      <Tabs className="mb-4">
        <Tab active>Recurring Events</Tab>
        <Tab
          asElement={(className) => (
            <Link
              className={className}
              to={urlResolver.blackoutTime.scheduledListing(orgId)}
            >
              Scheduled Time Off
            </Link>
          )}
        />
      </Tabs>
      {createBlackoutTimeAt && (
        <RecurringBlackoutTimeCreateModal
          visible={true}
          onClose={() => setCreateBlackoutTimeAt(null)}
          defaultValues={getDefaultTimes()}
          defaultDay={createBlackoutTimeAt.day}
          onCreate={refetch}
        />
      )}
      <DangerConfirm
        visible={!!deleteBlackoutTime}
        onClose={() => setDeleteBlackoutTime(null)}
        cta="Delete Event"
        title="Delete Recurring Event?"
        description="Are you sure you want to delete this recurring event? This cannot be undone."
        onConfirm={() =>
          deleteBlackoutTime &&
          deleteRecurringBlackoutTime({
            variables: {
              recurringBlackoutTimeId: deleteBlackoutTime.id,
            },
          })
        }
      />
      {updateCreateBlackoutTimeModal && (
        <RecurringBlackoutTimeEditModal
          visible={true}
          recurringBlackoutTime={updateCreateBlackoutTimeModal}
          onClose={() => setUpdateCreateBlackoutTimeModal(null)}
          onDelete={setDeleteBlackoutTime}
        />
      )}

      <Panel>
        <PanelBody>
          <div className="flex flex-row items-end justify-start gap-2">
            <h3 className="text-lg font-medium leading-6 text-gray-900 md:justify-start">
              Recurring Blackout
            </h3>
            <div className="text-base text-gray-500">
              {seconds > 0
                ? `about ${plural(
                    "{} hr",
                    "{} hrs",
                    Math.floor(seconds / 3600)
                  )} / week`
                : "No time off scheduled"}
            </div>
          </div>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            During these events, the people participating will not have any work
            scheduled by Autopilot.
          </p>

          <div className="mt-6">
            <WeekCalendar
              height={1200}
              timeZone={me.role.timeZone}
              events={events}
              currentDay={new Date()}
              onVoidClick={setCreateBlackoutTimeAt}
              onEventClick={(event) => {
                const record = recurringBlackoutTimes.find(
                  (rbt) => rbt.id === event.id
                );
                if (record) {
                  setUpdateCreateBlackoutTimeModal(record);
                }
              }}
            />
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
};

const GET_ALL_RECURRING_BLACKOUT_TIMES = gql`
  query GetAllRecurringBlackoutTimes {
    recurringBlackoutTimes {
      id
      ...RecurringBlackoutTimeEditModalFragment
    }
  }
  ${RecurringBlackoutTimeEditModal.fragments
    .RecurringBlackoutTimeEditModalFragment}
`;

const DELETE_RECURRING_BLACKOUT_TIME_MUTATION = gql`
  mutation DeleteRecurringBlackoutTime($recurringBlackoutTimeId: Int!) {
    deleteRecurringBlackoutTime(
      recurringBlackoutTimeId: $recurringBlackoutTimeId
    )
  }
`;
