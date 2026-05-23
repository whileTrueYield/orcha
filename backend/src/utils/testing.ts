import { graphql } from "graphql";
import { range, sample, map } from "lodash";
import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";
import { v4 as uuid } from "uuid";
import {
  ModelStage,
  Prisma,
  Project,
  RoleType,
  ScheduleItem,
} from "@prisma/client";

import { getSchema } from "../models";
import {
  Documentation,
  Feature,
  FeatureFlag,
  FeatureGroup,
  Organization,
  OrganizationStatus,
  Product,
  Role,
  RoleStatus,
  Ticket,
  TicketStatus,
  TicketWorkflowState,
  User,
  UserStatus,
  Workflow,
  WorkflowState,
} from "@prisma/client";

import { UserSession } from "../types";
import { Maybe } from "type-graphql";
import prisma from "../prisma";
import { DEFAULT_WORK_WEEK } from "../models/entities";

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
  session?: UserSession;
}

interface TestRoleSession {
  session: UserSession;
  user: User;
  organization: Organization;
  role: Role;
}

export const POW_HASH =
  "ee2f9c4c1971fa408e8668b0a1b5fa8abf7edcc13eec3abf2cae85010f2ca8a0:4";
export const POW_PROOF = "2640";
export const TEST_IP = "203.0.113.195";
export const TEST_IPS = ["203.0.113.195", "70.41.3.18", "150.172.238.178"];

/**
 * Return a date object with a delta of provided minutes
 * @param minutes in minute from now, can be negative for a past date
 * @returns Date object
 */
export const fromNow = (minutes: number) =>
  new Date(new Date().getTime() + minutes * 60 * 1000);

export const createRandomUserInOrg = async (
  organization: Organization,
  roleType: RoleType = RoleType.MEMBER,
  isStaff: boolean = false,
) => {
  const user = await createRandomUser(isStaff);

  // create a role in the provided organization
  const role = await prisma.role.create({
    data: {
      type: roleType,
      status: RoleStatus.ACCEPTED,
      organization: {
        connect: { id: organization.id },
      },
      user: {
        connect: { id: user.id },
      },
      coverUrl: faker.internet.url(),
      avatarUrl: faker.internet.url(),
      timeZone: "America/Los_Angeles",
      description: faker.lorem.paragraph(),
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    },
  });

  return { user, role };
};

export const createScheduleItem = async (
  role: Role,
  ticket: Ticket,
  scheduleItemInput: Partial<Prisma.ScheduleItemCreateInput> = {},
): Promise<ScheduleItem> => {
  const ticketWorkflowState = await prisma.ticketWorkflowState.findFirst({
    where: { ticketId: ticket.id },
  });

  return prisma.scheduleItem.create({
    data: {
      organization: { connect: { id: ticket.organizationId } },
      ticket: { connect: { id: ticket.id } },
      role: {
        connect: { id: role.id },
      },
      startedAt: new Date(),
      ticketWorkflowState: { connect: { id: ticketWorkflowState!.id } },
      ...scheduleItemInput,
    },
  });
};

export const createRandomOrgAndUser = async (
  roleType: RoleType = RoleType.MEMBER,
  isStaff: boolean = false,
  roleInput: Partial<Prisma.RoleCreateInput> = {},
  organization?: Organization,
): Promise<{ user: User; organization: Organization; role: Role }> => {
  const user = await createRandomUser(isStaff);
  organization = organization ? organization : await createRandomOrganization();

  // create a role for that session
  const role = await prisma.role.create({
    data: {
      type: roleType,
      status: RoleStatus.ACCEPTED,
      organization: {
        connect: { id: organization.id },
      },
      user: {
        connect: { id: user.id },
      },
      coverUrl: faker.internet.url(),
      avatarUrl: faker.internet.url(),
      timeZone: "America/Los_Angeles",
      workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
      description: faker.lorem.paragraph(),
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      ...roleInput,
    },
  });
  return { user, organization, role };
};

interface FeatureFlagArgs {
  documentation: boolean;
  support: boolean;
}

