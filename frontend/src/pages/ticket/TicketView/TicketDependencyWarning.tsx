import { gql, useQuery } from "@apollo/client";
import { ExclamationIcon } from "@heroicons/react/outline";
import { QueryReturnValue } from "types/queryTypes";
import cn from "classnames";

interface Props {
  ticketId: number;
  className?: string;
  onClickDependency: () => void;
}

export const TicketDependencyWarning: React.FC<Props> = (props) => {
  const { data } = useQuery<QueryReturnValue["getUnscheduledDependencies"]>(
    GET_TICKET_DEPENDENCIES,
    {
      variables: { ticketIds: [props.ticketId] },
    }
  );

  if (data && data.getUnscheduledDependencies.length > 0) {
    return (
      <div className={cn("rounded-md bg-yellow-50 p-4", props.className)}>
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationIcon
              className="h-5 w-5 text-yellow-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Unscheduled Dependencies Detected
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                One or more of dependencies have not been scheduled. This could
                lead to quality and overall execution issues.
                <button
                  type="button"
                  onClick={props.onClickDependency}
                  className="ml-1 inline font-medium underline hover:text-yellow-600 hover:no-underline"
                >
                  View Dependencies
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const GET_TICKET_DEPENDENCIES = gql`
  query GetCurrentTicketUnscheduledDependencies($ticketIds: [Int!]!) {
    getUnscheduledDependencies(ticketIds: $ticketIds) {
      id
      title
    }
  }
`;
