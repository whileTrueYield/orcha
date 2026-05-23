import { LightBulbIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { Fragment, useRef, useState } from "react";
import { Popover } from "components/Popover/Popover";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { useOutsideClick } from "hooks/useOutsideClick";
import cn from "classnames";
import { gql, useQuery } from "@apollo/client";
import { QueryReturnValue } from "types/queryTypes";
import { find } from "lodash";

// store the state for the welcome button in a cookie so it
// doesn't show up on every page load
const showDemoModalCookie = document.cookie
  .split("; ")
  .find((row) => row.startsWith("showDemoModal="))
  ?.split("=")[1];

export const WelcomeButton: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const [isVisible, _setVisible] = useState(showDemoModalCookie !== "false");
  const isAdmin = useSelector(isAdminLevel);
  const popoverRef = useRef(null);
  const buttonContainerRef = useRef(null);
  const [referenceElement, setReferenceElement] =
    useState<HTMLSpanElement | null>(null);

  const setVisible = (value: boolean) => {
    if (value === false) {
      document.cookie = "showDemoModal=false";
    }
    _setVisible(value);
  };

  useOutsideClick(buttonContainerRef, () => setVisible(false), {
    ignoreTooltipClick: true,
  });

  const { data } =
    useQuery<QueryReturnValue["miniProjects"]>(GET_PROJECT_QUERY);

  if (import.meta.env.VITE_DEMO_MODE !== "true") {
    return null;
  }

  if (!data?.miniProjects) {
    return null;
  }

  const featureProject = find(
    data.miniProjects,
    (project) => project.name === "Features",
  );

  const musicPlayerProject = find(
    data.miniProjects,
    (project) => project.name === "Music Player",
  );

  const linkClass =
    "text-sky-400 hover:text-sky-300 hover:underline mx-1 font-semibold";

  const buttonClass = cn(
    "group z-50 ml-2 rounded-full hover:bg-yellow-100 hover:text-yellow-600 p-1.5 focus:outline-none focus:ring focus:ring-brand-500 focus:ring-opacity-50 focus:ring-offset-2 sm:ml-4",
    {
      "bg-white text-gray-400": !isVisible,
      "bg-yellow-50 text-yellow-400 ": isVisible,
    },
  );

  return (
    <Fragment>
      <div
        role="button"
        onClick={() => setVisible(!isVisible)}
        className={buttonClass}
        ref={buttonContainerRef}
      >
        <div ref={setReferenceElement}>
          <span className="sr-only">Welcome</span>
          <div className="relative">
            <LightBulbIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
      {referenceElement && isVisible ? (
        <Popover
          referenceElement={referenceElement}
          className="z-[60] mt-6 max-w-xs cursor-auto px-2 sm:max-w-md sm:px-0"
          background="bg-gray-900"
        >
          <div
            ref={popoverRef}
            className="relative overflow-hidden rounded-lg bg-gray-900 p-2 font-medium text-white shadow-lg"
          >
            <div className="absolute -right-12 -top-4">
              <LightBulbIcon className="h-80 w-80 text-gray-400 opacity-[15%]" />
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="absolute top-2 right-2 z-10 rounded p-1.5 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              <XIcon className="h-6 w-6" />
            </button>
            <div className="relative p-4">
              <div className="text-xl font-bold text-white">Welcome 😃</div>
              <p className="mt-2 text-base leading-6 text-gray-100">
                To give you a better sense of what Orcha offers, we created a
                demo of a fictional online music app called GrooveStream.
              </p>
              <p className="mt-2 text-base leading-6 text-gray-100">
                We suggest checking out:
              </p>
              <h2 className="mt-3 text-lg font-bold leading-7 text-white">
                Projects
              </h2>
              <p className="text-base leading-6 text-gray-100">
                Try out the
                <Link
                  onClick={() => setVisible(false)}
                  className={linkClass}
                  to={
                    musicPlayerProject
                      ? urlResolver.explorer.editor(
                          orgId,
                          musicPlayerProject.id,
                        )
                      : urlResolver.explorer.root(orgId)
                  }
                >
                  project editor
                </Link>
                , select some text and quickly generate a ticket. Visit the
                <Link
                  onClick={() => setVisible(false)}
                  className={linkClass}
                  to={
                    featureProject
                      ? urlResolver.explorer.analytics(orgId, featureProject.id)
                      : urlResolver.explorer.analytics(
                          orgId,
                          data.miniProjects[0].id,
                        )
                  }
                >
                  project analytics
                </Link>
                where you can track progress on your projects.
              </p>
              <h2 className="mt-3 text-lg font-bold leading-7 text-white">
                Schedule
              </h2>
              <p className="text-base leading-6 text-gray-100">
                You'll find the delivery dates for all your scheduled tickets in
                the
                <Link
                  onClick={() => setVisible(false)}
                  className={linkClass}
                  to={urlResolver.schedule.root(orgId)}
                >
                  calendar
                </Link>
                {isAdmin && (
                  <>
                    , change the priorities in
                    <Link
                      onClick={() => setVisible(false)}
                      className={linkClass}
                      to={urlResolver.schedule.editPriorities(orgId)}
                    >
                      the schedule editor
                    </Link>
                  </>
                )}
                or review the workload of your team in
                <Link
                  onClick={() => setVisible(false)}
                  className={linkClass}
                  to={urlResolver.schedule.swimlanes(orgId)}
                >
                  the swimlanes.
                </Link>
              </p>
            </div>
          </div>
        </Popover>
      ) : null}
    </Fragment>
  );
};

const GET_PROJECT_QUERY = gql`
  query getAllProjects {
    miniProjects {
      id
      name
    }
  }
`;
