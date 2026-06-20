import { ModalProps } from "components/modals/Modal";
import React, {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import { NextTicket, ScheduleItem } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { RenderScheduleItem } from "./RenderScheduleItem";
import {
  useGetOpenItems,
  useGetUnfinishedItems,
  useGetUpcomingTickets,
} from "./hooks";
import { Dialog, Transition } from "@headlessui/react";
import { RenderNextTicket } from "./RenderNextTicket";
import { RenderActiveScheduleItem } from "./RenderActiveScheduleItem";
import cn from "classnames";
import { XIcon } from "@heroicons/react/solid";
import { PopoverTips } from "components/help/HelpBlock";

interface TaskManagerModalInterface extends ModalProps {}

interface TaskManagerItem {
  item: any;
  onClick: (item: any) => void;
  render: (item: any, isActive: boolean) => ReactNode;
  label?: string;
}

export const TaskManagerModal: React.FC<TaskManagerModalInterface> = (
  props
) => {
  const { orgId } = useParams<{ orgId: string }>();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const history = useHistory();

  // build initial list of items
  const { data: openData = { myOpenScheduleItems: [] }, refetch: refetchOpen } =
    useGetOpenItems();
  const {
    data: pausedData = { myUnfinishedScheduleItems: [] },
    refetch: refetchPaused,
  } = useGetUnfinishedItems();
  const { data: nextData = { myNextTickets: [] }, refetch: refetchNext } =
    useGetUpcomingTickets();

  // always re-pull when we trigger the task manager
  useEffect(() => {
    if (props.visible) {
      refetchOpen();
      refetchPaused();
      refetchNext();
    }
  }, [props.visible, refetchOpen, refetchPaused, refetchNext]);

  // By default, dialog will close when clicking the backdrop
  // or pressing ESC. We want the ESC behavior but not the
  // backdrop click. So we'll manually handle the ESC key press
  // and disable the built in close feature in the <Dialog /> element
  const { onClose } = props;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const defaultSet: TaskManagerItem[] = useMemo(() => {
    const openItems: TaskManagerItem[] = [];

    for (const item of openData.myOpenScheduleItems) {
      openItems.push({
        item,
        onClick: (scheduleItem: ScheduleItem) => {
          history.push(urlResolver.ticket.view(orgId, scheduleItem.ticket.id));
          props.onClose();
        },
        render: (scheduleItem, isActive) => (
          <RenderActiveScheduleItem
            scheduleItem={scheduleItem}
            isActive={isActive}
          />
        ),
      });
      openItems[0].label = "Active Task";
    }

    const pausedItems: TaskManagerItem[] = [];
    for (const item of pausedData.myUnfinishedScheduleItems) {
      pausedItems.push({
        item,
        onClick: (scheduleItem: ScheduleItem) => {
          history.push(urlResolver.ticket.view(orgId, scheduleItem.ticket.id));
          props.onClose();
        },
        render: (scheduleItem, isActive) => (
          <RenderScheduleItem
            isBlocked={item.ticketWorkflowState.isBlocked}
            scheduleItem={scheduleItem}
            isActive={isActive}
          />
        ),
      });
    }

    if (pausedItems.length > 0) {
      pausedItems[0].label = "Unfinished Tasks";
    }

    const nextItems: TaskManagerItem[] = [];
    for (const item of nextData.myNextTickets) {
      nextItems.push({
        item,
        onClick: (nextTicket: NextTicket) => {
          history.push(urlResolver.ticket.view(orgId, nextTicket.ticket.id));
          props.onClose();
        },
        render: (nextTicket, isActive) => (
          <RenderNextTicket
            nextTicket={nextTicket}
            isActive={isActive}
            isRecommended={item === nextData.myNextTickets[0]}
          />
        ),
      });
    }

    if (nextItems.length > 0) {
      nextItems[0].label = "Start a task";
    }

    return [...openItems, ...pausedItems, ...nextItems];
  }, [nextData, pausedData, openData, history, props, orgId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeSet = defaultSet;

      if (event.code === "ArrowUp" && activeIndex > 0) {
        setActiveIndex(Math.max(activeIndex - 1, 0));
      } else if (event.code === "ArrowDown") {
        setActiveIndex(Math.min(activeIndex + 1, activeSet.length - 1));
        event.preventDefault();
      } else if (event.code === "PageDown") {
        setActiveIndex(Math.min(activeIndex + 5, activeSet.length - 1));
      } else if (event.code === "PageUp") {
        setActiveIndex(Math.max(activeIndex - 5, 0));
      } else if (event.code === "Enter" || event.code === "NumpadEnter") {
        activeSet[activeIndex].onClick(activeSet[activeIndex].item);
        event.preventDefault();
      }
    };

    if (props.visible) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [props.visible, setActiveIndex, activeIndex, defaultSet]);

  const renderActiveSet = () => {
    const activeSet = defaultSet;

    if (activeSet && activeSet.length) {
      return activeSet.map((row, index) => {
        if (row.label) {
          return (
            <Fragment key={index}>
              <div className="pt-4 text-lg font-medium text-gray-200">
                {row.label}
              </div>
              <TaskButton
                row={row}
                index={index}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            </Fragment>
          );
        } else {
          return (
            <TaskButton
              key={index}
              row={row}
              index={index}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          );
        }
      });
    } else {
      return (
        <div className="p-6 text-center text-lg text-gray-400">No Tickets</div>
      );
    }
  };

  return (
    <Transition
      as="div"
      show={props.visible}
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
    >
      <Dialog
        open={props.visible}
        onClose={() => null}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" />
        <div className="flex min-h-screen items-end justify-center px-2 pb-20 pt-4 text-center sm:items-center sm:px-0">
          <div className="relative inline-block w-full transform rounded-3xl bg-gray-900 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-xl sm:align-middle">
            <button
              type="button"
              onClick={props.onClose}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-100 transition hover:bg-gray-700 hover:text-white"
            >
              <XIcon className="h-6 w-6" />
            </button>
            <div className="mt-4 space-y-2 px-4" id="task-container-list">
              <h1 className="text-center text-xl font-semibold text-white">
                Task Switcher
                <PopoverTips
                  title="Task Switcher"
                  light
                  className="relative top-1 inline-block px-1"
                >
                  <p>
                    The Task Switcher only lists tickets you can work on right
                    now.
                  </p>
                  <p>
                    Tickets listed in the Task Switcher are part of the schedule
                    of your organization and are assigned to you.
                  </p>
                  <p>
                    Tickets are listed in their recommended execution order.
                    Your current active ticket appears first, followed by any
                    unfinished tickets then ready to start ones.
                  </p>
                </PopoverTips>
              </h1>

              {renderActiveSet()}
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface TaskButtonProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  index: number;
  row: TaskManagerItem;
}

const TaskButton: React.FC<TaskButtonProps> = (props) => {
  const { activeIndex, setActiveIndex, index, row } = props;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isActive = index === activeIndex;
  const buttonClassName = cn("w-full focus:outline-none rounded-lg", {
    "ring ring-brand-500 ring-offset-1 ring-offset-gray-900 bg-gray-900":
      isActive,
  });

  useEffect(() => {
    if (index === activeIndex && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [index, activeIndex, buttonRef]);

  return (
    <button
      ref={buttonRef}
      key={index}
      onFocus={() => (!isActive ? setActiveIndex(index) : null)}
      className={buttonClassName}
      onClick={() => row.onClick(row.item)}
    >
      {row.render(row.item, isActive)}
    </button>
  );
};
