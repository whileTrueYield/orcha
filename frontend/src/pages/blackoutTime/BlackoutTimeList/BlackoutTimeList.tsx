import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { Tab, Tabs } from "components/fields/Tab";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { BlackoutTimeCreateModal } from "./BlackoutTimeCreateModal";
import {
  BlackoutTime,
  MutationDeleteBlackoutTimeArgs,
  Role,
} from "types/graphql";
import { differenceInDays, endOfDay, format, startOfDay } from "date-fns";
import { Panel } from "components/views/Panel";
import { Avatar } from "components/views/Avatar";
import { plural } from "utils/string";
import { BlackoutTimeEditModal } from "./BlackoutTimeEditModal";
import { flatten, uniqBy } from "lodash";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";

export const BlackoutTimeList: React.FC = (props) => {
  usePageTitle("Scheduled Time Off");
  const me = useSelector(getMe);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [offToday, setOffToday] = useState<
    Array<{
      role: Role;
      blackoutTime: BlackoutTime;
    }>
  >([]);
  const [deleteBlackoutTimeRecord, setDeleteBlackoutTimeRecord] =
    useState<BlackoutTime | null>(null);
  const [upcomingEvents, setUpcomingDaysEvents] = useState<BlackoutTime[]>([]);
  const [updateCreateBlackoutTimeModal, setUpdateCreateBlackoutTimeModal] =
    useState<BlackoutTime | null>(null);

  const { orgId } = useParams<{ orgId: string }>();

  const { refetch } = useQuery<QueryReturnValue["blackoutTimes"]>(
    GET_BLACKOUT_TIMES,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: ({ blackoutTimes }) => {
        const now = new Date();
        const todayMorning = startOfDay(now).toISOString();
        const todayEvening = endOfDay(now).toISOString();

        setOffToday(
          uniqBy(
            flatten(
              blackoutTimes.map((bt) => {
                if (bt.startAt < todayEvening && bt.stopAt > todayMorning) {
                  return bt.roles.map((role) => ({ role, blackoutTime: bt }));
                } else {
                  return [];
                }
              })
            ),
            (bt) => bt.role.id
          )
        );

        setUpcomingDaysEvents(
          blackoutTimes.filter((bt) => bt.stopAt > todayEvening)
        );
      },
    }
  );

  const [deleteBlackoutTime] = useBlockingMutation<
    MutationReturnValue["deleteBlackoutTime"],
    MutationDeleteBlackoutTimeArgs
  >(DELETE_BLACKOUT_TIME_MUTATION, {
    onError: onGraphQLError({
      title: "Time Off deletion failed",
    }),
    onCompleted: onMutationComplete({
      title: "Time Off deleted",
      callback: () => setDeleteBlackoutTimeRecord(null),
    }),
    update(cache, { data }) {
      if (!data) {
        return;
      }

      cache.evict({
        id: `BlackoutTime:${data.deleteBlackoutTime}`,
      });
    },
  });

  if (!me?.role) {
    return null;
  }

  const renderSingleRoleEvent = (blackoutTime: BlackoutTime, role: Role) => (
    <li
      key={blackoutTime.id}
      onClick={() => setUpdateCreateBlackoutTimeModal(blackoutTime)}
      role="button"
      className="flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50"
    >
      <div className="flex gap-x-4">
        <Avatar
          className="h-12 w-12 rounded-full"
          name={role.name}
          src={role.avatarUrl}
        />
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-gray-900">
            {role.name}
          </p>
          <p className="mt-1 truncate text-sm leading-5 text-gray-500">
            {blackoutTime.name}
          </p>
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-col sm:items-end">
        <p className="text-sm leading-6 text-gray-900">
          {plural(
            "{} day",
            "{} days",
            differenceInDays(
              new Date(blackoutTime.stopAt),
              new Date(blackoutTime.startAt)
            ) + 1
          )}
        </p>
        <p className="mt-1 text-sm leading-5 text-gray-500">
          <time dateTime={blackoutTime.startAt}>
            {format(new Date(blackoutTime.startAt), "EEE, LLL do")}
          </time>{" "}
          -{" "}
          <time dateTime={blackoutTime.stopAt}>
            {format(new Date(blackoutTime.stopAt), "EEE, LLL do, yyyy")}
          </time>
        </p>
      </div>
    </li>
  );

  const renderMultiRoleEvent = (blackoutTime: BlackoutTime) => (
    <li
      key={blackoutTime.id}
      onClick={() => setUpdateCreateBlackoutTimeModal(blackoutTime)}
      role="button"
      className="flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50"
    >
      <div className="flex gap-x-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-500">
          {blackoutTime.roles.length}
        </div>
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-gray-900">
            {plural("{} person", "{} persons", blackoutTime.roles)}
          </p>
          <p className="mt-1 truncate text-sm leading-5 text-gray-500">
            {blackoutTime.name}
          </p>
        </div>
      </div>
      <div className="hidden sm:flex sm:flex-col sm:items-end">
        <p className="text-sm leading-6 text-gray-900">
          {plural(
            "{} day",
            "{} days",
            differenceInDays(
              new Date(blackoutTime.stopAt),
              new Date(blackoutTime.startAt)
            ) + 1
          )}
        </p>
        <p className="mt-1 text-sm leading-5 text-gray-500">
          <time dateTime={blackoutTime.startAt}>
            {format(new Date(blackoutTime.startAt), "P")}
          </time>{" "}
          -{" "}
          <time dateTime={blackoutTime.stopAt}>
            {format(new Date(blackoutTime.stopAt), "P")}
          </time>
        </p>
      </div>
    </li>
  );

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start">
      <BlackoutTimeCreateModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={refetch}
      />
      {updateCreateBlackoutTimeModal && (
        <BlackoutTimeEditModal
          visible={true}
          blackoutTime={updateCreateBlackoutTimeModal}
          onClose={() => setUpdateCreateBlackoutTimeModal(null)}
          onDelete={(blackoutTime) => setDeleteBlackoutTimeRecord(blackoutTime)}
        />
      )}

      <DangerConfirm
        visible={!!deleteBlackoutTimeRecord}
        onClose={() => setDeleteBlackoutTimeRecord(null)}
        cta="Delete Time Off"
        title="Delete Time Off?"
        description="Are you sure you want to delete this time off record? This action cannot be undone."
        onConfirm={() =>
          deleteBlackoutTimeRecord &&
          deleteBlackoutTime({
            variables: {
              blackoutTimeId: deleteBlackoutTimeRecord.id,
            },
          })
        }
      />

      <Tabs className="mb-4">
        <Tab
          asElement={(className) => (
            <Link
              className={className}
              to={urlResolver.blackoutTime.calendar(orgId)}
            >
              Recurring Events
            </Link>
          )}
        />
        <Tab active>Scheduled Time Off</Tab>
      </Tabs>

      <div className="flex flex-col items-start justify-between gap-4 px-2 sm:flex-row sm:px-0">
        <div>
          <h3 className="hidden text-lg font-medium leading-6 text-gray-900 sm:block">
            Scheduled Time Off
          </h3>
          <p className="mt-2 text-sm leading-5 text-gray-500">
            Autopilot will refrain from scheduling any work on these days. You
            can use scheduled time off to report instances of sick leave, PTO,
            and company outings.
          </p>
        </div>
        <Button
          btnType="white"
          type="button"
          fullInMobile
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="-ml-0.5 mr-1 h-4 w-4" />
          New Time Off
        </Button>
      </div>

      <div className="mt-6 px-2 sm:px-0">
        <div className="flex flex-row items-start justify-between">
          <h2 className="mb-2 text-base font-medium leading-6 text-gray-600">
            Off Today
          </h2>
          <div className="text-sm text-gray-600">
            {plural("{} person", "{} persons", offToday)}
          </div>
        </div>

        {offToday.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offToday.map((bt) => (
              <div
                role="button"
                key={bt.role.id}
                onClick={() =>
                  setUpdateCreateBlackoutTimeModal(bt.blackoutTime)
                }
                className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
              >
                <div className="flex-shrink-0">
                  <Avatar
                    className="h-10 w-10 rounded-full"
                    src={bt.role.avatarUrl}
                    name={bt.role.name}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    {bt.role.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {bt.role.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-gray-500">
            Everyone is available to work today.
          </div>
        )}

        <h2 className="mb-1 mt-8 text-base font-medium leading-6 text-gray-600">
          Upcoming
        </h2>
        {upcomingEvents.length ? (
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {upcomingEvents.map((blackoutTime) =>
                blackoutTime.roles.length === 1
                  ? renderSingleRoleEvent(blackoutTime, blackoutTime.roles[0])
                  : renderMultiRoleEvent(blackoutTime)
              )}
            </ul>
          </Panel>
        ) : (
          <div className="py-6 text-center text-sm text-gray-500">
            No upcoming time off scheduled.
          </div>
        )}
      </div>
    </div>
  );
};

const GET_BLACKOUT_TIMES = gql`
  query GetBlackoutTimes {
    blackoutTimes {
      id
      name
      startAt
      stopAt
      roles {
        id
        name
        title
        avatarUrl
      }
      ...BlackoutTimeEditModalFragment
    }
  }
  ${BlackoutTimeEditModal.fragments.BlackoutTimeEditModalFragment}
`;

const DELETE_BLACKOUT_TIME_MUTATION = gql`
  mutation DeleteBlackoutTime($blackoutTimeId: Int!) {
    deleteBlackoutTime(blackoutTimeId: $blackoutTimeId)
  }
`;
