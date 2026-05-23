import { ChevronDownIcon } from "@heroicons/react/solid";
import { ReactNode, useRef, useState } from "react";
import { plural } from "utils/string";
import { useOutsideClick } from "hooks/useOutsideClick";
import { useKeyup } from "hooks/useKeyup";
import { SwimlaneTask } from "./types";
import cn from "classnames";

interface Props {
  renderTask: (task: SwimlaneTask, className: string) => ReactNode;
  tasks: SwimlaneTask[];
}

export const SwimlaneFirstTicket: React.FC<Props> = (props) => {
  const { tasks, renderTask } = props;
  const [showAllTickets, _setShowAllTickets] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popDirection, setPopDirection] = useState<"up" | "down">("down");

  const setShowAllTickets = (value: boolean, event?: React.MouseEvent) => {
    if (event) {
      const bbox = event.currentTarget.getBoundingClientRect();
      if (bbox.top > window.innerHeight / 2) {
        setPopDirection("up");
      } else {
        setPopDirection("down");
      }
    }
    _setShowAllTickets(value);
  };

  useOutsideClick(popupRef, () => setShowAllTickets(false));
  useKeyup("Escape", () => setShowAllTickets(false));

  if (tasks.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-sm font-medium text-gray-400">
        No Tickets
      </div>
    );
  }

  const renderTasks = (tasks: SwimlaneTask[]) => {
    return (
      <div className="relative flex w-full flex-row justify-center">
        <div
          role="button"
          onClick={(event) => setShowAllTickets(!showAllTickets, event)}
          className="group -mb-2 mt-1 inline-block rounded-full py-0.5 pl-3 pr-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-600"
        >
          {plural("+{} more ticket", "+{} more tickets", tasks.length)}
          <ChevronDownIcon className="-mr-0.5 ml-0.5 inline-block h-4 w-4 text-gray-400 group-hover:text-gray-500" />
        </div>
        {showAllTickets && (
          <div
            ref={popupRef}
            className={cn(
              "absolute -inset-x-4 z-10 flex max-h-80 flex-col items-center space-y-3 overflow-auto rounded border-2 border-gray-500 bg-gray-50 py-3 shadow-lg transition-all duration-500 group-[.is-dragging]:max-h-0 group-[.is-dragging]:border-0 group-[.is-dragging]:p-0",
              {
                "top-7": popDirection === "down",
                "bottom-4": popDirection === "up",
              }
            )}
          >
            {tasks.map((task) => (
              <div key={`${task.ticket.id}${task.state.id}`}>
                {renderTask(task, "")}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center">
      {renderTask(tasks[0], tasks.length > 1 ? "-mt-1.5" : "")}

      {tasks.length > 1 ? renderTasks(tasks.slice(1)) : null}
    </div>
  );
};
