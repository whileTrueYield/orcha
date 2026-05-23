import React, { useEffect, useState } from "react";
import cn from "classnames";
import { TaskManagerModal } from "./TaskManagerModal";
import { ScheduleItem } from "types/graphql";
import { Link, useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import {
  GET_OPEN_SCHEDULE_ITEMS,
  GET_UNFINISHED_ITEMS,
  useGetOpenItems,
  useGetUnfinishedItems,
  useRefetchOnVisible,
} from "./hooks";
import { CollectionIcon } from "@heroicons/react/outline";
import { GroupTag } from "components/tags/GroupTag";
import { useUrlQuery } from "hooks/useUrlQuery";

interface TaskPlayerProps {
  className?: string;
}

interface NoActiveTaskProps {
  className?: string;
  onDetails: () => void;
}

const NoActiveTask: React.FC<NoActiveTaskProps> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const { onDetails } = props;
  const { data } = useGetUnfinishedItems();

  const items = data?.myUnfinishedScheduleItems;

  if (!items || items.length === 0) {
    return (
      <div className="flex h-12 flex-1 flex-row">
        <button
          onClick={onDetails}
          className="group w-full items-center justify-center rounded-lg bg-brand-600 px-4 text-left text-brand-50 shadow-sm hover:bg-brand-500 hover:text-white focus:outline-none focus:ring sm:w-96"
        >
          <div className="flex min-w-0 items-center justify-between text-base font-medium">
            <span className="mr-2 hidden flex-none sm:block">
              Click here to start
            </span>
            <span className="mr-2 flex-none sm:hidden">Your Tasks</span>
            <span className="text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {navigator.userAgent.match(/MacIntosh/gi) ? "Cmd" : "Ctrl"} L
            </span>
          </div>
        </button>
      </div>
    );
  } else {
    const scheduleItem = items[0];
    const { ticket } = scheduleItem;
    const { isBlocked } = scheduleItem.ticketWorkflowState;

    if (isBlocked) {
      return (
        <div className="flex h-10 flex-1 flex-row sm:h-auto sm:w-84 sm:flex-none md:w-112">
          <Link
            to={urlResolver.ticket.view(orgId, ticket.id)}
            className="flex min-w-0 flex-1 items-center justify-center rounded-lg rounded-r-none border-2 border-red-200 bg-red-50 px-2 py-1 text-left text-red-700 hover:bg-red-100 hover:text-red-900 focus:z-10 focus:outline-none focus:ring sm:justify-start"
            sr-only="Go to task"
          >
            <div className="flex min-w-0 flex-row items-center font-medium sm:space-x-2">
              <div className="flex min-w-0 flex-col space-y-0.5">
                <div className="hidden truncate text-sm sm:block">
                  {ticket.title}
                </div>
                <div className="hidden flex-row items-center space-x-2 sm:flex">
                  <div className="hidden flex-none rounded-md bg-red-600 px-2 py-0.5 text-xs text-red-50 sm:inline">
                    {isBlocked ? "BLOCKED" : "PAUSED"}
                  </div>
                  <GroupTag
                    groupLabel={`${ticket.product?.code}-${ticket.localId}`}
                    groupBgColor="bg-red-300 text-red-900"
                    label={scheduleItem.ticketWorkflowState.name}
                    bgColor="bg-red-200 text-red-900"
                  />
                </div>
                <div className="whitespace-nowrap text-xs sm:hidden">
                  {ticket.product?.code} {ticket.localId}
                </div>
              </div>
            </div>
          </Link>
          <button
            onClick={onDetails}
            className="group relative flex items-center justify-center rounded-lg rounded-l-none border-2 border-l-0 border-red-200 bg-red-50 px-2 text-left text-red-400 hover:bg-red-100 hover:text-red-600 focus:z-10 focus:outline-none focus:ring sm:px-3"
            title="Open Task Switcher"
            id="link_task_manager_btn"
          >
            <span className="sr-only">View Task Selector</span>
            <CollectionIcon className="h-5 w-5 transition-all group-hover:-mt-3" />
            <span className="absolute bottom-1 px-0.5 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100">
              {navigator.userAgent.match(/MacIntosh/gi) ? "Cmd" : "Ctrl"} L
            </span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-10 flex-1 flex-row sm:h-auto sm:w-84 sm:flex-none md:w-112">
        <Link
          to={urlResolver.ticket.view(orgId, ticket.id)}
          className="flex min-w-0 flex-1 items-center justify-center rounded-lg rounded-r-none border-2 border-orange-200 bg-orange-50 px-2 py-1 text-left text-orange-700 hover:bg-orange-100 hover:text-orange-900 focus:z-10 focus:outline-none focus:ring sm:justify-start"
          sr-only="Go to task"
        >
          <div className="flex min-w-0 flex-row items-center font-medium sm:space-x-2">
            {/* <PauseIcon className="hidden flex-none text-orange-400 sm:block sm:h-6 sm:w-6" /> */}
            <div className="flex min-w-0 flex-col space-y-0.5">
              <div className="hidden truncate text-sm sm:block">
                {ticket.title}
              </div>
              <div className="hidden flex-row items-center space-x-2 sm:flex">
                <div className="hidden flex-none rounded-md bg-orange-600 px-2 py-0.5 text-xs text-orange-50 sm:inline">
                  {isBlocked ? "BLOCKED" : "PAUSED"}
                </div>
                <GroupTag
                  groupLabel={`${ticket.product?.code}-${ticket.localId}`}
                  groupBgColor="bg-orange-300 text-orange-900"
                  label={scheduleItem.ticketWorkflowState.name}
                  bgColor="bg-orange-200 text-orange-900"
                />
              </div>
              <div className="whitespace-nowrap text-xs sm:hidden">
                {ticket.product?.code} {ticket.localId}
              </div>
            </div>
          </div>
        </Link>
        {/* <button
          id="resume_task_manager_btn"
          onClick={() =>
            onResume(ticket.id, scheduleItem.ticketWorkflowState.id)
          }
          className="hidden shrink-0 items-center justify-center rounded-lg rounded-l-none rounded-r-none border-2 border-l-0 border-orange-200 bg-orange-50 px-2 text-left text-orange-400 hover:bg-orange-100 hover:text-orange-600 focus:z-10 focus:outline-none focus:ring sm:flex sm:px-3"
        >
          <span className="sr-only">Resume Task</span>
          <PlayIcon className="h-6 w-6" />
        </button> */}
        <button
          onClick={onDetails}
          className="group relative flex items-center justify-center rounded-lg rounded-l-none border-2 border-l-0 border-orange-200 bg-orange-50 px-2 text-left text-orange-400 hover:bg-orange-100 hover:text-orange-600 focus:z-10 focus:outline-none focus:ring sm:px-3"
          title="Open Task Switcher"
          id="link_task_manager_btn"
        >
          <span className="sr-only">View Task Selector</span>
          <CollectionIcon className="h-5 w-5 transition-all group-hover:-mt-3" />
          <span className="absolute bottom-1 px-0.5 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100">
            {navigator.userAgent.match(/MacIntosh/gi) ? "Cmd" : "Ctrl"} L
          </span>
        </button>
      </div>
    );
  }
};

export const TaskPlayer: React.FC<TaskPlayerProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { orgId } = useParams<{ orgId: string }>();
  // const [startTask] = useStartTask();
  // const [stopTask] = useStopTask();
  const history = useHistory();

  const urlSearchParams = useUrlQuery();
  const urlAutoTrigger = urlSearchParams.get("type");

  // this displays the task manager when clicking on the
  // email link
  useEffect(() => {
    if (urlAutoTrigger === "task_manager") {
      setIsOpen(true);
      history.replace(urlResolver.dashboard.home(orgId));
    }
  }, [urlAutoTrigger, setIsOpen, history, orgId]);

  useRefetchOnVisible([GET_UNFINISHED_ITEMS, GET_OPEN_SCHEDULE_ITEMS]);

  // const onStartClick = (ticketId: number, ticketWorkflowStateId: number) => {
  //   startTask({
  //     variables: {
  //       input: {
  //         ticketId: ticketId,
  //         ticketWorkflowStateId: ticketWorkflowStateId,
  //       },
  //     },
  //   });
  // };

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyUp);
    };
  }, [setIsOpen]);

  const { data } = useGetOpenItems();

  const items = data?.myOpenScheduleItems || [];
  const isActive = items.length > 0;

  const renderTaskDetail = (scheduleItem: ScheduleItem) => {
    const { ticket } = scheduleItem;

    return (
      <div className="flex min-w-0 flex-1 flex-row sm:w-84 sm:flex-none md:w-112">
        <Link
          to={urlResolver.ticket.view(orgId, ticket.id)}
          className="group min-w-0 flex-1 items-center justify-center rounded-lg rounded-r-none border-2 border-r-0 border-brand-200 bg-brand-100 px-2 py-1 text-left text-brand-700 transition hover:bg-brand-200 hover:text-brand-800 focus:z-10 focus:outline-none focus:ring"
          sr-only="Go to task"
        >
          <div className="flex min-w-0 flex-row items-center font-medium">
            {/* <SecondCounterIcon className="mr-2 hidden h-4 w-4 flex-none text-brand-400 sm:block sm:h-7 sm:w-7" /> */}
            <div className="flex min-w-0 flex-col">
              <div className="hidden truncate text-sm sm:block">
                {ticket.title}
              </div>
              <div className="hidden flex-row space-x-2 sm:flex">
                <div className="hidden flex-none rounded-md bg-sky-600 px-2 py-0.5 text-xs text-sky-50 sm:inline">
                  ACTIVE
                </div>
                <GroupTag
                  groupLabel={`${ticket.product?.code}-${ticket.localId}`}
                  groupBgColor="bg-brand-300 text-brand-900"
                  label={scheduleItem.ticketWorkflowState.name}
                  bgColor="bg-brand-200 text-brand-900"
                />
              </div>
              <div className="truncate text-sm sm:hidden">
                {ticket.product?.code} {ticket.localId}
              </div>
            </div>
          </div>
        </Link>
        {/* <button
          onClick={() =>
            stopTask({
              variables: { scheduleItemId: scheduleItem.id, input: {} },
            })
          }
          className="border-l-1 flex items-center justify-center border-2 border-r-0 border-brand-200 bg-brand-100 px-2 text-xs text-brand-400 transition hover:bg-brand-200 hover:text-brand-600 focus:z-10 focus:outline-none focus:ring sm:px-3"
        >
          <span className="sr-only">Pause Task</span>
          <PauseIcon className="h-6 w-6" />
        </button> */}
        <button
          onClick={() => setIsOpen(true)}
          className="border-l-1 group relative flex items-center justify-center rounded-lg rounded-l-none border-2 border-brand-200 bg-brand-100 px-2 text-xs text-brand-400 transition hover:bg-brand-200 hover:text-brand-600 focus:z-10 focus:outline-none focus:ring sm:px-3"
        >
          <span className="sr-only">View Task Selector</span>
          <CollectionIcon className="h-5 w-5 transition-all group-hover:-mt-3" />
          <span className="absolute bottom-1 px-0.5 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100">
            {navigator.userAgent.match(/MacIntosh/gi) ? "Cmd" : "Ctrl"} L
          </span>
        </button>
      </div>
    );
  };

  const containerClass = cn(
    "ml-2 sm:px-2 md:ml-6 h-full flex-1 min-w-0 flex flex-row items-center",
    props.className
  );

  return (
    <>
      <TaskManagerModal visible={isOpen} onClose={() => setIsOpen(false)} />
      <div className={containerClass}>
        {isActive ? (
          renderTaskDetail(items[0])
        ) : (
          <NoActiveTask onDetails={() => setIsOpen(true)} />
        )}
      </div>
    </>
  );
};
