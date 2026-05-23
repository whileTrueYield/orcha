import { gql, useQuery } from "@apollo/client";
import { showTicketEditModal } from "actions";
import { Button } from "components/fields/Button";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch } from "store";
import { urlResolver } from "utils/navigation";
import { EstimatedAt } from "./EstimatedAt";
import { ScheduleCalendarList } from "./ScheduleCalendarList";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { CompromisedScheduleWarning } from "../CompromisedScheduleWarning";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { QueryReturnValue } from "types/queryTypes";

export const ScheduleListView: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAdmin = useSelector(isAdminLevel);
  const { orgId } = useParams<{ orgId: string }>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data, error } = useQuery<QueryReturnValue["planningTickets"]>(
    GET_SCHEDULE_TICKETS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  if (error) {
    console.error(error);
  }

  const planningTickets = data?.planningTickets || [];

  return (
    <div className="mx-auto max-w-7xl pb-6">
      <div>
        <header className="flex items-center py-4 px-6 md:flex-none lg:px-0">
          <h1 className="flex-1 text-2xl text-gray-700 sm:font-medium">
            All Scheduled Tickets
          </h1>
          <ScheduleTabs orgId={orgId} current="Scheduled Tickets" />
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

        <ScheduleCalendarList
          tickets={planningTickets}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          onViewTicket={(ticketId) => dispatch(showTicketEditModal(ticketId))}
        />
      </div>
      <div className="mt-4 flex flex-row justify-between">
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
  query getScheduleTicketForListViews {
    planningTickets {
      id
      ...ScheduleCalendarListFragment
    }
  }
  ${ScheduleCalendarList.fragments.ScheduleCalendarListFragment}
`;
