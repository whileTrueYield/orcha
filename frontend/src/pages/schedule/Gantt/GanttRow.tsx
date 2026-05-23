import { addDays, differenceInDays, formatISO, startOfDay } from "date-fns";
import { GanttMilestone } from "./GanttMilestone";
import {
  GanttProject,
  GanttProjectAncestry,
  GanttRoleUsage,
  GanttState,
} from "./types";
import { groupBy, map, range, reduce } from "lodash";
import cn from "classnames";

interface Props {
  project: GanttProject;
  dayWidth: number;
  startDate: Date;
  isOpen?: boolean;
  roleCount: number;
  usage: GanttRoleUsage;
  ancestry: GanttProjectAncestry;
  onClick: () => void;
}

export const GanttRow: React.FC<Props> = (props) => {
  const { project, dayWidth, startDate, isOpen, roleCount, ancestry } = props;

  const hasChildren = project.children.length > 0;

  const renderProjectMilestones = (project: GanttProject) => {
    if (startDate) {
      // when the project is open (showing its sub-projects) we
      // only want to display its own milestones, when folded,
      // we include its sub-projects milestones
      const milestones = isOpen
        ? project.milestones
        : [...project.milestones, ...project.childrenMilestones];

      if (milestones.length) {
        const milestoneByDate = groupBy(milestones, ({ date }) =>
          startOfDay(date).toISOString()
        );

        return map(milestoneByDate, (milestones, dateISO) => {
          const dateObj = new Date(dateISO);
          const left =
            (differenceInDays(startOfDay(dateObj), startDate) + 0.5) * dayWidth;
          return (
            <div
              style={{ left }}
              key={`milestone-${dateISO}`}
              className="absolute bottom-1 z-20 -ml-2"
            >
              <GanttMilestone
                tickets={milestones.map((m) => m.ticket)}
                date={dateObj}
              />
            </div>
          );
        });
      }
    }

    return null;
  };

  const getProjectWidth = (project: GanttProject): number => {
    if (project.startDate && project.stopDate) {
      return differenceInDays(project.stopDate, project.startDate) * dayWidth;
    }

    return 0;
  };

  const getProjectLeftPadding = (project: GanttProject): number => {
    if (project.startDate && startDate) {
      return (
        differenceInDays(new Date(project.startDate), startDate) * dayWidth
      );
    }

    return 0;
  };

  const renderProjectHeatMap = (project: GanttProject) => {
    if (!project.startDate || !project.stopDate) {
      return <div></div>;
    }

    const { startDate, stopDate } = project;

    const cells = range(differenceInDays(stopDate, startDate));

    return (
      <div className="flex h-full flex-row">
        {cells.map((cell) => {
          const fromDate = addDays(startDate, cell);
          const untilDate = addDays(startDate, cell + 1);
          const isoDate = formatISO(fromDate, { representation: "date" });
          const usage = props.usage[isoDate];

          const score = reduce(
            usage,
            (score: number, curr) => {
              if (!isOpen) {
                for (const projectId in curr.byProjectId) {
                  if (ancestry[projectId].includes(project.id)) {
                    return score + curr.byProjectId[projectId] / curr.value;
                  }
                }
              }

              if (curr.byProjectId[project.id]) {
                return score + curr.byProjectId[project.id] / curr.value;
              }

              return score;
            },
            0
          );

          const matchingStates: GanttState[] = [];
          for (const state of project.states) {
            if (state.startDate < untilDate && state.stopDate > fromDate) {
              matchingStates.push(state);
            }
          }

          const adjustedScore = score / roleCount;

          return (
            <div
              key={cell}
              title={isoDate}
              style={{ width: dayWidth }}
              className={cn("h-full w-full", {
                "bg-transparent": adjustedScore === 0,
                "bg-sky-200": adjustedScore <= 0.1,
                "bg-sky-300": adjustedScore > 0.1 && adjustedScore <= 0.2,
                "bg-sky-400": adjustedScore > 0.2 && adjustedScore <= 0.3,
                "bg-sky-500": adjustedScore > 0.3 && adjustedScore <= 0.4,
                "bg-sky-600": adjustedScore > 0.4 && adjustedScore <= 0.5,
                "bg-sky-700": adjustedScore > 0.5 && adjustedScore <= 0.6,
                "bg-sky-800": adjustedScore > 0.6 && adjustedScore <= 0.7,
                "bg-sky-900": adjustedScore > 0.7 && adjustedScore <= 0.8,
                "bg-sky-950": adjustedScore > 0.8,
              })}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="relative h-12 pt-3"
      style={{ paddingLeft: getProjectLeftPadding(project) }}
    >
      {renderProjectMilestones(project)}
      {isOpen && hasChildren ? (
        <div
          className="absolute top-3 z-0 h-6 rounded-sm border border-dashed border-gray-300 bg-gray-300 bg-opacity-20"
          style={{
            width: getProjectWidth(project),
            left: getProjectLeftPadding(project),
          }}
        />
      ) : null}
      <div
        className="relative z-10 h-6"
        role={hasChildren ? "button" : undefined}
        onClick={hasChildren ? props.onClick : undefined}
        style={{ width: getProjectWidth(project) }}
      >
        {renderProjectHeatMap(project)}
      </div>
    </div>
  );
};
