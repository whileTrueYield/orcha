import { Field, Float, Int, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import {
  Project,
  ModelStage as ModelStageEnum,
  TicketStatus as TicketStatusEnum,
} from "@generated/type-graphql";
import { TicketStatus, ModelStage } from "@prisma/client";
import { Role, Feature, FeatureGroup, Workflow } from "../entities";

@ObjectType()
export class PaginatedProjects extends PaginatedNodes {
  @Field(() => [Project])
  nodes: Project[];
}

@ObjectType()
export class ProjectAnalytics {
  @Field(() => Int)
  projectId: number;

  @Field(() => Int)
  organizationId: number;

  @Field(() => Int)
  scheduledTicketCount: number;

  @Field(() => Int)
  draftTicketCount: number;

  @Field(() => Int)
  inProgressTicketCount: number;

  @Field(() => Int)
  doneTicketCount: number;

  @Field(() => Int)
  unassignedTicketCount: number;

  @Field(() => Int)
  estimatedTicketCount: number;

  @Field(() => Int)
  unestimatedTicketCount: number;
}

/**
 * This is the model of a differential synch shadow stored
 */
@ObjectType()
export class DS_Shadow {
  @Field(() => String)
  document: string;

  @Field(() => Int)
  client: number;

  @Field(() => Int)
  server: number;
}

// This is a restricted role set to allow for fast
// queriying in the frontend using a fuzzy library
@ObjectType()
export class MiniProject {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int, { nullable: true })
  parentId: number | null;

  @Field(() => ModelStageEnum)
  stage: ModelStage;

  @Field(() => Boolean)
  ancestorIsArchived: boolean;
}

@ObjectType()
export class ProjectTicket {
  @Field()
  id: number;

  @Field()
  title: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => TicketStatusEnum)
  status: TicketStatus;

  @Field(() => ModelStageEnum)
  stage: ModelStage;

  @Field({ nullable: true })
  localId?: number;

  @Field({ nullable: true })
  productCode?: string;
}

@ObjectType()
export class ProjectGoalStats {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  parentId: number | null;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  done: number;

  @Field(() => Int)
  scheduled: number;

  @Field(() => Int)
  unScheduled: number;

  @Field(() => Int)
  cancelled: number;
}

@ObjectType()
export class TicketExport {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  created_at: string;

  @Field(() => TicketStatusEnum)
  status: TicketStatus;

  @Field(() => ModelStageEnum)
  stage: ModelStage;

  @Field()
  eta: string;

  @Field()
  local_id: string;

  @Field()
  product: string;

  @Field()
  workflow: string;

  @Field()
  owner_name: string;

  @Field()
  owner_email: string;

  @Field()
  project: string;

  @Field()
  scheduled_at: string;

  @Field()
  closed_at: string;

  @Field()
  author_email: string;

  @Field()
  author_name: string;

  @Field()
  ancestor_tickets: string;

  @Field()
  successor_tickets: string;

  @Field()
  tags: string;
}

// Imported from page
@ObjectType()
export class RoleWorkload {
  @Field(() => Role)
  role: Role;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
export class FeatureDistribution {
  @Field(() => Feature)
  feature: Feature;

  @Field(() => FeatureGroup)
  featureGroup: FeatureGroup;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
export class WorkflowDistribution {
  @Field(() => Workflow)
  workflow: Workflow;

  @Field(() => Float)
  hours: number;
}

@ObjectType()
export class ProjectGoalProgress {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  parentId: number | null;

  @Field(() => String)
  name: string;

  @Field(() => Float)
  progress: number;

  @Field(() => Float)
  accomplished: number;

  @Field(() => Float)
  total: number;

  @Field(() => Date)
  eta: Date;
}

@ObjectType()
export class OpenTicketsByWorkflow {
  @Field(() => Workflow)
  workflow: Workflow;

  @Field(() => [TicketOpenByWorkflowDatum])
  values: TicketOpenByWorkflowDatum[];
}

@ObjectType()
export class TicketOpenByWorkflowDatum {
  @Field(() => Date)
  date: Date;

  @Field(() => Int)
  value: number;
}
