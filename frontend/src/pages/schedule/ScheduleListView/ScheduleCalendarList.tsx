import { PlanningTicket } from "types/graphql";
import { format, formatDistanceToNow } from "date-fns";
import { EmptyState } from "components/views/EmtpyState";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";

interface Props {
  tickets: PlanningTicket[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onViewTicket: (ticketId: number) => void;
}

export const ScheduleCalendarList: FCWithFragments<Props> = (props) => {
  const renderProjectionRow = (ticket: PlanningTicket) => {
    return (
      <tr key={ticket.id} className={ticket.milestone ? "bg-yellow-50" : ""}>
        <td className="w-0 px-3 py-4 pl-4 sm:pl-6">
          <TicketIdTag
            milestone={ticket.milestone}
            className="ml-1 hidden text-xs xl:inline-block"
            localId={ticket.localId}
            productCode={ticket.productCode}
          />
        </td>
        <td
          title={ticket.title}
          className="max-w-md truncate whitespace-nowrap py-4 pr-3 text-sm font-medium text-brand-600"
        >
          <button type="button" onClick={() => props.onViewTicket(ticket.id)}>
            {ticket.title}
          </button>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {ticket.workflowName}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {ticket.eta ? format(new Date(ticket.eta), "ccc PP") : ""}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
          {ticket.eta
            ? formatDistanceToNow(new Date(ticket.eta), { addSuffix: true })
            : ""}
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:max-h-[calc(100vh-208px)] md:min-h-[24rem] md:overflow-y-auto md:overflow-x-hidden md:rounded-lg">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 text-center text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 sm:pl-6"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 sm:pl-6"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500"
                  >
                    Workflow
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500"
                  >
                    Completion
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap px-3 py-3.5 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500"
                  ></th>
                </tr>
                <tr>
                  <th className="h-px bg-gray-200 p-0" colSpan={6}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white ">
                {props.tickets.length ? (
                  props.tickets.map(renderProjectionRow)
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <EmptyState
                        title="No tickets"
                        subTitle="This month has no expected deliveries"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

ScheduleCalendarList.fragments = {
  ScheduleCalendarListFragment: gql`
    fragment ScheduleCalendarListFragment on PlanningTicket {
      id
      title
      productCode
      productName
      localId
      eta
      milestone
      workflowName
    }
  `,
};
