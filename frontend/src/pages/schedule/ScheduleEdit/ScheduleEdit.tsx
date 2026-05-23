import { CheckIcon } from "@heroicons/react/outline";
import { Link, Route, Switch, useParams } from "react-router-dom";
import { ScheduleTickets } from "../ScheduleTickets/ScheduleTickets";
import { EditSchedulePriorities } from "../SchedulePriorities/EditSchedulePriorities";
import { ScheduleProjections } from "../ScheduleProjections/ScheduleProjections";
import { urlResolver } from "utils/navigation";
import { matchPath, useLocation } from "react-router";

export const ScheduleEdit: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const location = useLocation();

  const isScheduleTickets = matchPath(location.pathname, {
    path: urlResolver.schedule.paths.editTickets,
    exact: true,
    strict: false,
  });
  const isSchedulePriorities = matchPath(location.pathname, {
    path: urlResolver.schedule.paths.editPriorities,
    exact: true,
    strict: false,
  });
  const isSchedulePreview = matchPath(location.pathname, {
    path: urlResolver.schedule.paths.editProjections,
    exact: true,
    strict: false,
  });

  const steps = [
    {
      id: "01",
      name: "Tickets",
      href: urlResolver.schedule.editTickets,
      status: isScheduleTickets ? "current" : "complete",
      description: "Select tickets for your schedule",
    },
    {
      id: "02",
      name: "Priorities",
      href: urlResolver.schedule.editPriorities,
      status: isScheduleTickets
        ? "upcoming"
        : isSchedulePriorities
        ? "current"
        : "complete",
      description: "Prioritize your tickets",
    },
    {
      id: "03",
      name: "Simulate",
      href: urlResolver.schedule.editProjections,
      status: isSchedulePreview ? "current" : "upcoming",
      description: "Preview and commit changes",
    },
  ];

  return (
    <div className="mx-auto mb-4 mt-2 flex max-w-7xl flex-col justify-start sm:mt-6">
      <nav aria-label="Progress" className="mb-4 px-2 sm:px-0">
        <ol className="divide-y divide-gray-300 rounded-md border border-gray-300 bg-white md:flex md:divide-y-0">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative md:flex md:flex-1">
              {step.status === "complete" ? (
                <Link
                  to={step.href(orgId)}
                  className="group flex w-full items-center"
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 group-hover:bg-brand-800">
                      <CheckIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="text-sm font-medium text-gray-500">
                        {step.description}
                      </span>
                    </span>
                  </span>
                </Link>
              ) : step.status === "current" ? (
                <Link
                  to={step.href(orgId)}
                  className="flex items-center px-6 py-4 text-sm font-medium"
                  aria-current="step"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-600">
                    <span className="text-brand-600">{step.id}</span>
                  </span>
                  <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{step.name}</span>
                    <span className="text-sm font-medium text-gray-500">
                      {step.description}
                    </span>
                  </span>
                </Link>
              ) : (
                <Link to={step.href(orgId)} className="group flex items-center">
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                      <span className="text-gray-500 group-hover:text-gray-900">
                        {step.id}
                      </span>
                    </span>
                    <span className="mt-0.5 ml-4 flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{step.name}</span>
                      <span className="text-sm font-medium text-gray-500">
                        {step.description}
                      </span>
                    </span>
                  </span>
                </Link>
              )}

              {stepIdx !== steps.length - 1 ? (
                <>
                  {/* Arrow separator for lg screens and up */}
                  <div
                    className="absolute top-0 right-0 hidden h-full w-5 md:block"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-full w-full text-gray-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
      <Switch>
        <Route
          path={urlResolver.schedule.paths.editTickets}
          component={ScheduleTickets}
        />
        <Route
          path={urlResolver.schedule.paths.editPriorities}
          component={EditSchedulePriorities}
        />
        <Route
          path={urlResolver.schedule.paths.editProjections}
          component={ScheduleProjections}
        />
      </Switch>
    </div>
  );
};
