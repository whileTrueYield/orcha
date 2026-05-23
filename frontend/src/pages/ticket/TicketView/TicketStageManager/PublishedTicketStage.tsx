import { gql, useLazyQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  MutationScheduleTicketArgs,
  MutationUpdateTicketArgs,
  MutationUpdateTicketWorkflowStatesArgs,
  Ticket,
  TicketWorkflowState,
} from "types/graphql";
import { TicketStageProgress, TicketStep } from "./TicketStageProgress";
import * as yup from "yup";
import { sortBy } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError } from "utils/GQLClient";
import { TicketWorkflowStateAssignee } from "../TicketWorkflowState/TicketWorkflowStateAssignee";
import cn from "classnames";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
} from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { useEffect, useState } from "react";
import { useBlockingMutation } from "utils/graphql";
import { CalendarIcon, ClockIcon, XIcon } from "@heroicons/react/outline";
import { QueryReturnValue } from "types/queryTypes";
import { WarningConfirm } from "components/modals/WarningConfirm";

interface Props {
  ticket: Ticket;
  steps: TicketStep[];
  scheduleTicket: (input: { variables: MutationScheduleTicketArgs }) => void;
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
        assigneeId: yup.number().nullable(),
      })
    ),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const PublishedTicketStage: FCWithFragments<Props> = (props) => {
  const { ticket, steps, scheduleTicket } = props;
  const { ticketWorkflowStates } = ticket;
  const [showConfirm, setShowConfirm] = useState(false);

  const sortedWorkflowStates = sortBy(ticketWorkflowStates, "position");

  const [getUnscheduledDependencies] = useLazyQuery<
    QueryReturnValue["getUnscheduledDependencies"]
  >(GET_TICKET_DEPENDENCIES);

  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      ticketWorkflowStates: sortedWorkflowStates.map((state) => ({
        ticketWorkflowStateId: state.id,
        isActive: state.isActive,
        assigneeId: state.assignee?.id || null,
      })),
    },
  });

  const { watch } = formMethods;

  const [updateState] = useBlockingMutation<
    { updateTicketWorkflowStates: Ticket },
    MutationUpdateTicketWorkflowStatesArgs
  >(UPDATE_TICKET_WORKFLOW_STATE, {
    onError: onGraphQLError({ title: "Ticket assignment failed" }),
  });

  const [updateTicket] = useBlockingMutation<
    { updateTicket: Ticket },
    MutationUpdateTicketArgs
  >(UPDATE_TICKET_MUTATION, {
    onError: onGraphQLError({ title: "Ticket updated" }),
  });

  // auto-save on change
  useEffect(() => {
    const subscription = watch((formData) =>
      updateState({
        variables: {
          ticketId: ticket.id,
          input: {
            states: formData.ticketWorkflowStates,
          },
        },
      })
    );
    return () => subscription.unsubscribe();
  }, [watch, updateState, ticket.id]);

  const onScheduleTicket = () => {
    getUnscheduledDependencies({
      variables: { ticketIds: [props.ticket.id] },
      onCompleted: ({ getUnscheduledDependencies }) => {
        if (getUnscheduledDependencies?.length) {
          setShowConfirm(true);
        } else {
          scheduleTicket({ variables: { ticketId: ticket.id } });
        }
      },
    });
  };

  let incompleteAssignment = false;
  let incompleteEstimate = false;

  for (const state of ticket.ticketWorkflowStates) {
    if (state.isActive) {
      if (!state.assignee) {
        incompleteAssignment = true;
      } else if (
        !state.estimateMinimum ||
        !state.estimateMostLikely ||
        !state.estimateMaximum
      ) {
        incompleteEstimate = true;
      }
    }
  }

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

  const renderEstimateMessage = () => {
    if (ticket.estimating) {
      return (
        <div className="border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Waiting for estimates
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Assignees have been notified. Waiting for estimates.</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              btnType="white"
              block
              onClick={() =>
                updateTicket({
                  variables: {
                    ticketId: ticket.id,
                    input: { estimating: false },
                  },
                })
              }
            >
              <XIcon className="mr-1 h-4 w-4" />
              Cancel Estimate Request
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Cannot Schedule Ticket Yet
              </h3>
              <div className="mt-2 space-y-2 text-sm text-red-700">
                <p>
                  You may request estimates from assignees, this will notify
                  every assignee.
                </p>
                {incompleteAssignment && (
                  <p>Some workflow stages are missing assignees.</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Button
              type="button"
              btnType="primary"
              block
              onClick={() =>
                updateTicket({
                  variables: {
                    ticketId: ticket.id,
                    input: { estimating: true },
                  },
                })
              }
            >
              <ClockIcon className="mr-1 h-5 w-5" />
              Send for Estimates
            </Button>
          </div>
        </div>
      );
    }
  };

  const renderStageInfo = () => {
    if (incompleteAssignment || incompleteEstimate) {
      return (
        <div className="rounded-lg rounded-t-none border-t">
          {renderEstimateMessage()}
        </div>
      );
    } else {
      return (
        <div className="rounded-lg rounded-t-none border-t border-green-100 bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Ready to schedule
              </h3>
              <div className="mt-2 flex-col sm:flex">
                <p className="text-sm text-gray-700">
                  Schedule this ticket to integrate it in the assignee's
                  schedule. Once a ticket is scheduled, an estimated
                  <span className="mx-1 italic">"delivered by"</span>
                  date will provided.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex">
            <Button
              type="button"
              btnType="success"
              block
              onClick={onScheduleTicket}
            >
              <CalendarIcon className="mr-1 h-5 w-5" />
              Schedule Ticket
            </Button>
          </div>
        </div>
      );
    }
  };

  const className = cn("rounded-lg shadow bg-white");

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4 pt-4">
        <div className="text-center text-lg font-medium text-gray-700">
          {incompleteAssignment || incompleteEstimate
            ? ticket.estimating
              ? "Awaiting Estimates"
              : "Ticket Assignment"
            : "Ready to Schedule"}
        </div>
        <TicketStageProgress steps={steps} />
        <p className="px-4 text-sm text-gray-600">
          Select assignees for each workflow stage
        </p>
        {incompleteAssignment && ticket.estimating && (
          <div className="m-4 flex flex-row items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-gray-600">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
            <p className="text-red-800">
              Some workflow stages are missing assignees
            </p>
          </div>
        )}
      </div>
      <div className="mb-4 px-2">
        <FormProvider {...formMethods}>
          <form>{sortedWorkflowStates.map(renderState)}</form>
        </FormProvider>
      </div>
      <WarningConfirm
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => scheduleTicket({ variables: { ticketId: ticket.id } })}
        title="Unscheduled Dependencies Detected"
        description="One or more of dependencies have not been scheduled. Scheduling this ticket could lead to quality and overall execution issues. Are you sure you want to schedule this ticket?"
        cta="Yes, Schedule this ticket"
      />
      {renderStageInfo()}
    </div>
  );
};

