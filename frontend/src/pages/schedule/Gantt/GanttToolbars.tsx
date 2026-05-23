import {
  FolderIcon,
  FolderOpenIcon,
  RefreshIcon,
} from "@heroicons/react/solid";
import { createNotification } from "actions";
import { Button } from "components/fields/Button";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { ToggleButton } from "components/fields/ToggleButton";
import { convertToMiniProject } from "components/fields/convertToMini";
import { useHistory, useParams } from "react-router-dom";
import { useAppDispatch } from "store";
import { Project } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { GanttDisplayMode, GanttTimeScale } from "./types";
import cn from "classnames";

interface Props {
  hideProjectSelect?: boolean;
  setOpenedProjectIds: (projectIds: number[]) => void;
  refresh: () => Promise<any>;
  displayMode: GanttDisplayMode;
  setDisplayMode: (mode: GanttDisplayMode) => void;
  projects: Project[];
  setTimeScale: (scale: GanttTimeScale) => void;
  timeScale: GanttTimeScale;
  rootProject?: Project | null;
}

export const GanttToolbar: React.FC<Props> = (props) => {
  const {
    setOpenedProjectIds,
    projects,
    refresh,
    displayMode,
    setDisplayMode,
    timeScale,
    setTimeScale,
    rootProject,
  } = props;
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();
  const dispatch = useAppDispatch();

  return (
    <div className="z-20 mx-4 mb-4 flex flex-col justify-end space-y-4 sm:mx-0 sm:flex-row sm:space-y-0">
      {props.hideProjectSelect ? null : (
        <ProjectSelect
          value={rootProject ? convertToMiniProject(rootProject) : null}
          onChange={(project) =>
            project
              ? history.push(
                  urlResolver.schedule.gantt(orgId) + `?projectId=${project.id}`
                )
              : history.push(urlResolver.schedule.gantt(orgId))
          }
          showUnsetButton
          className="z-20 -mr-px flex-1"
          inputClassName="rounded-r-none"
        />
      )}
      <div className="-mx-px flex flex-row space-x-1 border border-gray-300 bg-white px-2 py-1">
        <button
          type="button"
          className={cn("rounded px-1.5 text-sm font-medium", {
            "bg-sky-600 text-sky-50": timeScale === "day",
            "bg-white text-gray-600 hover:bg-gray-200": timeScale !== "day",
          })}
          onClick={() => setTimeScale("day")}
        >
          Day
        </button>
        <button
          type="button"
          className={cn("rounded px-1.5 text-sm font-medium", {
            "bg-sky-600 text-sky-50": timeScale === "week",
            "bg-white text-gray-600 hover:bg-gray-200": timeScale !== "week",
          })}
          onClick={() => setTimeScale("week")}
        >
          Week
        </button>
        <button
          type="button"
          className={cn("rounded px-1.5 text-sm font-medium", {
            "bg-sky-600 text-sky-50": timeScale === "month",
            "bg-white text-gray-600 hover:bg-gray-200": timeScale !== "month",
          })}
          onClick={() => setTimeScale("month")}
        >
          Month
        </button>
      </div>
      <Button
        type="button"
        btnType="white"
        fullInMobile
        onClick={() => setOpenedProjectIds(projects.map((prjt) => prjt.id))}
        btnGroup={props.hideProjectSelect ? "start" : "middle"}
      >
        <FolderOpenIcon className="mr-1 h-5 w-5 text-yellow-300" />
        <span className="hidden lg:inline">Open All</span>
        <span className="lg:hidden">Open</span>
      </Button>

      <Button
        type="button"
        btnType="white"
        fullInMobile
        onClick={() => setOpenedProjectIds([])}
        btnGroup="middle"
      >
        <FolderIcon className="mr-1 h-5 w-5 text-yellow-300" />
        <span className="hidden lg:inline">Close All</span>
        <span className="lg:hidden">Close</span>
      </Button>
      <div className="-mx-px flex flex-row items-center border-b border-l border-r border-t border-gray-300 bg-white px-3">
        <ToggleButton
          checked={displayMode === "all"}
          onChange={() =>
            setDisplayMode(
              displayMode === "scheduledOnly" ? "all" : "scheduledOnly"
            )
          }
          label="All"
          leftLabel="Scheduled"
          checkedColor="bg-gray-200"
          uncheckedColor="bg-sky-300"
          small
        />
      </div>
      <Button
        type="button"
        btnType="white"
        btnGroup="end"
        onClick={() =>
          refresh().then(() =>
            dispatch(
              createNotification({
                type: "Success",
                title: `Gantt refreshed`,
              })
            )
          )
        }
      >
        <RefreshIcon className="mr-1 h-5 w-5 text-gray-500" />
        <span className="hidden lg:inline">Refresh</span>
      </Button>
    </div>
  );
};
