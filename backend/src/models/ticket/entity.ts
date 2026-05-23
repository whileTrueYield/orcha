import { Field, Int, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import {
  Ticket,
  TicketWorkflowState,
  TicketStatus,
} from "@generated/type-graphql";
import { TicketStatus as PrismaTicketStatus } from "@prisma/client";

export const ticketStatuses = Object.values(PrismaTicketStatus);

@ObjectType()
export class PlanningTicket {
  @Field()
  title: string;

  @Field(() => TicketStatus)
  status: PrismaTicketStatus;

  @Field(() => Int)
  id: number;

  @Field(() => Int)
  localId: number;

  @Field()
  productCode: string;

  @Field(() => Date)
  eta: Date;

  @Field(() => Boolean)
  milestone: boolean;

  @Field()
  workflowName: string;

  @Field()
  productName: string;

  @Field()
  projectName: string;
}

@ObjectType()
export class NextTicket {
  @Field((_type) => Ticket)
  ticket: Ticket;

  @Field((_type) => TicketWorkflowState)
  nextState: TicketWorkflowState;
}

@ObjectType()
class MyAssignedTicket {
  @Field((_type) => Ticket)
  ticket: Ticket;

  @Field()
  isPaused: boolean;

  @Field()
  isStarted: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isDone: boolean;

  @Field()
  isNext: boolean;

  @Field((_type) => TicketWorkflowState, { nullable: true })
  lastState: TicketWorkflowState | null;
}

@ObjectType()
export class MyUpcomingAssignedTicket extends MyAssignedTicket {
  @Field((_type) => TicketWorkflowState)
  currentState: TicketWorkflowState;
}

@ObjectType()
export class MyPreviousAssignedTicket extends MyAssignedTicket {
  @Field((_type) => TicketWorkflowState, { nullable: true })
  currentState: TicketWorkflowState | null;
}

@ObjectType()
export class ChecklistItem {
  @Field()
  label: string;

  @Field((_type) => Boolean, { nullable: true })
  checked: boolean | null;
}

@ObjectType()
export class PaginatedTickets extends PaginatedNodes {
  @Field(() => [Ticket])
  nodes: Ticket[];
}

@ObjectType()
export class TicketBatchPayload {
  @Field(() => Int)
  count: number;
}

@ObjectType()
export class TicketDependency {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  localId: number | null;

  @Field(() => String, { nullable: true })
  productCode?: string;

  @Field()
  title: string;

  @Field(() => TicketStatus)
  status: PrismaTicketStatus;

  @Field(() => [Int])
  ancestors: number[];

  @Field(() => [Int])
  successors: number[];

  @Field(() => Int, { nullable: true })
  projectId: number | null;

  @Field()
  milestone: boolean;
}

@ObjectType()
export class ProjectDependency {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  parentId?: number | null;

  @Field()
  name: string;

  @Field(() => [Int])
  ancestors: number[];

  @Field(() => [Int])
  successors: number[];
}

@ObjectType()
export class DependencySet {
  @Field(() => [TicketDependency])
  tickets: TicketDependency[];

  @Field(() => [ProjectDependency])
  projects: ProjectDependency[];
}
