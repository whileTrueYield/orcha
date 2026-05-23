import { gql, useMutation } from "@apollo/client";
import { Dialog } from "@headlessui/react";
import { DocumentIcon } from "@heroicons/react/outline";
import { createNotification } from "actions";
import { Button } from "components/fields/Button";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { Radio } from "components/fields/Radio";
import { RoleSelect } from "components/fields/RoleSelect";
import { Textarea } from "components/fields/Textarea";
import { Modal, ModalProps } from "components/modals/Modal";
import { some } from "lodash";
import { useState } from "react";
import { useAppDispatch } from "store";
import {
  BatchUpdateTicketAction,
  MiniProject,
  MiniRole,
  MutationBatchUpdateTicketsArgs,
} from "types/graphql";
import { MutationReturnValue } from "types/queryTypes";
import { onGraphQLError } from "utils/GQLClient";
import { plural } from "utils/string";

interface Props extends ModalProps {
  ticketIds: number[];
}

interface BatchOperation {
  owner: MiniRole | null;
  project: MiniProject | null;
  action: BatchUpdateTicketAction;
  actionMessage: string;
}

const initialOperation: BatchOperation = {
  owner: null,
  project: null,
  action: BatchUpdateTicketAction.ChangeOwner,
  actionMessage: "",
};

