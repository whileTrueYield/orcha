import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { ViewSchedulePriorities } from "./ViewSchedulePriorities";
import { Button } from "components/fields/Button";

export const SchedulePrioritiesView: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const isAdmin = useSelector(isAdminLevel);

  return (
    <div className="mx-auto max-w-7xl pb-6">
      <div className="min-w-0 lg:flex lg:flex-col">
        <header className="flex min-w-0 items-center space-x-2 py-4 px-6 md:flex-none lg:px-0">
          <h1 className="flex min-w-0 flex-1 flex-row items-center space-x-1 text-2xl text-gray-600 sm:font-medium">
            <span className="hidden truncate lg:block">Priorities</span>
          </h1>

          <ScheduleTabs orgId={orgId} current="Priorities" />
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

        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center rounded-md shadow-sm md:items-stretch">
            <ViewSchedulePriorities />
          </div>
        </div>
      </div>
    </div>
  );
};
