import { useRef, useState } from "react";
import cn from "classnames";
import { ProjectGoalProgress } from "types/graphql";
import Popover from "components/Popover/PopoverLazy";
import { plural } from "utils/string";
import { round } from "lodash";

interface Props {
  goal: ProjectGoalProgress;
  labelProgress: string;
  labelPreviousWork: string;
  labelTotal: string;
  labelLeftToDo: string;
  title: string;
}

export const ProjectProgressBar: React.FC<Props> = (props) => {
  const { goal } = props;
  const [isVisible, setVisible] = useState(false);
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const progressPercent = goal.total ? (goal.progress / goal.total) * 100 : 0;
  const otherTicketsRef = useRef(null);

  const accomplishedPercent = goal.total
    ? ((goal.accomplished + goal.progress) / goal.total) * 100
    : 0;

  const progressClass = cn("absolute inset-y-0 left-0 h-full bg-green-500", {
    "rounded-r-full": progressPercent > 3,
    "rounded-r-md": progressPercent > 1 && progressPercent <= 3,
    "rounded-r-sm": progressPercent < 1,
  });

  const goalLeft = goal.total - (goal.progress + goal.accomplished);

  const previousWidth = goal.accomplished
    ? (300 * goal.accomplished) / goal.total
    : 0;
  const progressWidth = goal.progress ? (300 * goal.progress) / goal.total : 0;
  const leftWidth = goalLeft ? (300 * goalLeft) / goal.total : 0;

  const renderBar = (
    width: number,
    time: number,
    barClassName: string,
    textClassName: string
  ) => {
    const hours = time / 3600;
    if (width < 65) {
      return (
        <>
          <span
            style={{ width: round(width) }}
            className={cn(barClassName, "h-6 rounded-sm rounded-r-lg")}
          ></span>
          <span className={cn(textClassName, "ml-2 text-sm font-bold")}>
            {plural(
              "{} hr",
              "{} hrs",
              hours > 9 ? round(hours) : round(hours, 1)
            )}
          </span>
        </>
      );
    } else {
      return (
        <span
          style={{ width: round(width) }}
          className={cn(
            barClassName,
            "rounded-sm rounded-r-lg py-0.5 pr-3 text-right font-semibold"
          )}
        >
          {plural(
            "{} hr",
            "{} hrs",
            hours > 9 ? round(hours) : round(hours, 1)
          )}
        </span>
      );
    }
  };

  return (
    <div
      ref={setReferenceElement}
      className="relative flex h-4 flex-1 flex-row overflow-hidden rounded-full bg-gray-200"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      // onClick={() => setVisible(true)}
      role="button"
    >
      <div
        className={progressClass}
        style={{ width: accomplishedPercent + "%" }}
      ></div>
      <div
        className="absolute inset-y-0 left-0 h-full bg-gray-600"
        style={{ width: (goal.accomplished / goal.total) * 100 + "%" }}
      ></div>
      {referenceElement && isVisible && (
        <Popover
          referenceElement={referenceElement}
          className="z-10 max-w-2xl"
          background="bg-gray-900"
        >
          <div
            ref={otherTicketsRef}
            className="overflow-y-auto rounded-lg bg-gray-900 py-4 px-6 text-sm font-medium text-gray-100 shadow"
          >
            <h1 className="mb-4 text-center text-base font-semibold text-white">
              {props.title}
            </h1>
            <div className="space-y-2">
              <div className="flex flex-row items-center">
                <label className="w-36 shrink-0 pr-2 text-right text-gray-200">
                  {props.labelPreviousWork}
                </label>
                {renderBar(
                  previousWidth,
                  Math.ceil(goal.accomplished),
                  "bg-gray-700 text-white",
                  "text-gray-200"
                )}
              </div>
              <div className="flex flex-row items-center">
                <label className="w-36 shrink-0 pr-2 text-right text-gray-200">
                  {props.labelProgress}
                </label>
                {renderBar(
                  progressWidth,
                  Math.ceil(goal.progress),
                  "bg-green-500 text-gray-900",
                  "text-green-400"
                )}
              </div>
              <div className="flex flex-row items-center">
                <label className="w-36 shrink-0 pr-2 text-right text-gray-200">
                  {props.labelLeftToDo}
                </label>
                {renderBar(
                  leftWidth,
                  Math.ceil(goalLeft),
                  "bg-gray-300 text-gray-900",
                  "text-gray-300"
                )}
              </div>
              <div className=" hidden flex-row items-center">
                <label className="w-36 shrink-0 pr-2 text-right text-gray-200">
                  {props.labelTotal}
                </label>
                <span className="font-sm bg-transparent py-0.5 font-semibold text-gray-50">
                  {plural(
                    "{} hr",
                    "{} hrs",
                    goal.total / 3600 > 9
                      ? round(goal.total / 3600)
                      : round(goal.total / 3600, 1)
                  )}
                </span>
              </div>
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
};