export const TicketBatchEditTicketsModal: React.FC<Props> = (props) => {
  const { ticketIds } = props;
  const dispatch = useAppDispatch();
  const [operations, setOperations] =
    useState<BatchOperation>(initialOperation);

  const haveChanges = some([
    // This trick allow us to make sure the status message is present for
    // Cancelled and Done but not necessary fo the other actions
    operations.action === BatchUpdateTicketAction.CancelTickets &&
      operations.actionMessage,
    operations.action === BatchUpdateTicketAction.MarkTicketsAsDone &&
      operations.actionMessage,
    operations.action === BatchUpdateTicketAction.ChangeOwner &&
      operations.owner,
    operations.action === BatchUpdateTicketAction.ChangeProject &&
      operations.project,
    operations.action === BatchUpdateTicketAction.ArchiveTickets,
    operations.action === BatchUpdateTicketAction.UnarchiveTickets,
    operations.action === BatchUpdateTicketAction.UnscheduleTickets,
    operations.action === BatchUpdateTicketAction.ScheduleTickets,
    operations.action === BatchUpdateTicketAction.RequestEstimate,
    operations.action === BatchUpdateTicketAction.CancelRequestEstimate,
  ]);

  const [batchUpdateTickets] = useMutation<
    MutationReturnValue["batchUpdateTickets"],
    MutationBatchUpdateTicketsArgs
  >(UPDATE_BATCH_TICKETS, {
    refetchQueries: ["GetTicketsForProject", "GetTicketsForSearch"],
  });

  const applyChanges = () => {
    batchUpdateTickets({
      variables: {
        ticketIds,
        input: {
          action: operations.action,
          ownerId: operations.owner?.id,
          projectId: operations.project?.id,
          actionMessage: operations.actionMessage,
        },
      },
      onCompleted: ({ batchUpdateTickets }) => {
        const count = batchUpdateTickets.count;
        if (count === 0) {
          dispatch(
            createNotification({
              type: "Error",
              title: "Unable to update any tickets",
              subTitle: `Make sure at least one of the tickets you selected allows for the request.`,
            })
          );
        } else if (count !== ticketIds.length) {
          dispatch(
            createNotification({
              type: "Warning",
              title: "Partial Update",
              subTitle: `Only ${plural(
                "{} ticket",
                "{} tickets",
                count
              )} could be updated for the request.`,
            })
          );
        } else {
          dispatch(
            createNotification({
              type: "Success",
              title: "Update completed",
              subTitle: `${plural("{} ticket", "{} tickets", count)} updated`,
            })
          );
          props.onClose();
        }
      },
      onError: onGraphQLError({ title: "Could not update tags" }),
    });
  };

  const isChangeActive = [
    BatchUpdateTicketAction.CancelTickets,
    BatchUpdateTicketAction.ScheduleTickets,
    BatchUpdateTicketAction.UnscheduleTickets,
    BatchUpdateTicketAction.ArchiveTickets,
    BatchUpdateTicketAction.UnarchiveTickets,
    BatchUpdateTicketAction.MarkTicketsAsDone,
    BatchUpdateTicketAction.RequestEstimate,
    BatchUpdateTicketAction.CancelRequestEstimate,
  ].includes(operations.action);

  const isMessageRequired =
    operations.action === BatchUpdateTicketAction.CancelTickets ||
    operations.action === BatchUpdateTicketAction.MarkTicketsAsDone;

  return (
    <Modal {...props} large>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
          <DocumentIcon className="h-6 w-6 text-brand-600" />
        </div>
        <div className="mt-3sm:mt-0 flex-1 sm:ml-4">
          <Dialog.Title
            as="h3"
            className="text-center text-lg font-medium leading-6 text-gray-900 sm:mr-6 sm:text-left"
          >
            Batch Edit {plural("{} Ticket", "{} Tickets", ticketIds)}
          </Dialog.Title>
          <p className="mt-4 text-sm text-gray-600">
            You can apply the following modifications to the tickets you have
            selected.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Note that no notifications are triggered during a batch operations.
          </p>

          <div className="mt-6 flex flex-col space-y-6">
            <div className="space-y-2">
              <label className="flex flex-row items-center justify-start space-x-2">
                <Radio
                  name="action"
                  label="Change tickets owner"
                  id="change-owner"
                  checked={
                    operations.action === BatchUpdateTicketAction.ChangeOwner
                  }
                  onChange={(event) =>
                    event.currentTarget.checked &&
                    setOperations({
                      ...operations,
                      action: BatchUpdateTicketAction.ChangeOwner,
                    })
                  }
                />
                <span className="text-base font-medium text-gray-600">
                  Change tickets owner
                </span>
              </label>
              <div className="pl-6">
                <RoleSelect
                  value={operations.owner}
                  onChange={(role) => {
                    setOperations({
                      ...operations,
                      owner: role,
                      action: BatchUpdateTicketAction.ChangeOwner,
                    });
                  }}
                  disabled={
                    operations.action !== BatchUpdateTicketAction.ChangeOwner
                  }
                  placeholder="Select a new owner..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex flex-row items-center justify-start space-x-2">
                <Radio
                  name="action"
                  label="Change tickets project"
                  id="change-project"
                  checked={
                    operations.action === BatchUpdateTicketAction.ChangeProject
                  }
                  onChange={(event) =>
                    event.currentTarget.checked &&
                    setOperations({
                      ...operations,
                      action: BatchUpdateTicketAction.ChangeProject,
                    })
                  }
                />
                <span className="text-base font-medium text-gray-600">
                  Move tickets into a project
                </span>
              </label>

              <div className="pl-6">
                <ProjectSelect
                  value={operations.project}
                  onChange={(project) => {
                    setOperations({
                      ...operations,
                      project: project || null,
                      action: BatchUpdateTicketAction.ChangeProject,
                    });
                  }}
                  disabled={
                    operations.action !== BatchUpdateTicketAction.ChangeProject
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex flex-row items-center justify-start space-x-2">
                <Radio
                  name="action"
                  label="Change tickets state"
                  id="change-state"
                  checked={isChangeActive}
                  onChange={(event) =>
                    event.currentTarget.checked &&
                    setOperations({
                      ...operations,
                      action: BatchUpdateTicketAction.RequestEstimate,
                    })
                  }
                />
                <span className="text-base font-medium text-gray-600">
                  Change selected tickets
                </span>
              </label>

              <div className="space-y-2 pl-6">
                <ObjectSelect
                  items={[
                    BatchUpdateTicketAction.CancelTickets,
                    BatchUpdateTicketAction.ScheduleTickets,
                    BatchUpdateTicketAction.UnscheduleTickets,
                    BatchUpdateTicketAction.MarkTicketsAsDone,
                    BatchUpdateTicketAction.ArchiveTickets,
                    // temporarily disable Unarchive feature
                    // BatchUpdateTicketAction.UnarchiveTickets,
                    BatchUpdateTicketAction.RequestEstimate,
                    BatchUpdateTicketAction.CancelRequestEstimate,
                  ]}
                  value={operations.action}
                  renderOptionLabel={(value) => {
                    switch (value) {
                      case BatchUpdateTicketAction.MarkTicketsAsDone:
                        return "Mark as Done";
                      case BatchUpdateTicketAction.CancelTickets:
                        return "Mark as Cancelled";
                      case BatchUpdateTicketAction.ScheduleTickets:
                        return `Schedule`;
                      case BatchUpdateTicketAction.UnscheduleTickets:
                        return "Unschedule";
                      case BatchUpdateTicketAction.ArchiveTickets:
                        return "Archive";
                      case BatchUpdateTicketAction.UnarchiveTickets:
                        return "Unarchive";
                      case BatchUpdateTicketAction.RequestEstimate:
                        return "Send for estimates";
                      case BatchUpdateTicketAction.CancelRequestEstimate:
                        return "Cancel estimate requests";
                      default:
                        return (
                          <span className="text-gray-500">
                            Select an action...
                          </span>
                        );
                    }
                  }}
                  onChange={(action) => {
                    setOperations({
                      ...operations,
                      action: action || null,
                    });
                  }}
                  disabled={!isChangeActive}
                />
                {isMessageRequired && (
                  <Textarea
                    value={operations.actionMessage}
                    placeholder="Required note for this status change"
                    rows={3}
                    onChange={(event) => {
                      setOperations({
                        ...operations,
                        actionMessage: event.currentTarget.value,
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="button"
              onClick={applyChanges}
              btnType="primary"
              tabIndex={4}
              fullInMobile
              disabled={!haveChanges}
            >
              Apply Changes
            </Button>
            <Button
              onClick={props.onClose}
              type="button"
              btnType="secondaryWhite"
              className="mr-0 mt-3 sm:mr-2 sm:mt-0"
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

const UPDATE_BATCH_TICKETS = gql`
  mutation batchUpdateTickets(
    $ticketIds: [Int]!
    $input: BatchUpdateTicketsInput!
  ) {
    batchUpdateTickets(ticketIds: $ticketIds, input: $input) {
      count
    }
  }
`;
