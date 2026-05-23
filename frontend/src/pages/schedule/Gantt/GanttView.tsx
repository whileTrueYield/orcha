import cn from "classnames";
import { Button } from "components/fields/Button";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { ScheduleTabs } from "../Tabs/ScheduleTabs";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { find, keyBy, last, map, max, range, uniq, without } from "lodash";
import { addDays, differenceInDays, startOfDay } from "date-fns";
import { useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { QueryReturnValue } from "types/queryTypes";
import { useWindowResize } from "hooks/useWindowResize";
import {
  GanttDisplayMode,
  GanttProject,
  GanttProjectMilestone,
  GanttState,
} from "./types";
import {
  aggregateGanttProjects,
  flattenGanttTree,
  getProjectAncestry,
} from "./aggregateGanttProjects";
import { GanttRow } from "./GanttRow";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { roleUsageCount } from "./roleUsageCount";
import { GanttToolbar } from "./GanttToolbars";
import { useUrlQuery } from "hooks/useUrlQuery";
import { GanttScale } from "./GanttScale";

export const GanttView: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const urlQuery = useUrlQuery();
  const isAdmin = useSelector(isAdminLevel);
  const [timeScale, setTimeScale] = useState<"day" | "week" | "month">("week");
  const [ganttWidth, setGanttWidth] = useState<number | null>(0);
  const ganttRef = useRef<HTMLDivElement>(null);
  const [openedProjectIds, setOpenedProjectIds] = useState<number[]>([]);
  const [displayMode, setDisplayMode] =
    useState<GanttDisplayMode>("scheduledOnly");

  const { data: estimateData, refetch: refetchEstimates } = useQuery<
    QueryReturnValue["getAllEstimates"]
  >(GET_SCHEDULED_ESTIMATES, { fetchPolicy: "cache-and-network" });
  const { data: projectsData, refetch: refetchProjects } =
    useQuery<QueryReturnValue["getGanttProjects"]>(GET_GANTT_PROJECTS);

  const projects = projectsData ? projectsData.getGanttProjects : [];
  const estimates = estimateData ? estimateData.getAllEstimates : [];

  // we'll read the available width so we'll always display as many days
  // as visible on the width of the page to avoid having a partially blank
  // Gantt chart
  useWindowResize(() => {
    const ganttElt = ganttRef.current;
    if (ganttElt) {
      const { width } = ganttElt.getBoundingClientRect();
      // the width of the scrollable gantt view is the whole gantt minus
      // the width of the first column
      setGanttWidth(width - 192);
    }
  });

  const estimatesById = keyBy(estimates, "id");

  const projectAncestry = getProjectAncestry(projects);

  // we can limit the projects being displayed using the URL Query projectId=xxx attr
  const projectRootId = urlQuery.get("projectId");
  const rootProject = projectRootId
    ? find(projects, { id: parseInt(projectRootId) })
    : null;

  // convert the projects into GanttProject object
  const allGanttProjects = map(projects, (project): GanttProject => {
    let startDate: Date | null = null;
    let stopDate: Date | null = null;
    const projectStates: GanttState[] = [];
    const milestones: GanttProjectMilestone[] = [];

    for (const ticket of project.tickets) {
      for (const state of ticket.ticketWorkflowStates) {
        const stateEstimate = estimatesById[state.id];

        if (stateEstimate) {
          const ganttState: GanttState = {
            startDate: new Date(stateEstimate.start_p80 * 1000),
            stopDate: new Date(stateEstimate.end_p80 * 1000),
            roleId: state.assigneeId || stateEstimate.assigneeId,
          };

          projectStates.push(ganttState);
          if (!startDate || ganttState.startDate < startDate) {
            startDate = startOfDay(ganttState.startDate);
          }
          if (!stopDate || ganttState.stopDate > stopDate) {
            stopDate = addDays(startOfDay(ganttState.stopDate), 1);
          }
        }
      }

      if (ticket.milestone) {
        const lastState = last(ticket.ticketWorkflowStates);
        if (lastState && estimatesById[lastState.id]) {
          milestones.push({
            ticket,
            date: new Date(estimatesById[lastState.id].end_p80 * 1000),
          });
        }
      }
    }

    return {
      id: project.id,
      name: project.name,
      parentId: project.parentId,
      startDate,
      stopDate,
      states: projectStates,
      childrenStates: [],
      children: [],
      milestones,
      childrenMilestones: [],
      level: 0,
    };
  });

  let ganttProjects: GanttProject[] = [];

  for (const project of aggregateGanttProjects(
    allGanttProjects,
    rootProject?.id,
  )) {
    let projects = flattenGanttTree(project, openedProjectIds);

    // filter out any project that does not have any scheduled tickets
    if (displayMode === "scheduledOnly") {
      projects = projects.filter(
        (project) =>
          project.childrenStates.length + project.states.length > 0 ||
          // if the project was requested, display it even if empty
          project.id === rootProject?.id,
      );
    }

    ganttProjects = [...ganttProjects, ...projects];
  }

  const toggleProjectId = (projectId: number) => () => {
    if (openedProjectIds.includes(projectId)) {
      setOpenedProjectIds(without(openedProjectIds, projectId));
    } else {
      setOpenedProjectIds([...openedProjectIds, projectId]);
    }
  };

  // for the scale to be effective, we gather the number of
  // role IDs used accross all the schedule items.
  const roleIds = uniq(
    allGanttProjects.map((p) => p.states.map((s) => s.roleId)).flat(),
  );

  const roleUsage = roleUsageCount(allGanttProjects);

  // the width of a day is based on the scale (the month view renders
  // the smallest days)
  const dayWidth = timeScale === "day" ? 40 : timeScale === "week" ? 14 : 6;

  // we then compute the number of days we can see based the window width
  const visibleDays = ganttWidth ? Math.floor(ganttWidth / dayWidth) : 0;

  const startDate = startOfDay(new Date());

  // the stopDate will either be the further's date referenced by our projects
  // or the date allowed by the width of the window (whichever is bigger)
  const stopDate = max([
    ...map(ganttProjects, "stopDate"),
    addDays(startDate, visibleDays),
  ]);

  // now we can compute how many days are needed for the date range of our gantt
  const days = differenceInDays(stopDate!, startDate!) + 1;

  // render the day vertical lines and lightly shaded weekends
  const renderCanvas = () => {
    const dow = startDate.getDay();

    return range(days).map((day) => (
      <div
        key={`canvas-${day}`}
        className={cn(
          "h-full border-l border-gray-100 first:border-0",
          (day + dow) % 7 === 6 || (day + dow) % 7 === 0
            ? "bg-gray-50"
            : "bg-white",
        )}
        style={{ width: dayWidth }}
      ></div>
    ));
  };

  return (
    <div className={cn("group mx-auto")}>
      <div className="mx-auto max-w-7xl lg:flex lg:flex-col">
        <header className="flex min-w-0 items-center justify-between space-x-2 px-6 py-4 md:flex-none lg:px-0">
          <h1 className="flex min-w-0 flex-row items-center space-x-1 text-2xl text-gray-600 sm:font-medium">
            <span className="hidden truncate lg:block">Gantt</span>
          </h1>

          <ScheduleTabs orgId={orgId} current="Gantt" />

          {isAdmin ? (
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
          ) : (
            <div></div>
          )}
        </header>
      </div>

      <GanttToolbar
        projects={projects}
        setOpenedProjectIds={setOpenedProjectIds}
        refresh={() => Promise.all([refetchProjects(), refetchEstimates()])}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        timeScale={timeScale}
        setTimeScale={setTimeScale}
        rootProject={rootProject}
      />
      <div
        ref={ganttRef}
        className="relative z-10 flex max-h-[calc(100vh-210px)] flex-row overflow-auto overscroll-contain border bg-white"
      >
        <div className="sticky left-0 z-30 w-48 shrink-0 divide-y">
          <div className="sticky left-0 top-0 z-30 flex h-14 flex-col items-center justify-center border-b border-r bg-white font-medium text-gray-800">
            Project
          </div>
          {ganttProjects.map((project, index) => (
            <div
              key={index}
              className="sticky left-0 z-20 flex h-12 w-full items-center border-r bg-white px-2"
              title={project.name}
            >
              {project.level ? (
                <div
                  className="absolute inset-y-0 left-0 bg-gray-200"
                  style={{ width: project.level * 10 }}
                />
              ) : null}
              <p
                className="group line-clamp-2 text-sm text-gray-600 hover:text-gray-700"
                role="button"
                style={{ paddingLeft: project.level * 10 }}
                onClick={toggleProjectId(project.id)}
              >
                {project.children.length ? (
                  <ChevronRightIcon
                    className={cn(
                      "relative inline-block h-4 w-4 transition-all duration-300 group-hover:text-gray-500",
                      {
                        "text-gray-400": !openedProjectIds.includes(project.id),
                        "rotate-90 transform text-gray-500":
                          openedProjectIds.includes(project.id),
                      },
                    )}
                  />
                ) : null}
                {project.name}
              </p>
            </div>
          ))}
        </div>
        <div className="relative flex-1 divide-y bg-white">
          <div className="sticky top-0 z-20 flex h-14 flex-row divide-x overflow-clip border-b bg-white">
            <GanttScale
              startDate={startDate}
              stopDate={stopDate!}
              timeScale={timeScale}
              dayWidth={dayWidth}
            />
          </div>
          <div
            className="absolute left-0 flex flex-row"
            style={{ top: 56, height: ganttProjects.length * 48 }}
          >
            {renderCanvas()}
          </div>
          {ganttProjects.map((project) => (
            <GanttRow
              key={project.id}
              startDate={startDate}
              project={project}
              dayWidth={dayWidth}
              isOpen={openedProjectIds.includes(project.id)}
              roleCount={roleIds.length}
              usage={roleUsage}
              ancestry={projectAncestry}
              onClick={toggleProjectId(project.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const GET_GANTT_PROJECTS = gql`
  query getGanttProjects {
    getGanttProjects {
      id
      name
      parentId
      tickets {
        id
        localId
        status
        title
        milestone
        product {
          id
          code
        }
        ticketWorkflowStates {
          assigneeId
          id
        }
      }
    }
  }
`;

const GET_SCHEDULED_ESTIMATES = gql`
  query getAllEstimates {
    getAllEstimates {
      id
      epoch
      start_p80
      end_p80
      start
      end
      assigneeId
    }
  }
`;
