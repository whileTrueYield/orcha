import React from "react";
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
import { FormProvider, useForm } from "react-hook-form";
import { sortBy } from "lodash";
import { TicketWorkflowStateAssignee } from "pages/ticket/TicketView/TicketWorkflowState/TicketWorkflowStateAssignee";
import { InlinePopHelp } from "components/help/InlinePopHelp";
import { useBlockingMutation } from "utils/graphql";

interface Props {
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

export const TicketAssigneeForm: FCWithFragments<Props> = (props) => {
  const { ticket, ticketWorkflowStates } = props;

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
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)} className="">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
              Workflow and Assignment
              <InlinePopHelp>
                <p>You may assign only one team member to a workflow step.</p>
                <p>You may also disable a workflow step by unchecking it.</p>
              </InlinePopHelp>
            </h3>
            <div className="mt-4">
              <p className="text-sm leading-5 text-gray-500"></p>
            </div>
            <div className="mt-6 flex flex-col">
              {sortedWorkflowStates.map(renderState)}
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button type="submit" tabIndex={3} btnType="primary" fullInMobile>
                Save Assignment
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

TicketAssigneeForm.fragments = {
  TicketAssigneeFormFragment: gql`
    fragment TicketAssigneeFormFragment on TicketWorkflowState {
      id
      position
      name
      isActive
      estimateMaximum
      estimateMinimum
      estimateMostLikely
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
  mutation UpdateTicketWorkflowStatesForProject(
    $ticketId: Int!
    $input: UpdateTicketWorkflowStateInput!
  ) {
    updateTicketWorkflowStates(ticketId: $ticketId, input: $input) {
      id
      ticketWorkflowStates {
        id
        ...TicketAssigneeFormFragment
      }
    }
  }
  ${TicketAssigneeForm.fragments.TicketAssigneeFormFragment}
`;
