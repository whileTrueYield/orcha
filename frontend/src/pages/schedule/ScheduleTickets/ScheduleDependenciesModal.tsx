import { gql } from "@apollo/client";
import { Dialog } from "@headlessui/react";
import { ExclamationCircleIcon, PlusIcon } from "@heroicons/react/outline";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { showTicketEditModal } from "actions";
import { Modal, ModalProps } from "components/modals/Modal";
import { every, filter, partition } from "lodash";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import { useState } from "react";
import { useAppDispatch } from "store";
import { FCWithFragments } from "types";
import { Ticket } from "types/graphql";
import { plural } from "utils/string";
import cn from "classnames";
import { Button } from "components/fields/Button";

interface Props extends ModalProps {
  dependencies: Ticket[];
  onAddDependencies: (tickets: Ticket[]) => void;
}

export const ScheduleDependenciesModal: FCWithFragments<Props> = (props) => {
  const dispatch = useAppDispatch();
  const [showNotReady, setShowNotReady] = useState(true);

  const [readyToScheduleTickets, notReadyToScheduleTickets] = partition(
    props.dependencies,
    (ticket) => {
      const isReady = every(
        filter(ticket.ticketWorkflowStates, { isActive: true }),
        (tws) =>
          Boolean(
            tws.estimateMaximum && tws.estimateMinimum && tws.estimateMostLikely
          )
      );

      const hasAssignees = every(
        filter(ticket.ticketWorkflowStates, { isActive: true }),
        (tws) => Boolean(tws.assigneeId)
      );

      return hasAssignees && isReady;
    }
  );

  const renderTicketList = (tickets: Ticket[]) => {
    return tickets.map((ticket) => (
      <li key={ticket.id}>
        <TicketCard
          onClick={() => dispatch(showTicketEditModal(ticket.id))}
          ticket={ticket}
          className="cursor-pointer hover:bg-gray-50"
        />
      </li>
    ));
  };

  const renderNotReadyToSchedule = () => {
    return (
      <>
        <div className="mt-4 mb-1 flex flex-row items-center justify-between">
          <button
            onClick={() => setShowNotReady(!showNotReady)}
            className="flex flex-row items-center font-medium text-gray-700"
          >
            <ChevronRightIcon
              className={cn("mr-1 h-5 w-5 text-gray-600 transition", {
                "rotate-90": showNotReady,
              })}
            />
            <span>Not Ready to Schedule</span>
          </button>
          <span className="text-sm text-gray-600">
            {plural("{} ticket", "{} tickets", notReadyToScheduleTickets)}
          </span>
        </div>

        <ul
          className={cn("space-y-2 overflow-y-auto transition-all", {
            "max-h-56": showNotReady,
            "max-h-0": !showNotReady,
          })}
        >
          {renderTicketList(notReadyToScheduleTickets)}
        </ul>
      </>
    );
  };

  return (
    <Modal {...props}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
          <ExclamationCircleIcon className="h-6 w-6 text-brand-600" />
        </div>

        <div className="mt-3 flex-1 sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-center text-lg font-medium leading-6 text-gray-900 sm:mr-6 sm:text-left"
          >
            Unscheduled Dependencies
          </Dialog.Title>
          <div className="mt-2">
            <p className="hidden text-sm leading-5 text-gray-500 sm:block">
              We have detected that your planned schedule is missing
              {plural(
                " {} unscheduled dependency.",
                " {} unscheduled dependencies.",
                props.dependencies
              )}
            </p>
          </div>

          {readyToScheduleTickets.length > 0 && (
            <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto transition-all">
              {renderTicketList(readyToScheduleTickets)}
            </ul>
          )}

          {notReadyToScheduleTickets.length > 0 && renderNotReadyToSchedule()}

          <div className="mt-5 sm:flex sm:flex-row-reverse">
            <Button
              fullInMobile
              type="button"
              btnType="primary"
              tabIndex={4}
              className="sm:ml-3"
              disabled={readyToScheduleTickets.length === 0}
              onClick={() => props.onAddDependencies(readyToScheduleTickets)}
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              Add{" "}
              {plural(
                "{} ready dependency",
                "{} ready dependencies",
                readyToScheduleTickets
              )}
            </Button>
            <Button
              onClick={props.onClose}
              type="button"
              btnType="secondaryWhite"
              tabIndex={5}
              fullInMobile
              className="mt-3 sm:mt-0"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

ScheduleDependenciesModal.fragments = {
  ScheduleDependenciesModalFragment: gql`
    fragment ScheduleDependenciesModalFragment on Ticket {
      id
      ...TicketCardFragment
    }
    ${TicketCard.fragments.TicketCardFragment}
  `,
};
