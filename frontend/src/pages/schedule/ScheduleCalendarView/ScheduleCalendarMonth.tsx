import { gql } from "@apollo/client";
import { Button } from "components/fields/Button";
import { TicketIdTag } from "components/tags/TicketIdTag";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  endOfDay,
} from "date-fns";
import { filter, map } from "lodash";
import { useRef, useState } from "react";
import { FCWithFragments } from "types";
import { PlanningTicket, TicketStatus } from "types/graphql";
import { useOutsideClick } from "hooks/useOutsideClick";
import { Popover } from "components/Popover/Popover";
import cn from "classnames";

function classNames(...classes: (null | undefined | string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  deliveredTickets: PlanningTicket[];
  tickets: PlanningTicket[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onViewTicket: (ticketId: number) => void;
}

export const ScheduleCalendarMonth: FCWithFragments<Props> = (props) => {
  const { currentDate, tickets, deliveredTickets } = props;

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const today = new Date();

  const firstWeek = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(startOfMonth(currentDate)),
  });

  const renderEventsForDay = (date: Date) => {
    const start = startOfDay(date).toISOString();
    const end = endOfDay(date).toISOString();

    const dayFutureTickets = filter(tickets, (ticket) => {
      return ticket.eta > start && ticket.eta < end;
    });

    const dayDeliveredTickets = filter(deliveredTickets, (ticket) => {
      return ticket.eta > start && ticket.eta < end;
    });

    const dayTickets = [...dayDeliveredTickets, ...dayFutureTickets];

    if (dayTickets.length) {
      return (
        <ScheduleDayEvent
          dayTickets={dayTickets}
          onViewTicket={props.onViewTicket}
        />
      );
    }
  };

  const renderMiniEventsForDay = (date: Date) => {
    const start = startOfDay(date).toISOString();
    const end = endOfDay(date).toISOString();

    const dayFutureTickets = filter(tickets, (ticket) => {
      return ticket.eta > start && ticket.eta < end;
    });

    const dayDeliveredTickets = filter(deliveredTickets, (ticket) => {
      return ticket.eta > start && ticket.eta < end;
    });

    const dayTickets = [...dayDeliveredTickets, ...dayFutureTickets];

    if (dayTickets.length) {
      <span className="sr-only">{dayTickets.length} tickets</span>;
      return (
        <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
          {dayTickets.map((ticket) => (
            <span
              key={ticket.id}
              className={cn("mx-0.5 mb-1 h-1.5 w-1.5 rounded-full", {
                "bg-sky-400":
                  !ticket.status || ticket.status === TicketStatus.Scheduled,
                "bg-red-400": ticket.status === TicketStatus.Cancelled,
                "bg-green-400": ticket.status === TicketStatus.Done,
              })}
            />
          ))}
        </span>
      );
    }
  };

  const start = startOfDay(currentDate).toISOString();
  const end = endOfDay(currentDate).toISOString();

  const selectedDayTickets = filter(
    [...tickets, ...deliveredTickets],
    (ticket) => ticket.eta > start && ticket.eta < end,
  );

  return (
    <>
      <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
          {map(firstWeek, (day) => (
            <div className="bg-white py-2" key={day.toString()}>
              <span className="not-sr-only hidden sm:block">
                {format(day, "E")}
              </span>
              <span className="not-sr-only sm:hidden">
                {format(day, "EEEEE")}
              </span>
              <span className="sr-only">{format(day, "EEEE")}</span>
            </div>
          ))}
        </div>
        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
          <div className="hidden w-full lg:grid lg:grid-cols-7 lg:gap-px">
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={classNames(
                  day.getMonth() === currentDate.getMonth()
                    ? "bg-white"
                    : "bg-gray-50 text-gray-500",
                  "relative min-h-[7.5rem] py-2 px-3",
                )}
              >
                <time
                  dateTime={day.toString()}
                  className={
                    isSameDay(day, today)
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 font-semibold text-white"
                      : undefined
                  }
                >
                  {format(day, "d")}
                </time>
                {renderEventsForDay(day)}
              </div>
            ))}
          </div>
          <div className="isolate grid w-full grid-cols-7 gap-px lg:hidden">
            {days.map((day) => (
              <button
                onClick={() => props.setCurrentDate(day)}
                key={day.toString()}
                type="button"
                className={classNames(
                  day.getMonth() === currentDate.getMonth()
                    ? "bg-white"
                    : "bg-gray-50",
                  (isSameDay(day, currentDate) || isSameDay(day, today)) &&
                    "font-semibold",
                  isSameDay(day, currentDate) && "text-white",
                  !isSameDay(day, currentDate) &&
                    isSameDay(day, today) &&
                    "text-brand-600",
                  !isSameDay(day, currentDate) &&
                    isSameMonth(day, currentDate) &&
                    !isSameDay(day, today) &&
                    "text-gray-900",
                  !isSameDay(day, currentDate) &&
                    !isSameMonth(day, currentDate) &&
                    !isSameDay(day, today) &&
                    "text-gray-500",
                  "flex h-14 flex-col py-2 px-3 hover:bg-gray-100 focus:z-10",
                )}
              >
                <time
                  dateTime={day.toString()}
                  className={classNames(
                    isSameDay(day, currentDate) &&
                      "flex h-6 w-6 items-center justify-center rounded-full",
                    isSameDay(day, currentDate) &&
                      isSameDay(day, today) &&
                      "bg-brand-600",
                    isSameDay(day, currentDate) &&
                      !isSameDay(day, today) &&
                      "bg-gray-900",
                    "ml-auto",
                  )}
                >
                  {format(day, "d")}
                </time>
                {renderMiniEventsForDay(day)}
              </button>
            ))}
          </div>
        </div>
      </div>
      {selectedDayTickets.length ? (
        <div className="py-10 px-4 sm:px-6 lg:hidden">
          <ol className="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm shadow ring-1 ring-black ring-opacity-5">
            {selectedDayTickets.map((ticket) => (
              <li
                key={ticket.id}
                className="group flex space-x-2 p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
              >
                <div className="flex flex-auto flex-col space-y-1">
                  <div>
                    <TicketIdTag
                      productCode={ticket.productCode}
                      localId={ticket.localId}
                      milestone={ticket.milestone}
                      className="mr-1 text-xs"
                      status={ticket.status}
                    />

                    <span className="font-semibold text-gray-800">
                      {ticket.title}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    <span className="font-medium">{ticket.workflowName}</span>{" "}
                    on {ticket.productName}
                  </p>
                </div>
                <Button
                  type="button"
                  btnType="white"
                  onClick={() => props.onViewTicket(ticket.id)}
                  className="md:hidden md:group-hover:block"
                >
                  View<span className="sr-only">, {ticket.title}</span>
                </Button>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="p-6 py-10 px-4 sm:px-6 lg:hidden">
          <div className="flex h-20 items-center justify-center rounded-lg bg-gray-200 text-sm font-medium text-gray-500">
            No Projected Deliveries
          </div>
        </div>
      )}
    </>
  );
};

ScheduleCalendarMonth.fragments = {
  ScheduleCalendarMonthFragment: gql`
    fragment ScheduleCalendarMonthFragment on PlanningTicket {
      id
      title
      status
      productCode
      productName
      localId
      eta
      milestone
      workflowName
    }
  `,
};

interface ScheduleDayEventProps {
  dayTickets: PlanningTicket[];
  onViewTicket: (ticketId: number) => void;
}

const ScheduleDayEvent: React.FC<ScheduleDayEventProps> = (props) => {
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);
  const { dayTickets } = props;
  const [isVisible, setVisible] = useState(false);
  const wrapperRef = useRef(null);
  const otherTicketsRef = useRef(null);

  useOutsideClick(otherTicketsRef, () => setVisible(false));

  return (
    <ol>
      {dayTickets.slice(0, 3).map((ticket) => (
        <li key={ticket.id}>
          <button
            type="button"
            onClick={() => props.onViewTicket(ticket.id)}
            className="group flex max-w-full items-center"
            title={ticket.title}
          >
            <p className="flex-auto truncate font-medium text-gray-700 group-hover:text-brand-700">
              {ticket.title}
            </p>
            <TicketIdTag
              milestone={ticket.milestone}
              className="ml-1 hidden text-xs xl:inline-block"
              localId={ticket.localId}
              productCode={ticket.productCode}
              status={ticket.status}
            />
          </button>
        </li>
      ))}

      {dayTickets.length > 3 && (
        <li ref={wrapperRef}>
          <div
            ref={setReferenceElement}
            onClick={() => setVisible(true)}
            className="inline-block cursor-pointer text-gray-500 hover:text-brand-600 hover:underline"
          >
            + {dayTickets.length - 3} more
            {referenceElement && isVisible && (
              <Popover
                referenceElement={referenceElement}
                className="z-10 max-w-xs"
              >
                <div
                  ref={otherTicketsRef}
                  className="max-w-64 max-h-64 overflow-y-auto rounded-lg bg-gray-700 py-2 px-4 text-sm font-medium text-gray-100 shadow"
                >
                  <OtherTickets
                    tickets={dayTickets}
                    onViewTicket={props.onViewTicket}
                  />
                </div>
              </Popover>
            )}
          </div>
        </li>
      )}
    </ol>
  );
};

interface PopProps {
  tickets: PlanningTicket[];
  onViewTicket: (ticketId: number) => void;
}

const OtherTickets: React.FC<PopProps> = (props) => {
  const { tickets } = props;

  return (
    <ol className="space-y-2">
      {tickets.slice(3).map((ticket) => (
        <li key={ticket.id}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              props.onViewTicket(ticket.id);
            }}
            className="group flex max-w-full items-center"
            title={ticket.title}
          >
            <p className="flex-auto truncate font-medium text-gray-200 group-hover:text-white">
              {ticket.title}
            </p>
            <TicketIdTag
              milestone={ticket.milestone}
              className="ml-1 hidden text-xs xl:inline-block"
              localId={ticket.localId}
              productCode={ticket.productCode}
            />
          </button>
        </li>
      ))}
    </ol>
  );
};