const featureFlagDefaultValues: FeatureFlagArgs = {
  documentation: true,
  support: true,
};

export const createFeatureFlagForOrg = async (
  organization: Organization,
  featureFlags?: Partial<FeatureFlagArgs>,
): Promise<FeatureFlag> => {
  return prisma.featureFlag.create({
    data: {
      organizationId: organization.id,
      ...featureFlagDefaultValues,
      ...featureFlags,
    },
  });
};

export const getTestSessionWithRole = async (
  roleType: RoleType,
  isStaff: boolean = false,
  inOrganization?: Organization,
): Promise<TestRoleSession> => {
  const { user, organization, role } = await createRandomOrgAndUser(
    roleType,
    isStaff,
    undefined,
    inOrganization,
  );

  const session: UserSession = {
    userId: user.id,
    roleId: role.id,
    organizationId: organization.id,
    roleType: roleType,
  };

  return { session, user, organization, role };
};

interface TestUserSession {
  session: UserSession;
  user: User;
}
export const getTestSession = async (
  isStaff: boolean = false,
): Promise<TestUserSession> => {
  const user = await createRandomUser(isStaff);
  const session: UserSession = { userId: user.id };
  return { session, user };
};

let cachedSchema: ReturnType<typeof getSchema>;
export const graphqlRequest = async ({
  source,
  variableValues,
  session = {},
}: Options) => {
  if (!cachedSchema) {
    cachedSchema = getSchema();
  }

  return graphql({
    schema: await cachedSchema,
    source,
    variableValues,
    contextValue: {
      prisma: prisma,
      req: {
        session: {
          ...session,
          destroy: (x: () => void) => x(),
        },
        ip: TEST_IP,
        ips: TEST_IPS,
      },
      res: {
        clearCookie: () => null,
      },
    },
  });
};

export const createRandomDocumentation = (
  organization: Organization,
): Promise<Documentation> => {
  return prisma.documentation.create({
    data: {
      organizationId: organization.id,
      name: faker.hacker.adjective() + " " + faker.hacker.noun(),
      description: faker.lorem.paragraph(),
    },
  });
};

export const createRandomProduct = (
  organization: Organization,
  values: Partial<Prisma.ProductUncheckedCreateInput> = {},
): Promise<Product> => {
  let newProduct: Prisma.ProductCreateInput;

  newProduct = {
    name: faker.commerce.productName() + getCounter(),
    code: getRandomCode(),
    description: faker.lorem.paragraph(),
    organization: {
      connect: { id: organization.id },
    },
    ...values,
  };

  return prisma.product.create({ data: newProduct });
};

export const createRandomProject = (
  organization: Organization,
  values: Partial<Prisma.ProjectUncheckedCreateInput> = {},
): Promise<Project> => {
  let newProject: Prisma.ProjectCreateInput;

  newProject = {
    name: faker.commerce.productName() + getCounter(),
    stage: ModelStage.PUBLISHED,
    organization: {
      connect: { id: organization.id },
    },
    ...values,
  };

  return prisma.project.create({ data: newProject });
};

export const createRandomWorkflow = async (
  organization: Organization,
  values: Partial<Prisma.WorkflowUncheckedCreateInput> = {},
): Promise<Workflow> => {
  const workflow = await prisma.workflow.create({
    data: {
      name: faker.lorem.word() + getCounter(),
      organizationId: organization.id,
      workflowStates: {
        create: [
          {
            position: 1,
            name: "draft",
            organization: { connect: { id: organization.id } },
          },
          {
            position: 2,
            name: "active",
            organization: { connect: { id: organization.id } },
          },
          {
            position: 3,
            name: "done",
            organization: { connect: { id: organization.id } },
          },
        ],
      },
      ...values,
    },
  });

  return workflow;
};

interface RandomFeature {
  feature: Feature;
  featureGroup: FeatureGroup;
  product: Product;
}

