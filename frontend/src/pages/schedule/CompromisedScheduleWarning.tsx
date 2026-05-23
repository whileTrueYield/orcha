import { ExclamationIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMe } from "reducers/selector";
import { ScheduleStatus } from "types/graphql";
import { urlResolver } from "utils/navigation";

export const CompromisedScheduleWarning: React.FC = () => {
  const me = useSelector(getMe);
  const [isVisible, setVisible] = useState(true);

  const organization = me?.organization;

  if (
    !organization ||
    organization.scheduleStatus === ScheduleStatus.Ok ||
    !isVisible
  ) {
    return null;
  }

  return (
    <div className="my-4 flex justify-center">
      <div className="relative max-w-xl rounded-md bg-yellow-50 p-4 shadow-sm">
        <button
          className="absolute right-2 top-2 rounded p-1 text-yellow-900 hover:bg-yellow-100"
          type="button"
          onClick={() => setVisible(false)}
        >
          <XIcon className="h-5 w-5" />
        </button>

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
                We have detected problematic ticket states which negatively
                impact your schedule accuracy. We recommend you fix them as soon
                as possible to restore accurate estimates.
              </p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Link
                  to={urlResolver.schedule.blockingTickets(organization.id)}
                  className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                >
                  Open Resolver
                </Link>
                <button
                  type="button"
                  className="ml-3 rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                  onClick={() => setVisible(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
