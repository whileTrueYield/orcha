import { faker } from "@faker-js/faker";
import { sample } from "lodash";
import {
  Feature,
  ModelStage,
  Prisma,
  Product,
  Role,
  Ticket,
  TicketStatus,
  Workflow,
} from ".prisma/client";
import prisma from "../prisma";
import { subDays } from "date-fns";
import { Project, Tag } from "../models/entities";

export const assignTicket = async (ticket: Ticket, employees: Role[]) => {
  const states = await prisma.ticketWorkflowState.findMany({
    where: {
      ticketId: ticket.id,
    },
  });

  for (const state of states) {
    const estimateMinimum = Math.ceil(Math.random() * 4 * 10) * 15 * 60;
    const estimateMostLikely =
      estimateMinimum + Math.ceil(Math.random() * 4 * 10) * 15 * 60;
    const estimateMaximum =
      estimateMostLikely + Math.ceil(Math.random() * 4 * 10) * 15 * 60;

    await prisma.ticketWorkflowState.update({
      where: { id: state.id },
      data: {
        assigneeId: sample(employees)!.id,
        estimateMinimum,
        estimateMostLikely,
        estimateMaximum,
        fractionable: Math.random() > 0.9,
      },
    });
  }
};

export const addAncestorsToTicket = async (
  ticket: Ticket,
  ancestors: Ticket[]
) => {
  if (ancestors.length > 0) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        ancestors: {
          connect: ancestors.map(({ id }) => ({ id })),
        },
      },
    });
  }
};

export const createTicket = async (
  product: Product,
  workflow: Workflow,
  project: Project,
  author: Role,
  values?: Partial<Prisma.TicketCreateInput>
): Promise<Ticket> => {
  const data: Prisma.TicketCreateInput = {
    title: `${faker.hacker.ingverb()} ${faker.hacker.noun()} ${faker.hacker.adjective()}`,
    description: faker.hacker.phrase(),
    difficulty: sample([1, 1, 2, 2, 2, 3, 3, 3, 3, 5, 5, 8, 8, 13]),
    status: TicketStatus.SCHEDULED,
    scheduledAt: subDays(new Date(), Math.round(Math.random() * 90)),
    stage: ModelStage.PUBLISHED,
    organization: { connect: { id: product.organizationId } },
    author: { connect: { id: author.id } },
    product: { connect: { id: product.id } },
    workflow: { connect: { id: workflow.id } },
    project: { connect: { id: project.id } },
    ...values,
  };

  if (data.stage !== ModelStage.DRAFT) {
    const last_ticket = await prisma.ticket.findFirst({
      where: {
        productId: product.id,
        stage: { not: ModelStage.DRAFT },
      },
      select: { localId: true },
      orderBy: { localId: "desc" },
    });
    data.localId = last_ticket?.localId ? last_ticket.localId + 1 : 1;
  }

  const ticket = await prisma.ticket.create({ data });

  // only create ticket workflow states if the ticket has been published
  if (data.stage !== ModelStage.DRAFT) {
    // We'll attempt to set the initial state of the ticket
    const states = await prisma.workflowState.findMany({
      where: { workflowId: workflow.id },
      orderBy: { position: "asc" },
    });

    // create all the ticket workflow states to be associated with this ticket at once
    await prisma.ticketWorkflowState.createMany({
      data: states.map((tws) => ({
        workflowStateId: tws.id,
        position: tws.position,
        name: tws.name,
        ticketId: ticket.id,
      })),
    });
  }

  return ticket;
};

export const setTicketFeatures = async (
  ticket: Ticket,
  features: Feature[]
): Promise<Ticket> => {
  return prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      features: {
        set: features.map(({ id }) => ({ id })),
      },
    },
  });
};

export const setTicketTags = async (
  ticket: Ticket,
  tags: Tag[]
): Promise<Ticket> => {
  return prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      tags: {
        set: tags.map(({ id }) => ({ id })),
      },
    },
  });
};
