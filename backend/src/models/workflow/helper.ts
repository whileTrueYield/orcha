import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { MiniWorkflowShape } from "./entity";
import { Prisma } from "@prisma/client";
import {
  Workflow,
  ModelStage,
  WorkflowState,
  Product,
} from "@prisma/client";

export async function findWorkflowByName(
  name: string,
  organizationId: number
): Promise<Workflow | null> {
  return prisma.workflow.findFirst({
    where: {
      organizationId,
      name: { equals: name, mode: "insensitive" },
      stage: { not: ModelStage.DELETED },
    },
  });
}

export async function findWorkflowStateByName(
  name: string,
  workflowId: number
): Promise<WorkflowState | null> {
  return prisma.workflowState.findFirst({
    where: {
      workflowId,
      name: { equals: name, mode: "insensitive" },
    },
  });
}

export async function getInitialState(
  workflowId: number
): Promise<WorkflowState | null> {
  return prisma.workflowState.findFirst({
    where: { workflowId },
    orderBy: { position: "asc" },
    include: { teams: true, backupTeams: true },
  });
}

interface GetPageArgs extends GetPageArgsFor<Workflow> {
  organizationId: number;
  productId?: number;
  activeOnly?: boolean;
  stages?: ModelStage[];
}

export async function getPaginatedWorkflows(
  args: GetPageArgs
) {
  const { first, last, productId, organizationId, activeOnly, search, stages } =
    args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Workflow = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const workflowQuery: Prisma.WorkflowWhereInput = {
    organizationId,
  };

  // We allow search on workflows by body
  const query = trim(search);
  if (query) {
    workflowQuery.name = { contains: query, mode: "insensitive" };
  }

  if (productId) {
    workflowQuery.products = { some: { id: productId } };
  }

  if (activeOnly) {
    workflowQuery.stage = ModelStage.PUBLISHED;
  }

  if (stages?.length) {
    workflowQuery.stage = { in: stages, not: ModelStage.DELETED };
  } else {
    workflowQuery.stage = { not: ModelStage.DELETED };
  }

  const workflows = await prisma.workflow.findMany({
    where: workflowQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.workflow.count({ where: workflowQuery });

  return paginateNodes({ nodes: workflows, offset, pageSize, count });
}

/**
 * Convert a workflow into a mini Workflow
 */
export const toMiniWorkflow = (workflow: Workflow): MiniWorkflowShape => ({
  id: workflow.id,
  name: workflow.name,
  stage: workflow.stage,
});

export const getWorkflowQueryForProduct = (
  product: Product
): Prisma.WorkflowWhereInput => {
  const workflowWhere: Prisma.WorkflowWhereInput = {
    organizationId: product.organizationId,
    stage: { not: ModelStage.DELETED },
  };

  // is the product using default workflows ?
  if (product.isUsingDefaultWorkflows) {
    workflowWhere.OR = [
      {
        products: {
          some: { id: product.id, stage: { not: ModelStage.DELETED } },
        },
      },
      {
        isDefaultWorkflow: true,
      },
    ];
  } else {
    workflowWhere.products = {
      some: { id: product.id, stage: { not: ModelStage.DELETED } },
    };
  }

  return workflowWhere;
};
