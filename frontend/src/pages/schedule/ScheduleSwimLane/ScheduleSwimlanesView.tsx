import { gql, useQuery } from "@apollo/client";
import { Clock } from "components/Clock";
import { Button } from "components/fields/Button";
import { addDays, format, subDays } from "date-fns";
import { usePageTitle } from "hooks/usePageTitle";
import { map } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  QueryGetEstimatesArgs,
  QueryGetScheduleRolesArgs,
} from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";
import { urlResolver } from "utils/navigation";
import {
  RoleSwimlaneAvatars,
  RoleSwmilLaneFutureWork,
  RoleSwmilLanePreviousWork,
} from "./RoleSwimlane";
import { SwimlanePeriodButton } from "./SwimlanePeriodButton";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { CompromisedScheduleWarning } from "../CompromisedScheduleWarning";
import { isAdminLevel } from "reducers/selector";
import { useSelector } from "react-redux";
import { onGraphQLError } from "utils/GQLClient";

export const ScheduleSwimlanesView: React.FC = () => {
  usePageTitle("Swimlanes");
  const { orgId } = useParams<{ orgId: string }>();
  const isAdmin = useSelector(isAdminLevel);
  const [fromDate, setFromDate] = useState(subDays(new Date(), 7));
  const [toDate, setToDate] = useState(addDays(new Date(), 7));
  const nowLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: scheduleItemData } = useQuery<
    QueryReturnValue["scheduleItemPeriod"]
  >(GET_PAST_SCHEDULE_ITEMS, {
    variables: { fromDate: fromDate },
    onError: onGraphQLError({ title: "Could not establish estimate period" }),
  });

  const { data: rolesData } = useQuery<
    QueryReturnValue["getScheduleRoles"],
    QueryGetScheduleRolesArgs
  >(GET_ALL_ROLES, {
    variables: {
      fromDate: fromDate,
      toDate: toDate,
    },
    onError: onGraphQLError({ title: "Could not retrieve roles" }),
  });

  const { data: estimateData } = useQuery<
    QueryReturnValue["getEstimates"],
    QueryGetEstimatesArgs
  >(GET_FUTURE_SCHEDULE, {
    variables: {
      toDate: toDate,
    },
    onError: onGraphQLError({ title: "Could not retrieve estimates" }),
  });

  /* eslint-disable react-hooks/exhaustive-deps
  ---
  The warning is counter intuitive here, we DO WANT to recompute location 
  when the following objects change. */

  const roles = rolesData?.getScheduleRoles || [];
  const scheduleItems = scheduleItemData?.scheduleItemPeriod || [];
  const estimates = estimateData?.getEstimates || [];

  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (containerRef.current && nowLineRef.current) {
      containerRef.current.scrollTo({
        left:
          nowLineRef.current.offsetLeft - containerRef.current.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [nowLineRef, containerRef, scheduleItems, estimates, roles]);

  const futureWidth = Math.max(...map(roles, "futureCapacity"));
  // const estimateByRole = groupBy(estimates, "roleId");
  // map(roles, (role) => {
  //   console.log(role.name, sum(map(estimateByRole[role.id], "duration")));
  // });

  return (
    <div>
      <header className="mx-auto flex max-w-7xl items-center py-4 px-6 md:flex-none lg:px-0">
        <h1 className="flex-1 text-2xl text-gray-700 sm:font-medium">
          Swimlanes
        </h1>

        <ScheduleTabs orgId={orgId} current="Swimlanes" />

        <div className="flex flex-1 items-center justify-end">
          {isAdmin && (
            <div className="hidden md:ml-4 md:flex md:items-center">
              <Button
                btnType="primary"
                asElement={(className) => (
                  <Link
                    className={className}
                    to={urlResolver.schedule.editTickets(orgId)}
                  >
                    Edit Schedule
                  </Link>
                )}
              ></Button>
            </div>
          )}
        </div>
      </header>
      <CompromisedScheduleWarning />
      <div className="mb-4 flex w-full flex-row justify-center">
        <SwimlanePeriodButton
          onLowerLimitChange={setFromDate}
          onUpperLimitChange={setToDate}
          lowerLimit={fromDate}
          upperLimit={toDate}
        />
      </div>
      <div
        ref={containerRef}
        className="relative flex max-h-[calc(100vh-210px)] flex-row overflow-auto overscroll-x-contain rounded-lg border bg-white shadow-sm"
      >
        <div className="sticky left-0 z-20 divide-y bg-white text-gray-600 shadow">
          {roles.map((role) => (
            <RoleSwimlaneAvatars
              role={role}
              key={`role-${role.id}`}
              estimates={estimates.filter(({ roleId }) => roleId === role.id)}
              scheduleItems={scheduleItems.filter(
                ({ roleId }) => roleId === role.id
              )}
            />
          ))}
        </div>
        <div className="divide-y divide-gray-300">
          {roles.map((role, index) => (
            <RoleSwmilLanePreviousWork
              isFirstRow={index === 0}
              isLastRow={index === roles.length - 1}
              role={role}
              key={role.id}
              estimates={estimates.filter(({ roleId }) => roleId === role.id)}
              scheduleItems={scheduleItems.filter(
                ({ roleId }) => roleId === role.id
              )}
            />
          ))}
        </div>
        <div
          className="sticky top-0 z-10 clear-both max-h-[calc(100vh-200px)] w-0.5 shrink-0 bg-pink-400"
          ref={nowLineRef}
        >
          <div className="absolute top-[50%] -left-[9px] -mt-10">
            <div className="origin-bottom-left rotate-90 whitespace-nowrap rounded-full bg-pink-400 py-0.5 px-2 text-xs font-bold tracking-wide text-pink-50">
              <Clock getValue={() => format(new Date(), "p")} interval={10} />
            </div>
          </div>
        </div>
        <div
          className="swim-lanes relative divide-y"
          style={{ width: futureWidth * 60 }}
        >
          {roles.map((role, index) => (
            <RoleSwmilLaneFutureWork
              role={role}
              key={role.id}
              isLastRow={index === roles.length - 1}
              isFirstRow={index === 0}
              estimates={estimates.filter(({ roleId }) => roleId === role.id)}
              scheduleItems={scheduleItems.filter(
                ({ roleId }) => roleId === role.id
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const GET_PAST_SCHEDULE_ITEMS = gql`
  query GetPastScheduleItems($fromDate: DateTime!) {
    scheduleItemPeriod(fromDate: $fromDate) {
      id
      done
      startedAt
      stoppedAt
      nextTicketWorkflowStateId
      roleId
      ticketId
      ticketWorkflowStateId
      ticketWorkflowState {
        id
        name
      }
      ticket {
        id
        title
        localId
        status
        product {
          id
          code
        }
      }
    }
  }
`;

const GET_FUTURE_SCHEDULE = gql`
  query GetEstimates($toDate: DateTime!) {
    getEstimates(toDate: $toDate) {
      roleId
      ticketId
      ticketTitle
      ticketLocalId
      ticketProductCode
      ticketWorkflowStateName
      ticketWorkflowStateId
      startEpoch
      stopEpoch
      duration
      start_min
    }
  }
`;

const GET_ALL_ROLES = gql`
  query GetAllRoles($fromDate: DateTime!, $toDate: DateTime!) {
    getScheduleRoles(fromDate: $fromDate, toDate: $toDate) {
      id
      name
      title
      avatarUrl
      pastCapacity
      futureCapacity
    }
  }
`;
