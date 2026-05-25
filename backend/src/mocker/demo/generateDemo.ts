import YAML from "yaml";
import fs from "fs";
import * as path from "path";
import * as Y from "yjs";

import { createOrganization } from "../organization";
import { createRole, createUser } from "../employee";
import { createProduct } from "../product";
import { runSimulation } from "../simulateWork";
import { createTicket, setTicketTags } from "../ticket";
import { createTag } from "../tag";
import { createWorkflow, createWorkflowState } from "../workflow";
import {
  Product,
  Project,
  Role,
  RoleType,
  User,
  Workflow,
  Ticket,
  Tag,
  TicketStatus,
  ModelStage,
  RoleStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import prisma from "../../prisma";
import {
  capitalize,
  filter,
  keyBy,
  map,
  random,
  sample,
  sampleSize,
} from "lodash";
import { requestEstimate } from "../../models/ticket/jobs/estimateTickets";
import {
  FIRST_HALF_WORK_WEEK,
  FULL_TIME_WORK_WEEK,
  SECOND_HALF_WORK_WEEK,
  WEEK_END_WORK_WEEK,
} from "../utils";
import { WorkWeekTime } from "../../models/entities";
import { createRandomComments } from "./createRandomComments";
import { config } from "../../config";
import { markdownToTipTapDoc } from "./markdownToDoc";
import { logger } from "../../logger";
import { tiptapToYdoc } from "../../utils/tiptap";
import { waitFor } from "../../utils";

const WORK_HOURS: { [name: string]: WorkWeekTime } = {
  FIRST_HALF_WORK_WEEK: FIRST_HALF_WORK_WEEK,
  FULL_TIME_WORK_WEEK: FULL_TIME_WORK_WEEK,
  SECOND_HALF_WORK_WEEK: SECOND_HALF_WORK_WEEK,
  WEEK_END_WORK_WEEK: WEEK_END_WORK_WEEK,
};

export async function generateDemo() {
  // do not activate the feature flags
  const organization = await createOrganization(undefined, false);

  const globalPassword = faker.internet.password({
    length: 20,
    memorable: true,
  });

  // Generate the users and their respective roles
  logger.info("Generating users and roles");
  const userFile = fs.readFileSync(path.join(__dirname, "seed/users.yml"));
  const userData = YAML.parse(userFile.toString());
  const roles: Array<Awaited<ReturnType<typeof createRole>>> = [];
  const users: User[] = [];
  const tickets: Ticket[] = [];

  for (const userInfo of userData.users) {
    const userRecord = await createUser({
      email: userInfo.email.replace("@", `-${organization.id}@`),
      password: globalPassword,
    });

    users.push(userRecord);

    // default to full time work week if none provided
    const workWeek = WORK_HOURS[userInfo.hours] || FULL_TIME_WORK_WEEK;

    const roleRecord = await createRole(organization, userRecord, {
      title: userInfo.title,
      type:
        userInfo.role === "admin"
          ? RoleType.ADMIN
          : userInfo.role === "owner"
            ? RoleType.OWNER
            : RoleType.MEMBER,
      name: userInfo.name,
      timeZone: userInfo.timeZone,
      workWeek: JSON.stringify(workWeek),
      avatarUrl: userInfo.avatarUrl
        ? `${config.uploadCdnUri}/${userInfo.avatarUrl}`
        : undefined,
      status:
        userInfo.status === "INVITED"
          ? RoleStatus.INVITED
          : RoleStatus.ACCEPTED,
    });

    roles.push(roleRecord);
  }
  logger.info("DONE! (Generating users and roles)");

  // Generate the products
  logger.info("Generating products");
  const productFile = fs.readFileSync(
    path.join(__dirname, "seed/products.yml"),
  );
  const productData = YAML.parse(productFile.toString());
  const products: { [name: string]: Product } = {};
  for (const productInfo of productData.products) {
    const productRecord = await createProduct(organization, {
      name: productInfo.name,
      code: productInfo.code,
      description: productInfo.description,
      coverUrl: productInfo.coverUrl
        ? `${config.uploadCdnUri}/${productInfo.coverUrl}`
        : undefined,
    });

    products[productInfo.name.toLowerCase()] = productRecord;
  }
  logger.info("DONE! (Generating products)");

  logger.info("Generating workflows");
  // Generate the workflows
  const workflowFile = fs.readFileSync(
    path.join(__dirname, "seed/workflows.yml"),
  );
  const workflowData = YAML.parse(workflowFile.toString());
  const workflows: { [name: string]: Workflow } = {};
  for (const workflowInfo of workflowData) {
    try {
      const workflow = await createWorkflow(organization, {
        name: capitalize(workflowInfo.name),
        description: workflowInfo.description,
      });

      // create the workflow state with a position and add the teams to it
      let index = 0;
      for (const state of workflowInfo.states) {
        await createWorkflowState(workflow, {
          name: state.name,
          position: index++,
        });
      }

      workflows[workflow.name.toLowerCase()] = workflow;
      await waitFor(2000);
    } catch (error) {
      logger.error(`Error creating workflow state: ${error}`);
      throw new Error(`Error creating workflow state: ${error}`);
    }
  }
  logger.info("DONE! (Generating workflows)");

  logger.info("Generating projects");
  // Generate the projects
  const projectFile = fs.readFileSync(
    path.join(__dirname, "seed/projects.yml"),
  );
  const projectData = YAML.parse(projectFile.toString());
  const projects: { [name: string]: Project } = {};
  const createdTags: { [name: string]: Tag } = {};

  for (const projectInfo of projectData.projects) {
    if (projectInfo.parentProject && !projects[projectInfo.parentProject]) {
      throw new Error(
        `Could not find parent project "${projectInfo.parentProject}"`,
      );
    }

    const projectRecord = await prisma.project.create({
      data: {
        name: projectInfo.title,
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
        indexableContent: projectInfo.body,
        parentId: projectInfo.parentProject
          ? projects[projectInfo.parentProject].id
          : undefined,
      },
    });

    projects[projectRecord.name] = projectRecord;
    const tipTapDoc = markdownToTipTapDoc(projectInfo.body);
    if (tipTapDoc.content.length) {
      const doc = tiptapToYdoc(tipTapDoc);

      await prisma.projectText.create({
        data: {
          projectId: projectRecord.id,
          bytes: Buffer.from(Y.encodeStateAsUpdate(doc)),
        },
      });
    }

    const admins = filter(roles, { type: RoleType.ADMIN });

    const workflowByName = keyBy(workflowData, (workflow) =>
      workflow.name.toLowerCase(),
    );

    // create the tickets in this project
    for (const ticketInfo of projectInfo.tickets || []) {
      const author = sample(admins) as Role;
      const description = Array.isArray(ticketInfo.description)
        ? ticketInfo.description.join("\n\n")
        : ticketInfo.description;

      const ticket = await createTicket(
        products[ticketInfo.product.toLowerCase()],
        workflows[ticketInfo.workflow.toLowerCase()],
        projectRecord,
        author,
        {
          title: ticketInfo.title,
          indexableContent: description,
          description,
          owner: { connect: { id: sample(roles)!.id } },
          milestone: !!ticketInfo.milestone,
          status: projectInfo.unscheduled
            ? TicketStatus.UNSCHEDULED
            : TicketStatus.SCHEDULED,
          // if the ticket is unscheduled, we are requesting estimates
          estimating: !!projectInfo.unscheduled,
        },
      );

      const tipTapDoc = markdownToTipTapDoc(ticketInfo.description);
      if (tipTapDoc.content.length) {
        logger.info(`Generating ticket description for ${ticketInfo.title}`);
        const doc = tiptapToYdoc(tipTapDoc);

        await prisma.ticketText.create({
          data: {
            ticketId: ticket.id,
            bytes: Buffer.from(Y.encodeStateAsUpdate(doc)),
          },
        });
      } else {
        logger.warn(
          "Could not generate ticket description for",
          ticketInfo.title,
        );
        logger.warn("Description:", ticketInfo.description);
      }

      tickets.push(ticket);

      if (ticketInfo.tags) {
        const ticketTags: Tag[] = [];
        for (const tag of ticketInfo.tags) {
          if (tag in createdTags) {
            ticketTags.push(createdTags[tag]);
          } else {
            const newTag = await createTag(
              tag,
              organization.id,
              sample(roles)!.id,
              {
                color:
                  tag === "critical"
                    ? "red"
                    : tag === "urgent"
                      ? "orange"
                      : "blue",
              },
            );
            createdTags[newTag.name] = newTag;
            ticketTags.push(newTag);
          }
        }
        setTicketTags(ticket, ticketTags);
      }

      // if necessary for testing, un-comment the following to get
      // randomly generated comments on tickets
      if (config.isDev) {
        await createRandomComments(ticket, roles);
      }

      if (!workflowByName[ticketInfo.workflow]) {
        throw new Error(`Could not find workflow "${ticketInfo.workflow}"`);
      }

      // assign ticket + estimate
      await assignTicket(
        ticket,
        roles,
        keyBy(workflowByName[ticketInfo.workflow].states, "name"),
      );
    }

    // set dependencies
    for (const ticketInfo of projectInfo.tickets || []) {
      if (ticketInfo.after && ticketInfo.after.length > 0) {
        const tickets = await prisma.ticket.findMany({
          where: {
            title: { in: ticketInfo.after },
            organizationId: organization.id,
          },
        });

        const ticket = await prisma.ticket.findFirst({
          where: {
            title: { in: [ticketInfo.title], mode: "insensitive" },
            organizationId: organization.id,
          },
        });

        if (ticket && tickets.length) {
          await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
              ancestors: { connect: tickets.map(({ id }) => ({ id })) },
            },
          });
        }
      }
    }
  }
  logger.info("DONE! (Generating projects)");

  logger.info("Generating favorite tickets");
  // give some favorite tickets to every roles
  for (const role of roles) {
    const favoriteTicketIds = map(sampleSize(tickets, random(4, 12)), "id");
    await prisma.role.update({
      where: { id: role.id },
      data: {
        ticketsWatched: {
          connect: favoriteTicketIds.map((id) => ({ id })),
        },
      },
    });
  }
  logger.info("DONE! (Generating favorite tickets");

  logger.info("Running simulation");
  // simulate 1 weeks of work
  await runSimulation(organization.id, 7);
  logger.info("DONE! (Running simulation)");

  logger.info("Canceling 2 tickets");
  // Cancel 2 left tickets
  const ticketsToCancel = await prisma.ticket.findMany({
    where: {
      organizationId: organization.id,
      stage: ModelStage.PUBLISHED,
      status: TicketStatus.SCHEDULED,
    },
    take: 2,
  });

  await prisma.ticket.updateMany({
    where: {
      id: { in: ticketsToCancel.map(({ id }) => id) },
    },
    data: {
      status: TicketStatus.CANCELLED,
      closedAt: new Date(),
      closingNote: JSON.stringify(
        markdownToTipTapDoc(
          "We canceled this ticket because it was not needed anymore",
        ),
      ),
    },
  });
  logger.info("DONE! (Canceling 2 tickets)");

  logger.info("Requesting estimates for all tickets");
  await requestEstimate(organization.id, true);
  logger.info("DONE! (Requesting estimates for all tickets)");

  return {
    password: globalPassword,
    roles,
    organization,
  };
}

