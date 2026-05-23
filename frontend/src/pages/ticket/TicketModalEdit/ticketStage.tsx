import React from "react";
import { FCWithFragments } from "types";
import {
  ModelStage,
  MutationUpdateTicketStageArgs,
  Ticket,
} from "types/graphql";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  ticket: Ticket;
}

export const TicketStage: FCWithFragments<Props> = (props) => {
  const { ticket } = props;
  const [updateTicketStage] = useBlockingMutation<
    { updateTicketStage: Ticket },
    MutationUpdateTicketStageArgs
  >(MUTATE_UPDATE_WORKFLOW_STAGE, {
    onError: onGraphQLError({ title: "Could not update ticket lifecycle" }),
    onCompleted: onMutationComplete({
      title: "Ticket lifecycle has been updated",
    }),
  });

  const onChange = (stage: ModelStage) => {
    updateTicketStage({
      variables: {
        ticketId: ticket.id,
        stage,
      },
    });
  };

  if (ticket.stage === ModelStage.Draft) {
    return <TicketDraftStage onChange={onChange} ticket={ticket} />;
  } else if (ticket.stage === ModelStage.Archived) {
    return <TicketArchivedStage onChange={onChange} ticket={ticket} />;
  } else if (ticket.stage === ModelStage.Published) {
    return <TicketPublishedStage onChange={onChange} ticket={ticket} />;
  }

  return null;
};

interface TicketStageChange {
  onChange: (stage: ModelStage) => void;
  ticket: Ticket;
}

const TicketDraftStage: React.FC<TicketStageChange> = (props) => {
  const { onChange, ticket } = props;
  const isReady =
    (ticket.product && ticket.workflow) ||
    (ticket.productId && ticket.workflowId);

  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Draft Ticket
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">
          {isReady ? (
            <p>
              This ticket is a Draft, it may not be started yet. Publish this
              ticket to be able to schedule it.
            </p>
          ) : (
            <p>
              You need to provide a product and a workflow to publish a ticket
            </p>
          )}
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="primary"
            onClick={() => onChange(ModelStage.Published)}
            disabled={!isReady}
          >
            Publish Ticket
          </Button>
        </div>
      </div>
    </>
  );
};

const TicketPublishedStage: React.FC<TicketStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Published Ticket
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This ticket can be scheduled and worked on. You can archive it to
            prevent further work.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="warning"
            onClick={() => props.onChange(ModelStage.Archived)}
          >
            Archive Ticket
          </Button>
        </div>
      </div>
    </>
  );
};

const TicketArchivedStage: React.FC<TicketStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Archived Ticket
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between sm:space-x-2">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This ticket or its project has been archived. You may re-publish
            this ticket and schedule it again.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="primary"
            onClick={() => props.onChange(ModelStage.Published)}
          >
            Publish Ticket
          </Button>
        </div>
      </div>
    </>
  );
};

TicketStage.fragments = {
  TicketStageDetails: gql`
    fragment TicketStageDetails on Ticket {
      id
      localId
      ticketWorkflowStates {
        id
        position
        name
        isActive
        assignee {
          id
          title
          name
          avatarUrl
        }
      }
      stage
    }
  `,
};

const MUTATE_UPDATE_WORKFLOW_STAGE = gql`
  mutation UpdateTicketStage($stage: ModelStage!, $ticketId: Int!) {
    updateTicketStage(stage: $stage, ticketId: $ticketId) {
      ...TicketStageDetails
    }
  }
  ${TicketStage.fragments.TicketStageDetails}
`;
