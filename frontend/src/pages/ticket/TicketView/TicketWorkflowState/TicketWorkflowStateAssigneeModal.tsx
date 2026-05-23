import React from "react";
import { Modal, ModalProps } from "components/modals/Modal";
import { UserAddIcon } from "@heroicons/react/outline";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import gql from "graphql-tag";
import { FCWithFragments } from "types";
import {
  Ticket,
  TicketWorkflowState,
  MutationUpdateTicketWorkflowStatesArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { TicketWorkflowStateAssignee } from "./TicketWorkflowStateAssignee";
import { FormProvider, useForm } from "react-hook-form";
import { sortBy } from "lodash";
import { useBlockingMutation } from "utils/graphql";

interface Props extends ModalProps {
  ticketWorkflowStates: TicketWorkflowState[];
  ticket: Ticket;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    ticketWorkflowStates: yup.array().of(
      yup.object().noUnknown().defined().shape({
        ticketWorkflowStateId: yup.number(),
        isActive: yup.boolean(),
        assigneeId: yup.number(),
      })
    ),
  })
  .required();
type FormSchema = yup.InferType<typeof schema>;

export const TicketWorkflowStateAssigneeModal: FCWithFragments<Props> = (
  props
) => {
  const { ticketWorkflowStates, ticket, ...modalProps } = props;

  const sortedWorkflowStates = sortBy(ticketWorkflowStates, "position");

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      ticketWorkflowStates: sortedWorkflowStates.map((state) => ({
        ticketWorkflowStateId: state.id,
        isActive: state.isActive,
        assigneeId: state.assignee?.id,
      })),
    },
  });

  const [updateState] = useBlockingMutation<
    { updateTicketWorkflowStates: Ticket },
    MutationUpdateTicketWorkflowStatesArgs
  >(UPDATE_TICKET_WORKFLOW_STATE, {
    onError: onGraphQLError({ title: "Ticket assignment failed" }),
    onCompleted: onMutationComplete({
      title: "Ticket assignment done",
      callback: () => props.onClose(),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    updateState({
      variables: {
        ticketId: props.ticket.id,
        input: {
          states: formData.ticketWorkflowStates,
        },
      },
    });
  };

  const renderState = (
    ticketWorkflowState: TicketWorkflowState,
    index: number
  ) => {
    return (
      <TicketWorkflowStateAssignee
        key={ticketWorkflowState.id}
        ticket={ticket}
        index={index}
        ticketWorkflowState={ticketWorkflowState}
      />
    );
  };

  return (
    <Modal {...modalProps}>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <UserAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              Assign Ticket
            </h3>
            <div className="mt-4">
              <p className="text-sm leading-5 text-gray-500">
                You may assign only one team member to every step of the
                ticket's workflow. You may also disable a step by unchecking it.
              </p>
            </div>
            <div className="mt-6 flex flex-col">
              {sortedWorkflowStates.map(renderState)}
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button type="submit" tabIndex={3} btnType="primary" fullInMobile>
                Save Assignment
              </Button>
              <Button
                onClick={props.onClose}
                fullInMobile
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                type="button"
                btnType="secondaryWhite"
                tabIndex={4}
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

TicketWorkflowStateAssigneeModal.fragments = {
  TicketWorkflowStateAssigneeModalFragment: gql`
    fragment TicketWorkflowStateAssigneeModalFragment on TicketWorkflowState {
      id
      position
      name
      isActive
      assignee {
        id
        type
        name
        avatarUrl
      }
    }
  `,
};

const UPDATE_TICKET_WORKFLOW_STATE = gql`
  mutation UpdateTicketWorkflowStates(
    $ticketId: Int!
    $input: UpdateTicketWorkflowStateInput!
  ) {
    updateTicketWorkflowStates(ticketId: $ticketId, input: $input) {
      id
      ticketWorkflowStates {
        ...TicketWorkflowStateAssigneeModalFragment
      }
    }
  }
  ${TicketWorkflowStateAssigneeModal.fragments
    .TicketWorkflowStateAssigneeModalFragment}
`;
