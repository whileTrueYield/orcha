import { faker } from "@faker-js/faker";
import { getRandomColor } from "./utils";
import {
  Prisma,
  Organization,
  Workflow,
  WorkflowState,
  ModelStage,
  Team,
} from ".prisma/client";
import prisma from "../prisma";

export const createWorkflow = async (
  organization: Organization,
  values?: Partial<Prisma.WorkflowCreateInput>
): Promise<Workflow> => {
  const workflow: Prisma.WorkflowCreateInput = {
    name: faker.hacker.noun() + " " + faker.hacker.ingverb(),
    description: faker.lorem.paragraph(),
    stage: ModelStage.PUBLISHED,
    color: getRandomColor(),
    organization: {
      connect: { id: organization.id },
    },
    ...values,
  };

  return prisma.workflow.create({ data: workflow });
};

export const createWorkflowState = async (
  workflow: Workflow,
  values?: Partial<Prisma.WorkflowStateCreateInput>
): Promise<WorkflowState> => {
  const workflowState: Prisma.WorkflowStateCreateInput = {
    name: `${faker.hacker.ingverb()}`,
    workflow: { connect: { id: workflow.id } },
    organization: { connect: { id: workflow.organizationId } },
    ...values,
  };

  return prisma.workflowState.create({ data: workflowState });
};

export const setWorkflowStateTeams = async (
  workflowState: WorkflowState,
  teams: Team[]
): Promise<WorkflowState> => {
  return prisma.workflowState.update({
    where: { id: workflowState.id },
    data: {
      teams: {
        set: teams.map(({ id }) => ({ id })),
      },
    },
  });
};