PublishedTicketStage.fragments = {
  publishedTicketStageFragment: gql`
    fragment publishedTicketStageFragment on Ticket {
      id
      estimating
      ticketWorkflowStates {
        id
        position
        name
        isActive
        ticketId
        estimateMinimum
        estimateMostLikely
        estimateMaximum
        assignee {
          id
          title
          name
          avatarUrl
          status
        }
        ...TicketWorkflowStateAssigneeDetails
      }
    }
    ${TicketWorkflowStateAssignee.fragments.TicketWorkflowStateAssigneeDetails}
  `,
};

const UPDATE_TICKET_WORKFLOW_STATE = gql`
  mutation UpdateTicketWorkflowStatesForPublishedTicket(
    $ticketId: Int!
    $input: UpdateTicketWorkflowStateInput!
  ) {
    updateTicketWorkflowStates(ticketId: $ticketId, input: $input) {
      id
      ...publishedTicketStageFragment
    }
  }
  ${PublishedTicketStage.fragments.publishedTicketStageFragment}
`;

const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicketForStage($ticketId: Int!, $input: UpdateTicketInput!) {
    updateTicket(ticketId: $ticketId, input: $input) {
      id
      ...publishedTicketStageFragment
    }
  }
  ${PublishedTicketStage.fragments.publishedTicketStageFragment}
`;

const GET_TICKET_DEPENDENCIES = gql`
  query GetTicketUnscheduledDependenciesForSchedule($ticketIds: [Int!]!) {
    getUnscheduledDependencies(ticketIds: $ticketIds) {
      id
      title
    }
  }
`;
