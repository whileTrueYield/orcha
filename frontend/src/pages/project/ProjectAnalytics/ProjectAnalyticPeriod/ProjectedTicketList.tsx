import { gql, useQuery } from "@apollo/client";
import { EmptyState } from "components/views/EmtpyState";
import { format } from "date-fns";
import React from "react";
import { QueryScheduledTicketToBeWorkedArgs } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";
import { plural } from "utils/string";
import { ProjectedTicketListRow } from "./ProjectedTicketListRow";

interface Props {
  projectId: number;
  startDate: Date;
  stopDate: Date;
  onEditTicket: (ticketId: number) => void;
}

export const ProjectedTicketList: React.FC<Props> = (props) => {
  const { projectId, startDate, stopDate } = props;

  const { data, error, loading } = useQuery<
    QueryReturnValue["scheduledTicketToBeWorked"],
    QueryScheduledTicketToBeWorkedArgs
  >(GET_EXPECTED_TICKETS_FOR_PERIOD, {
    variables: {
      projectId,
      startDate,
      stopDate,
    },
  });

  if (error) {
    return <EmptyState title="Error" subTitle={error?.message} />;
  }

  const scheduledTicketToBeWorked = data?.scheduledTicketToBeWorked || [];

  const thClassText = `px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;

  const renderLoading = () => (
    <tr>
      <td colSpan={5} className="p-4 py-16">
        <div className="flex h-20 flex-col items-center justify-center text-gray-400">
          Loading...
        </div>
      </td>
    </tr>
  );

  const renderNoDeliveries = () => (
    <tr>
      <td colSpan={5} className="p-4 py-16">
        <div className="flex h-20 flex-col items-center justify-center p-1 text-lg text-gray-600">
          No scheduled work
          <div className="mt-2 text-center text-sm text-gray-500">
            {format(startDate, "PPP")} - {format(stopDate, "PPP")}
          </div>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 flex flex-row items-end justify-between">
        <div className="text-lg text-gray-800">Scheduled Work</div>
        <div className="text-base text-gray-500">
          {plural("{} ticket", "{} tickets", scheduledTicketToBeWorked)}
        </div>
      </h3>

      <div className="-my-2 overflow-x-auto overscroll-x-contain py-2 sm:-mx-4 sm:px-4 ">
        <div className="inline-block h-84 min-w-full overflow-y-auto border-b border-gray-200 bg-white align-middle shadow sm:rounded-lg">
          <table className="relative w-full divide-y divide-gray-200 lg:table-fixed">
            <thead className="sticky top-0 bg-white bg-opacity-50 backdrop-blur">
              <tr>
                <th className={`${thClassText} lg:w-20`}>ID</th>
                <th className={`${thClassText} lg:min-w-64`}>Title</th>
                <th className={thClassText}>Status</th>
                <th className={thClassText}>Projected Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {scheduledTicketToBeWorked.length > 0
                ? scheduledTicketToBeWorked.map((ticket) => (
                    <ProjectedTicketListRow
                      onEditTicket={props.onEditTicket}
                      key={ticket.id}
                      ticket={ticket}
                    />
                  ))
                : loading
                ? renderLoading()
                : renderNoDeliveries()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GET_EXPECTED_TICKETS_FOR_PERIOD = gql`
  query ScheduledTicketToBeWorked(
    $projectId: Int!
    $startDate: DateTime!
    $stopDate: DateTime!
  ) {
    scheduledTicketToBeWorked(
      projectId: $projectId
      startDate: $startDate
      stopDate: $stopDate
    ) {
      id
      title
      localId
      status
      eta
      product {
        id
        code
      }
      ...PeriodTicketRowFragment
    }
  }
  ${ProjectedTicketListRow.fragments.PeriodTicketRowFragment}
`;
