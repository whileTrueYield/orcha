import { scheduleItemFormFields } from "../formFields";
import * as yup from "yup";
import { Modal, ModalProps } from "components/modals/Modal";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/fields/Button";
import { ClockIcon, InformationCircleIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { Label } from "components/fields/Label";
import { useEffect, useState } from "react";
import { Ticket, TicketStatus, TicketWorkflowState } from "types/graphql";
import { MyScheduledTicketCombobox } from "components/fields/MyScheduledTicketCombobox";
import { gql, useLazyQuery } from "@apollo/client";
import { QueryReturnValue } from "types/queryTypes";
import { filter, find, sortBy } from "lodash";
import { FormSelectGroup } from "components/fields/Select";
import { FormError } from "components/fields/FieldError";
import { CalendarIcon, XCircleIcon } from "@heroicons/react/solid";
import { addSeconds, format, subDays, subSeconds } from "date-fns";
import { useGetUnfinishedItems } from "components/taskManager/hooks";

const schema = yup
  .object({
    ticketId: scheduleItemFormFields.ticketId,
    ticketWorkflowStateId: scheduleItemFormFields.ticketWorkflowStateId,
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  roleId: number;
  onCreate: (
    startDate: Date,
    stopDate: Date,
    ticketId: number,
    ticketWorkflowStateId: number
  ) => void;
  startedAt: Date;
  stoppedAt: Date;
}

enum SelectedTicketState {
  INVALID,
  VALID,
  TOO_OLD,
  PREVIOUSLY_CLOSED,
}

export const CalendarCreateScheduleItemModal: React.FC<Props> = (props) => {
  // we need two storage, one for the ticket input (ticket) and one for the ticket's details
  // including its optional closing date and workflow states (selectedTicket)
  const [ticket, setTicket] = useState<Ticket>();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>();

  const {
    data: pausedData = { myUnfinishedScheduleItems: [] },
    refetch: refetchPaused,
  } = useGetUnfinishedItems();

  // always re-pull when we trigger the task manager
  useEffect(() => {
    if (props.visible) {
      refetchPaused();
    }
  }, [props.visible, refetchPaused]);

  const [ticketWorkflowStates, setTicketWorkflowStates] = useState<
    TicketWorkflowState[]
  >([]);

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  const { register, setValue, resetField, watch } = formContext;

  const ticketWorkflowStateId = watch("ticketWorkflowStateId");

  useEffect(() => {
    register("ticketId");
  }, [register]);

  const [getTicket] = useLazyQuery<QueryReturnValue["ticket"]>(GET_TICKET, {
    fetchPolicy: "no-cache",
  });

  const onSubmit = (formData: FormSchema) => {
    if (selectedTicketState === SelectedTicketState.VALID) {
      props.onCreate(
        // add a 1 second buffer to the start and stop time to prevent
        // the backend from refusing the record because the time is not
        // strictly outside of other task (> or < and not <= or >= )
        addSeconds(props.startedAt, 1),
        subSeconds(props.stoppedAt, 1),
        formData.ticketId,
        formData.ticketWorkflowStateId
      );
      props.onClose();
    }
  };

  let selectedTicketState: SelectedTicketState = SelectedTicketState.INVALID;
  if (selectedTicket) {
    if (
      selectedTicket.status !== TicketStatus.Scheduled &&
      selectedTicket.closedAt
    ) {
      if (selectedTicket.closedAt < subDays(new Date(), 30).toISOString()) {
        // selectedTicket has been closed more than a month ago
        selectedTicketState = SelectedTicketState.TOO_OLD;
      } else if (selectedTicket.closedAt < props.startedAt.toISOString()) {
        // the new event we want to create is after we've closed the ticket
        selectedTicketState = SelectedTicketState.PREVIOUSLY_CLOSED;
      } else {
        selectedTicketState = SelectedTicketState.VALID;
      }
    } else {
      selectedTicketState = SelectedTicketState.VALID;
    }
  }

  const renderPostTicketSelect = () => {
    switch (selectedTicketState) {
      case SelectedTicketState.INVALID:
        return null;
      case SelectedTicketState.TOO_OLD:
      case SelectedTicketState.PREVIOUSLY_CLOSED:
        return (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  This ticket was closed on{" "}
                  {format(new Date(selectedTicket?.closedAt), "PPP")}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  You cannot add records of work after a ticket's closed date.
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <div>
              <Label className="mb-1" required>
                Workflow State
              </Label>
              <FormSelectGroup
                name="ticketWorkflowStateId"
                disabled={ticketWorkflowStates.length === 0}
              >
                {ticketWorkflowStates.map((tws, index) => (
                  <option
                    disabled={tws.assignee?.id !== props.roleId}
                    key={tws.id}
                    value={tws.id}
                  >
                    {index + 1}. {tws.name}
                    {tws.assignee?.id !== props.roleId
                      ? ` (${tws.assignee?.name})`
                      : ""}
                  </option>
                ))}
              </FormSelectGroup>
            </div>
            {stateChangeWarning()}
          </div>
        );
    }
  };

  const stateChangeWarning = () => {
    const tws = find(ticketWorkflowStates, {
      id: Number(ticketWorkflowStateId),
    });

    if (selectedTicket?.lastScheduleItem) {
      if (
        selectedTicket.lastScheduleItem.stoppedAt <
        props.startedAt.toISOString()
      ) {
        // if the current state is the same && PAUSED, then no warning is needed
        // (nextTicketWorkflowState would mean the assignee is done with work and
        // has recommended a different workflow state... meaning it's not paused)
        if (
          !selectedTicket.lastScheduleItem.nextTicketWorkflowState &&
          selectedTicket.lastScheduleItem.ticketWorkflowState.id === tws?.id
        ) {
          return null;
        }

        return (
          <div className="mt-4 rounded-md bg-sky-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon
                  className="h-5 w-5 text-sky-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-sky-800">
                  Ticket workflow state change
                </h3>
                <div className="mt-2 text-sm text-sky-700">
                  Adding this record of work will update the current state of
                  this ticket from{" "}
                  <strong>
                    {selectedTicket.lastScheduleItem.nextTicketWorkflowState
                      ? selectedTicket.lastScheduleItem.nextTicketWorkflowState
                          .name
                      : selectedTicket.lastScheduleItem.ticketWorkflowState
                          .name}
                  </strong>{" "}
                  to the state <strong>{tws?.name} (PAUSED)</strong>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="mt-4 rounded-md bg-sky-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="h-5 w-5 text-sky-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-sky-800">
                Ticket state change
              </h3>
              <div className="mt-2 text-sm text-sky-700">
                This ticket has not yet been started. Adding this record of work
                will mark the ticket as started on{" "}
                <strong>{tws?.name} (PAUSED)</strong>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const selectTicket = (
    ticket: Ticket,
    then: (suggestedState: TicketWorkflowState | undefined) => void
  ) => {
    setTicketWorkflowStates([]);
    setSelectedTicket(null);
    setTicket(ticket);
    setValue("ticketId", ticket.id, { shouldValidate: true });

    getTicket({
      variables: { id: ticket.id },
      onCompleted: ({ ticket }) => {
        setSelectedTicket(ticket);

        const ticketWorkflowStates = sortBy(
          filter(ticket.ticketWorkflowStates, (tws) => tws.isActive),
          "position"
        );

        setTicketWorkflowStates(ticketWorkflowStates);

        const suggestedState = find(
          ticketWorkflowStates,
          (tws) => tws.assignee?.id === props.roleId
        );

        // to run after we gathered ticket and workflow state infos
        then(suggestedState);
      },
    });
  };

  // we only want to recommend the most recent 2 unfinished tickets
  const unfinished = pausedData.myUnfinishedScheduleItems.slice(0, 2);

  const renderSuggestions = () => (
    <div className="mt-1 text-sm">
      <span>suggestions: </span>
      {unfinished.map((scheduleItem, index) => (
        <span
          role="button"
          className=" text-brand-700 hover:text-brand-600 hover:underline"
          onClick={() => {
            selectTicket(scheduleItem.ticket, () => {
              setValue(
                "ticketWorkflowStateId",
                scheduleItem.ticketWorkflowState.id
              );
              setValue(
                "ticketWorkflowStateId",
                scheduleItem.ticketWorkflowState.id
              );
            });
          }}
        >
          {index > 0 ? ", " : ""}
          <strong className="font-semibold">
            {scheduleItem.ticketWorkflowState.name}
          </strong>{" "}
          on {scheduleItem.ticket.product?.code} {scheduleItem.ticket.localId} -{" "}
          {scheduleItem.ticket.title}
        </span>
      ))}
    </div>
  );
  return (
    <Modal {...props} large initialFocusSelector={"input[role=combobox]"}>
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 sm:mx-0 sm:h-10 sm:w-10">
            <ClockIcon className="h-6 w-6 text-sky-600" aria-hidden="true" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Add Work Record
            </Dialog.Title>

            <div className="mt-2 space-y-4">
              <div>
                <Label className="mb-1" required>
                  Ticket
                </Label>
                <MyScheduledTicketCombobox
                  value={ticket}
                  onChange={(ticket) =>
                    selectTicket(ticket, (suggestedState) => {
                      if (suggestedState) {
                        setValue("ticketWorkflowStateId", suggestedState.id, {
                          shouldValidate: true,
                        });
                      } else {
                        resetField("ticketWorkflowStateId");
                      }
                    })
                  }
                  roleId={props.roleId}
                />
                <FormError className="mt-1" name="ticketId" />
                {unfinished.length > 0 ? renderSuggestions() : null}
              </div>

              {renderPostTicketSelect()}
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button type="submit" btnType="primary" tabIndex={5} fullInMobile>
                <CalendarIcon className="mr-1 -ml-0.5 h-4 w-4" />
                Create Work Record
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={6}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

const GET_TICKET = gql`
  query getTicketForCalendarCreateScheduleItem($id: Int!) {
    ticket(id: $id) {
      id
      localId
      title
      status
      closedAt
      product {
        id
        code
      }
      lastScheduleItem {
        id
        startedAt
        stoppedAt
        ticketWorkflowState {
          id
          name
        }
        nextTicketWorkflowState {
          id
          name
        }
      }
      ticketWorkflowStates {
        id
        position
        isActive
        name
        assignee {
          id
          name
        }
      }
    }
  }
`;
