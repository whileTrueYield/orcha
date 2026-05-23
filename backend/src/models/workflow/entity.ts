import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";

import {
  Workflow,
  WorkflowState,
  ModelStage as ModelStageEnum,
} from "@generated/type-graphql";
import { ModelStage } from "@prisma/client";

@ObjectType()
export class PaginatedWorkflows extends PaginatedNodes {
  @Field(() => [Workflow])
  nodes: Workflow[];
}

@ObjectType()
export class PaginatedWorkflowStates extends PaginatedNodes {
  @Field(() => [WorkflowState])
  nodes: WorkflowState[];
}

@ObjectType()
export class MiniWorkflow {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field(() => ModelStageEnum)
  stage: ModelStage;
}