export const createRandomFeature = async (
  organization: Organization,
  product?: Product,
  featureGroup?: FeatureGroup,
): Promise<RandomFeature> => {
  if (!product) {
    product = await createRandomProduct(organization);
  }
  if (!featureGroup) {
    featureGroup = await prisma.featureGroup.create({
      data: {
        organizationId: organization.id,
        productId: product.id,
        name: `${getRandomCode()} ${faker.lorem.word()}`,
      },
    });
  }

  const feature = await prisma.feature.create({
    data: {
      featureGroupId: featureGroup.id,
      name: `${getRandomCode()} ${faker.lorem.word()}`,
    },
  });

  return { feature, featureGroup, product };
};

interface RandomTicket {
  ticket: Ticket;
  product: Product;
  workflow: Workflow;
  states: WorkflowState[];
  ticketWorkflowStates: TicketWorkflowState[];
}

export const createRandomTicket = async (
  organization: Organization,
  role: Role,
  product?: Product,
  values: Partial<Prisma.TicketCreateInput> = {},
): Promise<RandomTicket> => {
  const workflow = await createRandomWorkflow(organization);
  const project = await createRandomProject(organization);

  if (!product) {
    product = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });
  }

  const last_ticket = await prisma.ticket.findFirst({
    where: {
      productId: product.id,
      organizationId: organization.id,
    },
    select: { localId: true },
    orderBy: { localId: "desc" },
  });

  const ticket = await prisma.ticket.create({
    data: {
      localId: last_ticket?.localId ? last_ticket.localId + 1 : 1,
      title: faker.commerce.productName() + getCounter(),
      description: faker.lorem.paragraph(),
      stage: ModelStage.PUBLISHED,
      status: TicketStatus.SCHEDULED,
      product: { connect: { id: product.id } },
      organization: { connect: { id: organization.id } },
      author: { connect: { id: role.id } },
      workflow: { connect: { id: workflow.id } },
      project: { connect: { id: project.id } },
      ...values,
    },
  });

  // We'll attempt to set the initial state of the ticket
  const states = await prisma.workflowState.findMany({
    where: { workflowId: workflow.id },
    orderBy: { position: "asc" },
  });

  // create all the ticket workflow states to be associated with this ticket at once
  const ticketWorkflowStates = await Promise.all(
    states.map((state) =>
      prisma.ticketWorkflowState.create({
        data: {
          workflowStateId: state.id,
          name: state.name,
          position: state.position,
          ticketId: ticket.id,
          assigneeId: role.id,
          estimateMinimum: 3600,
          estimateMostLikely: 3600 * 2,
          estimateMaximum: 3600 * 3,
        },
      }),
    ),
  );

  return { ticket, product, workflow, states, ticketWorkflowStates };
};

export const getRandomCode = (length: number = 5): string => {
  const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM";
  return map(range(length), () => sample(alphabet)).join("");
};

export const createRandomUser = async (
  isStaff: boolean = false,
): Promise<User> => {
  return prisma.user.create({
    data: {
      password: await hash("password", 2),
      email: getCounter() + faker.internet.email().toLowerCase(),
      status: UserStatus.ACTIVE,
      isStaff,
    },
  });
};

export const createRandomOrganization = async (): Promise<Organization> => {
  const organization = await prisma.organization.create({
    data: {
      name: faker.company.buzzNoun() + uuid(),
      about: faker.lorem.paragraph(),
      status: OrganizationStatus.ACTIVE,
    },
  });

  const address = await prisma.organizationAddress.create({
    data: {
      address1: `${faker.location.streetAddress()}`,
      city: `${faker.location.city()}`,
      zipcode: `${faker.location.zipCode()}`,
      state: `${faker.location.state()}`,
      country: `${faker.location.country()}`,
      organization: {
        connect: { id: organization.id },
      },
    },
  });

  return prisma.organization.update({
    where: { id: organization.id },
    data: {
      billingAddress: {
        connect: { id: address.id },
      },
    },
    include: {
      billingAddress: true,
    },
  });
};

const getCounter = (): string =>
  Math.floor(Math.random() * Math.floor(9 ** 10)).toString();
