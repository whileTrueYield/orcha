import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  ModelStage,
  MutationScheduleTicketArgs,
  MutationUpdateTicketArgs,
  MutationUpdateTicketStageArgs,
  Ticket,
  TicketStatus,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { ArchivedTicketStage } from "./ArchivedTicketStage";
import { CancelledTicketStage } from "./CancelledTicketStage";
import { DoneTicketStage } from "./DoneTicketStage";
import { DraftTicketStage } from "./DraftTicketStage";
import { PublishedTicketStage } from "./PublishedTicketStage";
import { ScheduledTicketStage } from "./ScheduledTicketStage";
import { TicketStep } from "./TicketStageProgress";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  ticket: Ticket;
}

enum TicketStage {
  Unknown = "UNKNOWN",
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Scheduled = "SCHEDULED",
  Archived = "ARCHIVED",
  Done = "DONE",
  Cancelled = "CANCELLED",
}

const EmptyStage: TicketStep[] = [
  { name: "Draft", status: "upcoming" },
  { name: "Published", status: "upcoming" },
  { name: "Scheduled", status: "upcoming" },
  { name: "Closed", status: "upcoming" },
];

const DraftStage: TicketStep[] = [
  { name: "Draft", status: "current" },
  { name: "Published", status: "upcoming" },
  { name: "Scheduled", status: "upcoming" },
  { name: "Closed", status: "upcoming" },
];
const PublishedStage: TicketStep[] = [
  { name: "Draft", status: "completed" },
  { name: "Published", status: "current" },
  { name: "Scheduled", status: "upcoming" },
  { name: "Closed", status: "upcoming" },
];

const ScheduledStage: TicketStep[] = [
  { name: "Draft", status: "completed" },
  { name: "Published", status: "completed" },
  { name: "Scheduled", status: "current" },
  { name: "Closed", status: "upcoming" },
];

const DoneStage: TicketStep[] = [
  { name: "Draft", status: "completed" },
  { name: "Published", status: "completed" },
  { name: "Scheduled", status: "completed" },
  { name: "Closed", status: "succeeded" },
];

const CancelledStage: TicketStep[] = [
  { name: "Draft", status: "completed" },
  { name: "Published", status: "completed" },
  { name: "Scheduled", status: "completed" },
  { name: "Closed", status: "failed" },
];

const getTicketStage = (ticket: Ticket): [TicketStage, TicketStep[]] => {
  if (ticket.stage === ModelStage.Draft) {
    return [TicketStage.Draft, DraftStage];
  } else if (ticket.stage === ModelStage.Published) {
    if (ticket.status === TicketStatus.Unscheduled) {
      return [TicketStage.Published, PublishedStage];
    } else if (ticket.status === TicketStatus.Scheduled) {
      return [TicketStage.Scheduled, ScheduledStage];
    } else if (ticket.status === TicketStatus.Done) {
      return [TicketStage.Done, DoneStage];
    } else if (ticket.status === TicketStatus.Cancelled) {
      return [TicketStage.Cancelled, CancelledStage];
    }
  } else if (ticket.stage === ModelStage.Archived) {
    return [TicketStage.Archived, EmptyStage];
  }

  return [TicketStage.Unknown, EmptyStage];
};

export const TicketStageManager: FCWithFragments<Props> = (props) => {
  const { ticket } = props;

  const [stage, steps] = getTicketStage(ticket);

  const [updateTicket] = useBlockingMutation<
    { updateTicket: Ticket },
    MutationUpdateTicketArgs
  >(UPDATE_TICKET_MUTATION, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
  });

  const [updateTicketStage] = useBlockingMutation<
    { updateTicketStage: Ticket },
    MutationUpdateTicketStageArgs
  >(UPDATE_TICKET_STAGE_MUTATION, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket has been updated",
    }),
  });

  const [scheduleTicket] = useBlockingMutation<
    { scheduleTicket: Ticket },
    MutationScheduleTicketArgs
  >(SCHEDULE_TICKET_MUTATION, {
    onError: onGraphQLError({ title: "Could not schedule ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket has been scheduled",
    }),
  });

  switch (stage) {
    case TicketStage.Draft:
      return (
        <DraftTicketStage
          steps={steps}
          updateTicket={updateTicket}
          updateTicketStage={updateTicketStage}
          ticket={ticket}
        />
      );
    case TicketStage.Published:
      return (
        <PublishedTicketStage
          steps={steps}
          scheduleTicket={scheduleTicket}
          ticket={ticket}
        />
      );
    case TicketStage.Scheduled:
      return <ScheduledTicketStage steps={steps} ticket={ticket} />;
    case TicketStage.Done:
      return <DoneTicketStage steps={steps} ticket={ticket} />;
    case TicketStage.Archived:
      return (
        <ArchivedTicketStage
          steps={steps}
          updateTicketStage={updateTicketStage}
          ticket={ticket}
        />
      );
    case TicketStage.Cancelled:
      return <CancelledTicketStage steps={steps} ticket={ticket} />;
    default:
      return null;
  }
};

TicketStageManager.fragments = {
  ticketStageManagerFragment: gql`
    fragment ticketStageManagerFragment on Ticket {
      id
      status
      stage
      ...draftTicketStageFragment
      ...publishedTicketStageFragment
      ...scheduledTicketStageFragment
      ...archivedTicketStageFragment
      ...doneTicketStageFragment
      ...cancelledTicketStageFragment
    }
    ${DraftTicketStage.fragments.draftTicketStageFragment}
    ${PublishedTicketStage.fragments.publishedTicketStageFragment}
    ${ScheduledTicketStage.fragments.scheduledTicketStageFragment}
    ${ArchivedTicketStage.fragments.archivedTicketStageFragment}
    ${DoneTicketStage.fragments.doneTicketStageFragment}
    ${CancelledTicketStage.fragments.cancelledTicketStageFragment}
  `,
};

const UPDATE_TICKET_STAGE_MUTATION = gql`
  mutation UpdateTickdetStageForStageManager(
    $ticketId: Int!
    $stage: ModelStage!
  ) {
    updateTicketStage(ticketId: $ticketId, stage: $stage) {
      ...ticketStageManagerFragment
    }
  }
  ${TicketStageManager.fragments.ticketStageManagerFragment}
`;

const UPDATE_TICKET_MUTATION = gql`
  mutation UpdateTicketForStageManager(
    $ticketId: Int!
    $input: UpdateTicketInput!
  ) {
    updateTicket(ticketId: $ticketId, input: $input) {
      id
      ...ticketStageManagerFragment
    }
  }
  ${TicketStageManager.fragments.ticketStageManagerFragment}
`;

const SCHEDULE_TICKET_MUTATION = gql`
  mutation scheduleTicketForStageManager($ticketId: Int!) {
    scheduleTicket(ticketId: $ticketId) {
      ...ticketStageManagerFragment
    }
  }
  ${TicketStageManager.fragments.ticketStageManagerFragment}
`;
