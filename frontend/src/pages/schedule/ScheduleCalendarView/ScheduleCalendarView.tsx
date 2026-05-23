import { gql, useQuery } from "@apollo/client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import { showTicketEditModal } from "actions";
import { Button } from "components/fields/Button";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfWeek,
  subMonths,
  startOfMonth,
} from "date-fns";
import { filter } from "lodash";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch } from "store";
import {
  PlanningTicket,
  QueryPlanningDeliveredTicketsArgs,
} from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";
import { urlResolver } from "utils/navigation";
import { EstimatedAt } from "./EstimatedAt";
import { ScheduleCalendarMonth } from "./ScheduleCalendarMonth";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { CompromisedScheduleWarning } from "../CompromisedScheduleWarning";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";

export const ScheduleCalendarView: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const isAdmin = useSelector(isAdminLevel);
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tickets, setTickets] = useState<PlanningTicket[]>([]);
  const [periodTickets, setPeriodTickets] = useState<PlanningTicket[]>([]);
  const [deliveredTickets, setDeliveredTickets] = useState<PlanningTicket[]>(
    [],
  );

  useQuery<QueryReturnValue["planningTickets"]>(GET_SCHEDULE_TICKETS, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ planningTickets }) => {
      setTickets(planningTickets);
    },
  });

  useQuery<
    QueryReturnValue["planningDeliveredTickets"],
    QueryPlanningDeliveredTicketsArgs
  >(GET_DELIVERED_TICKETS, {
    fetchPolicy: "cache-and-network",
    variables: {
      fromDate: startOfWeek(startOfMonth(currentDate)).toISOString(),
      toDate: endOfWeek(endOfMonth(currentDate)).toISOString(),
    },
    skip: startOfWeek(startOfMonth(currentDate)) > new Date(),
    onCompleted: ({ planningDeliveredTickets }) =>
      setDeliveredTickets(planningDeliveredTickets),
  });

  useEffect(() => {
    const lowerIsoDate = startOfWeek(startOfMonth(currentDate)).toISOString();
    const uperIsoDate = endOfWeek(endOfMonth(currentDate)).toISOString();

    setPeriodTickets(
      filter(
        tickets,
        (ticket) => ticket.eta > lowerIsoDate && ticket.eta < uperIsoDate,
      ),
    );
  }, [currentDate, setPeriodTickets, tickets]);

  return (
    <div className="mx-auto max-w-7xl pb-6">
      <div className="min-w-0 lg:flex lg:flex-col">
        <header className="flex min-w-0 items-center space-x-2 py-4 px-6 md:flex-none lg:px-0">
          <h1 className="flex min-w-0 flex-1 flex-row items-center space-x-1 text-2xl text-gray-600 sm:font-medium">
            <span className="hidden truncate lg:block">Deliveries:</span>
            <time
              dateTime={format(currentDate, "MMMM y")}
              className="whitespace-nowrap text-gray-900 xl:hidden"
            >
              {format(currentDate, "MMM. y")}
            </time>
            <time
              dateTime={format(currentDate, "MMMM y")}
              className="hidden whitespace-nowrap text-gray-900 xl:inline-block"
            >
              {format(currentDate, "MMMM y")}
            </time>
          </h1>

          <ScheduleTabs orgId={orgId} current="Calendar" />

          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center rounded-md shadow-sm md:items-stretch">
              <button
                type="button"
                className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative disabled:bg-gray-100 disabled:hover:bg-gray-100 md:w-9 md:px-2 md:hover:bg-gray-50"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <span className="sr-only">Previous month</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="hidden border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:block"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </button>
              <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
              <button
                type="button"
                className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <span className="sr-only">Next month</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

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
        <ScheduleCalendarMonth
          deliveredTickets={deliveredTickets}
          tickets={periodTickets}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onViewTicket={(ticketId) => dispatch(showTicketEditModal(ticketId))}
        />
      </div>
      <div className="flex flex-col space-y-2 px-4 sm:mt-4 sm:flex-row sm:justify-between sm:space-y-0 sm:px-0">
        <div className="text-sm font-normal text-gray-500">
          Projected delivery dates powered by{" "}
          <span className="font-medium text-gray-600">Autopilot</span>
        </div>
        <EstimatedAt className="text-sm font-normal text-gray-500" />
      </div>
    </div>
  );
};

const GET_SCHEDULE_TICKETS = gql`
  query getScheduleTicketsForCalendarView {
    planningTickets {
      id
      ...ScheduleCalendarMonthFragment
    }
  }
  ${ScheduleCalendarMonth.fragments.ScheduleCalendarMonthFragment}
`;

const GET_DELIVERED_TICKETS = gql`
  query getDeliveredTicketsForCalendarView(
    $fromDate: DateTime!
    $toDate: DateTime!
  ) {
    planningDeliveredTickets(toDate: $toDate, fromDate: $fromDate) {
      id
      ...ScheduleCalendarMonthFragment
    }
  }
  ${ScheduleCalendarMonth.fragments.ScheduleCalendarMonthFragment}
`;
