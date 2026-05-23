import { Dialog } from "@headlessui/react";
import { PauseIcon, PlayIcon, TicketIcon } from "@heroicons/react/outline";
import { Button } from "components/fields/Button";
import { ModalProps, Modal } from "components/modals/Modal";
import {
  useGetUnfinishedItems,
  useGetUpcomingTickets,
  useStartTask,
} from "components/taskManager/hooks";
import { RenderNextTicket } from "components/taskManager/RenderNextTicket";
import { RenderScheduleItem } from "components/taskManager/RenderScheduleItem";
import { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";

interface ResumeWorkModalModalProps extends ModalProps {}

export const ResumeWorkModal: React.FC<ResumeWorkModalModalProps> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();
  const {
    data: pausedData = { myUnfinishedScheduleItems: [] },
    refetch: refetchPaused,
  } = useGetUnfinishedItems();

  const { data: nextData = { myNextTickets: [] }, refetch: refetchNext } =
    useGetUpcomingTickets();

  const [startTaskHook] = useStartTask(() => props.onClose());

  // always re-pull when we trigger the task manager
  useEffect(() => {
    if (props.visible) {
      refetchPaused();
      refetchNext();
    }
  }, [props.visible, refetchPaused, refetchNext]);

  const startTask = (ticketId: number, ticketWorkflowStateId: number) => {
    startTaskHook({
      variables: {
        input: {
          ticketId,
          ticketWorkflowStateId,
        },
      },
    });
  };

  const navToTicket = (ticketId: number) => {
    history.push(urlResolver.ticket.view(orgId, ticketId));
    props.onClose();
  };

  if (pausedData.myUnfinishedScheduleItems.length) {
    const ticket = pausedData.myUnfinishedScheduleItems[0].ticket;
    const ticketWorkflowState =
      pausedData.myUnfinishedScheduleItems[0].ticketWorkflowState;

    return (
      <Modal {...props} large dark>
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-700 sm:mx-0 sm:h-10 sm:w-10">
            <PauseIcon className="h-6 w-6 text-yellow-300" />
          </div>
          <div className="mt-3 min-w-0 flex-1 sm:mt-0 sm:ml-4">
            <Dialog.Title
              as="h3"
              className="text-center text-lg font-medium leading-6 text-gray-200 sm:mr-6 sm:text-left"
            >
              Resume unfinished ticket
            </Dialog.Title>

            <div className="mt-4 text-sm text-gray-400">
              This is a friendly reminder to resume {ticketWorkflowState.name}{" "}
              work on your last unfinished task.
            </div>

            <div
              className="mt-4 cursor-pointer"
              onClick={() => navToTicket(ticket.id)}
            >
              <RenderScheduleItem
                scheduleItem={pausedData.myUnfinishedScheduleItems[0]}
                isActive={false}
              />
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                fullInMobile
                type="button"
                btnType="primary"
                tabIndex={4}
                onClick={() => startTask(ticket.id, ticketWorkflowState.id)}
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Resume
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                btnType="secondaryWhite"
                tabIndex={5}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  if (nextData.myNextTickets.length) {
    const ticket = nextData.myNextTickets[0].ticket;
    const ticketWorkflowState = nextData.myNextTickets[0].nextState;

    return (
      <Modal {...props} large dark>
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-700 sm:mx-0 sm:h-10 sm:w-10">
            <TicketIcon className="h-6 w-6 -rotate-45 text-brand-300" />
          </div>
          <div className="mt-3sm:mt-0 flex-1 sm:ml-4">
            <Dialog.Title
              as="h3"
              className="text-center text-lg font-medium leading-6 text-gray-200 sm:mr-6 sm:text-left"
            >
              Start on the next ticket
            </Dialog.Title>

            <div className="mt-4 text-sm text-gray-400">
              We suggest you start working on {ticketWorkflowState.name} on the
              following ticket.
            </div>

            <div
              className="mt-4 cursor-pointer"
              onClick={() => navToTicket(ticket.id)}
            >
              <RenderNextTicket
                nextTicket={nextData.myNextTickets[0]}
                isActive={false}
              />
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                fullInMobile
                type="button"
                btnType="primary"
                tabIndex={4}
                onClick={() => startTask(ticket.id, ticketWorkflowState.id)}
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Start
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                btnType="secondaryWhite"
                tabIndex={5}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
};
