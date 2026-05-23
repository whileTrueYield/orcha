import { CreateWorkflowResolver } from "./createWorkflow.resolver";
import { DeleteWorkflowResolver } from "./deleteWorkflow.resolver";
import { MiniWorkflowsResolver } from "./miniWorkflows.resolver";
import { UpdateWorkflowResolver } from "./updateWorkflow.resolver";
import { WorkflowResolver } from "./workflow.resolver";
import { WorkflowsResolver } from "./workflows.resolver";
import { WorkflowStateResolver } from "./workflowState.resolver";

export default [
  CreateWorkflowResolver,
  DeleteWorkflowResolver,
  UpdateWorkflowResolver,
  WorkflowResolver,
  WorkflowStateResolver,
  WorkflowsResolver,
  MiniWorkflowsResolver,
];
