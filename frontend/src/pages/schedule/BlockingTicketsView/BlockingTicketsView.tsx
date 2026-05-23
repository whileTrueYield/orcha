import { gql, useQuery } from "@apollo/client";
import { Button } from "components/fields/Button";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { QueryReturnValue } from "types/queryTypes";
import { BlockingState } from "./BlockingState";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { TicketStatus } from "types/graphql";
import { ExclamationIcon } from "@heroicons/react/solid";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";

export const BlockingTicketsView: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const isAdmin = useSelector(isAdminLevel);
  const { data, error } = useQuery<QueryReturnValue["blockingTickets"]>(
    GET_SCHEDULE_TICKETS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  if (error) {
    console.error(error);
  }

  const blockingTickets = useMemo(
    () =>
      (data?.blockingTickets || []).filter(
        ({ assignee, isActive, ticket }) =>
          assignee && isActive && ticket.status === TicketStatus.Scheduled
      ),

    [data?.blockingTickets]
  );

  const warningAlert = (
    <div className="max-w-xl rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Your schedule is compromised
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              We have detected problematic ticket states which negatively impact
              your schedule. We recommend you fix the following as soon as
              possible to restore accurate estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const norminalAlert = (
    <div className="max-w-xl rounded-md bg-sky-50 p-4 shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationIcon
            className="h-5 w-5 text-sky-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-sky-800">
            Schedule Norminal
          </h3>
          <div className="mt-2 text-sm text-sky-700">
            <p>We have not detected any issues with your schedule</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl pb-6">
      <div>
        <header className="flex items-center py-4 px-6 md:flex-none lg:px-0">
          <h1 className="flex-1 text-2xl text-gray-700 sm:font-medium">
            Blocking Tickets
          </h1>
          <ScheduleTabs orgId={orgId} current="Blocked" />
          {isAdmin && (
            <div className="flex flex-1 items-center justify-end">
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
            </div>
          )}
        </header>

        <div className="my-4 flex justify-center">
          {blockingTickets.length > 0 ? warningAlert : norminalAlert}
        </div>
        <motion.div layout className="rounded-lg bg-white shadow">
          <ul className="divide-y divide-gray-100">
            <AnimatePresence>
              {blockingTickets.map((tws) => (
                <motion.li
                  key={tws.id}
                  initial={false}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: { duration: 0.5 },
                  }}
                >
                  <BlockingState tws={tws} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

const GET_SCHEDULE_TICKETS = gql`
  query getBlockingTicket {
    blockingTickets {
      id
      ...BlockingStateFragment
    }
  }
  ${BlockingState.fragments.BlockingStateFragment}
`;