type WorkflowStateDetails = {
  [name: string]: { roles: string[]; eta: number[] };
};

export const assignTicket = async (
  ticket: Ticket,
  employees: Role[],
  workflowStates: WorkflowStateDetails,
) => {
  const states = await prisma.ticketWorkflowState.findMany({
    where: {
      ticketId: ticket.id,
    },
  });

  for (const state of states) {
    const stateConfig = workflowStates[state.name];

    const estimateMinimum = sample(stateConfig.eta)! * 3600;
    const estimateMostLikely =
      estimateMinimum + sample(stateConfig.eta)! * 3600;
    const estimateMaximum =
      estimateMostLikely + sample(stateConfig.eta)! * 3600;

    const roles = employees.filter(
      (employee) =>
        employee.title &&
        stateConfig.roles.indexOf(employee.title.toLowerCase()) > -1,
    );

    if (roles.length === 0) {
      throw new Error(
        `Could not find an employee with title ${stateConfig.roles}`,
      );
    }

    if (ticket.status === TicketStatus.UNSCHEDULED && Math.random() > 0.66) {
      // if the ticket is not scheduled, only provide estimates 50% of the time
      await prisma.ticketWorkflowState.update({
        where: { id: state.id },
        data: {
          assigneeId: sample(roles)!.id,
          fractionable: Math.random() > 0.9,
        },
      });
    } else if (
      ticket.status === TicketStatus.UNSCHEDULED &&
      Math.random() > 0.5
    ) {
      // also 60% of the time, don't assign the ticket
      return;
    } else if (
      ticket.status === TicketStatus.UNSCHEDULED &&
      Math.random() > 0.33
    ) {
      // also 60% of the time, skip the worfklow state
      await prisma.ticketWorkflowState.update({
        where: { id: state.id },
        data: {
          isActive: false,
        },
      });
    } else {
      await prisma.ticketWorkflowState.update({
        where: { id: state.id },
        data: {
          assigneeId: sample(roles)!.id,
          estimateMinimum,
          estimateMostLikely,
          estimateMaximum,
          // fractionable: Math.random() > 0.9,
          fractionable: false,
        },
      });
    }
  }
};
