import { format } from "date-fns";
import React from "react";
import { UpcomingTicketList } from "./UpcomingTicketList";
import { TicketToEstimate } from "./TicketToEstimate";
import { TodoList } from "./TodoList";
import { PreviousTicketList } from "./PreviousTicketList";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Avatar } from "components/views/Avatar";
import { usePageTitle } from "hooks/usePageTitle";
import { DashboardTimezone } from "./DashboardTimezone";
import { PopoverTips } from "components/help/HelpBlock";
import { RecentlyCreatedTicketList } from "./RecentlyCreatedTicketList";
import { MyNotScheduledTickets } from "./MyNotScheduledTickets";
import { MyCalendar } from "./MyCalendar";

export const Home: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const today = format(new Date(), "EEEE, LLLL do, yyyy");
  const me = useSelector(getMe);
  usePageTitle("Home");

  if (!me?.role) {
    return null;
  }

  return (
    <div className="mx-auto mb-8 mt-2 flex max-w-7xl flex-col justify-start sm:mt-6">
      <div className="flex flex-col justify-between px-4 sm:flex-row sm:px-0">
        <div className="hidden flex-col sm:flex">
          <div className="flex flex-row items-center">
            <Avatar
              className="mr-4 h-16 w-16 rounded-md border-2 border-white shadow-sm"
              src={me.role.avatarUrl}
              name={me.role.name}
            />
            <div>
              <DashboardTimezone timeZone={me.role.timeZone} />
              <div className="text-2xl text-gray-700 sm:font-medium">
                Welcome back
                <Link
                  to={urlResolver.user.editMe(orgId)}
                  className="ml-1.5 text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {me.role.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden flex-col items-end sm:flex">
          <div className="text-sm text-gray-500">Today is</div>
          <div className="text-2xl font-medium text-gray-700">{today}</div>
        </div>
        <div className="mt-4 flex flex-col items-center sm:hidden">
          <div className="text-sm text-gray-500">Today is</div>
          <div className="text-lg font-medium text-gray-700">{today}</div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 px-4 sm:px-0">
        <div className="col-span-2 min-w-0 overflow-y-auto rounded-lg bg-white shadow sm:h-112 md:col-span-1">
          <TicketToEstimate />
        </div>
        <div className="col-span-2 flex min-w-0 flex-col rounded-lg bg-white p-4 shadow sm:h-112 md:col-span-1">
          <TodoList className="flex h-full flex-1 flex-col" />
        </div>

        <div className="col-span-2 min-w-0 space-y-4 overflow-hidden md:grid md:grid-cols-2 md:space-y-0 md:divide-x md:rounded-lg md:bg-white md:shadow">
          <div className="flex flex-1 flex-col rounded-lg bg-white shadow md:h-112 md:rounded-none md:rounded-l-lg md:shadow-none">
            <div className="p-4">
              Tickets you worked on
              <PopoverTips
                title="Tickets you worked on"
                className="relative top-1 inline-block px-1"
              >
                <p>
                  Once you've done some work on a ticket, it will appear here.
                </p>
                <p>
                  This section is here to encourage you to communicate
                  additional information in a timely manner with other members
                  of your team.
                </p>
              </PopoverTips>
            </div>
            <PreviousTicketList className="flex-1 overflow-y-auto" />
          </div>
          <div className="flex flex-1 flex-col rounded-lg bg-white shadow md:h-112 md:rounded-none md:rounded-r-lg md:shadow-none">
            <div className="p-4">
              Prepare for what's next
              <PopoverTips
                title="Prepare for what's next"
                className="relative top-1 inline-block px-1"
              >
                <p>
                  This is your peek into your future. These tickets are being
                  worked on in a workflow stage before the one assigned to you.
                  You can take a look at what's being done to help you plan
                  ahead.
                </p>
              </PopoverTips>
            </div>
            <UpcomingTicketList className="flex-1 overflow-auto" />
          </div>
        </div>
        <div className="col-span-2 min-w-0 overflow-y-auto rounded-lg bg-white shadow sm:h-112 md:col-span-1">
          <MyNotScheduledTickets />
        </div>
        <div className="col-span-2 min-w-0 overflow-y-auto rounded-lg bg-white shadow sm:h-112 md:col-span-1">
          <RecentlyCreatedTicketList />
        </div>
      </div>
      <div className="mt-6 hidden lg:block">
        <MyCalendar />
      </div>
    </div>
  );
};
