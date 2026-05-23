import { gql } from "@apollo/client";
import { Dialog } from "@headlessui/react";
import { TicketIcon } from "@heroicons/react/outline";
import { Countdown } from "components/Countdown";
import { Button } from "components/fields/Button";
import { ModalProps, Modal } from "components/modals/Modal";
import { useLazyGetOpenItems } from "components/taskManager/hooks";
import { useEffect } from "react";
import { ScheduleItem } from "types/graphql";
import { useBlockingMutation } from "utils/graphql";

export const StillWorkingModal: React.FC<ModalProps> = (props) => {
  const { visible } = props;

  const [resumeLastTask] = useBlockingMutation<{
    resumeLastScheduleItem: ScheduleItem;
  }>(RESUME_LAST_SCHEDULE_ITEM_MUTATION, {
    onCompleted: () => {
      getOpenItems();
      props.onClose();
    },
  });

  // This is to force a refresh of the task player when the modal
  // appear and if the user decides to resume work
  const [getOpenItems] = useLazyGetOpenItems();

  useEffect(() => {
    if (visible) {
      getOpenItems();
    }
  }, [visible, getOpenItems]);

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
            Are you still working?
          </Dialog.Title>

          <div className="mt-4 text-sm leading-6 text-gray-300">
            You could be burning the midnight oil but in case you've just forgot
            to clock-out we did it for you. If you're still hard at work, you
            can correct our mistake here.
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              fullInMobile
              type="button"
              btnType="primary"
              tabIndex={4}
              onClick={() => resumeLastTask()}
            >
              Yes, I'm still working
              <Countdown
                duration={120000}
                onTimeout={props.onClose}
                className="ml-2 inline-block w-7"
              />
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
};

const RESUME_LAST_SCHEDULE_ITEM_MUTATION = gql`
  mutation ResumeLastScheduleItem {
    resumeLastScheduleItem {
      id
      ticketId
      startedAt
      stoppedAt
      autoStopped
    }
  }
`;
