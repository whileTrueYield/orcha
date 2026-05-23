import { CreateTicketResolver } from "./createTicket.resolver";
import { DependencySetResolver } from "./dependency.resolver";
import { TicketsResolver } from "./tickets.resolver";
import { ScheduleTicketResolver } from "./scheduleTicket.resolver";
import { TicketFeaturesResolver } from "./ticketFeatures.resolver";
import { TicketResolver } from "./ticket.resolver";
import { TicketTagsResolver } from "./ticketTags.resolver";
import { TicketWorkflowStateNoteResolver } from "./ticketWorkflowStateNote.resolver";
import { TicketWorkflowStateResolver } from "./ticketWorkflowState.resolver";
import { UpdateTicketResolver } from "./updateTicket.resolver";
import { PlanningResolver } from "./planning.resolver";
import { NextTicketResolver } from "./nextTickets.resolver";
import { UpcomingTicketResolver } from "./upcomingTickets.resolver";
import { TicketBatchEditResolver } from "./ticketBatchEdit.resolver";

export default [
  CreateTicketResolver,
  DependencySetResolver,
  NextTicketResolver,
  UpcomingTicketResolver,
  ScheduleTicketResolver,
  TicketFeaturesResolver,
  TicketResolver,
  TicketsResolver,
  TicketTagsResolver,
  TicketWorkflowStateNoteResolver,
  TicketWorkflowStateResolver,
  UpdateTicketResolver,
  PlanningResolver,
  TicketBatchEditResolver,
];
