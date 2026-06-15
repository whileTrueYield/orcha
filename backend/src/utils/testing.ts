import { createHash, randomUUID } from "crypto";
import { graphql } from "graphql";
import { range, sample, map } from "lodash";
import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";
import { v4 as uuid } from "uuid";
import {
  EstimateType,
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

import {
  OAuthAccessToken,
  OAuthClient,
  OAuthRefreshToken,
  PersonalAccessToken,
} from "@prisma/client";
import { UserSession } from "../types";
// Maybe<T> is T | null — simple utility type previously from type-graphql
type Maybe<T> = T | null | undefined;
import prisma from "../prisma";
import { DEFAULT_WORK_WEEK } from "../models/entities";
import { buildMeContext } from "../middlewares/isAuthenticated";
import { generateToken } from "../models/apiToken/token";
import { formatGraphQLError } from "./graphqlErrors";

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

interface TestApiToken {
  plaintext: string;
  token: PersonalAccessToken;
  user: User;
  organization: Organization;
  role: Role;
}

/**
 * Mint a Personal Access Token bound to a freshly-created org/user/role, the
 * way the REST bearer middleware expects to find one in the database.
 *
 * Returns the one-time `plaintext` (what a client puts in the Authorization
 * header) alongside the persisted row and its owning role/org/user, so a test
 * can both present the token and assert against what it resolves to.
 *
 * `tokenOptions` covers the lifecycle states REST specs need to exercise —
 * read-only, revoked, expired — without each spec re-deriving the hashing.
 */
export const getTestApiToken = async (
  tokenOptions: Partial<{
    name: string;
    readOnly: boolean;
    revokedAt: Date;
    expiresAt: Date;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestApiToken> => {
  const { user, organization, role } = await createRandomOrgAndUser(roleType);
  const { plaintext, hash, prefix } = generateToken();

  const token = await prisma.personalAccessToken.create({
    data: {
      name: tokenOptions.name ?? "test token",
      tokenHash: hash,
      tokenPrefix: prefix,
      roleId: role.id,
      organizationId: organization.id,
      readOnly: tokenOptions.readOnly ?? false,
      revokedAt: tokenOptions.revokedAt,
      expiresAt: tokenOptions.expiresAt,
    },
  });

  return { plaintext, token, user, organization, role };
};

interface TestOAuthToken {
  plaintext: string;
  token: OAuthAccessToken;
  client: OAuthClient;
  user: User;
  organization: Organization;
  role: Role;
}

/**
 * Mint an OAuth access token bound to a freshly-created org/user/role and a
 * registered client, the way the MCP bearer stack expects to find one. Mirrors
 * getTestApiToken for the OAuth lifecycle states the seam tests exercise
 * (read-only, revoked, expired).
 */
export const getTestOAuthToken = async (
  tokenOptions: Partial<{
    readOnly: boolean;
    revokedAt: Date;
    expiresAt: Date;
    scope: string;
    familyId: string;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestOAuthToken> => {
  const { user, organization, role } = await createRandomOrgAndUser(roleType);
  const { generateAccessToken } = await import("../mcp/oauth/accessTokens");
  const { hashToken } = await import("../models/apiToken/token");
  const plaintext = generateAccessToken();

  const client = await prisma.oAuthClient.create({
    data: { clientId: getRandomCode(12), redirectUris: ["http://localhost/cb"] },
  });

  const token = await prisma.oAuthAccessToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      scope: tokenOptions.scope ?? "read write",
      readOnly: tokenOptions.readOnly ?? false,
      familyId: tokenOptions.familyId ?? randomUUID(),
      revokedAt: tokenOptions.revokedAt,
      expiresAt: tokenOptions.expiresAt ?? fromNow(60),
      clientId: client.id,
      roleId: role.id,
      organizationId: organization.id,
    },
  });

  return { plaintext, token, client, user, organization, role };
};

export interface TestRefreshToken {
  plaintext: string;
  token: OAuthRefreshToken;
  client: OAuthClient;
  user: User;
  organization: Organization;
  role: Role;
}

// Seeds an oauth_refresh_token row directly so tests can construct arbitrary
// states (spent via rotatedAt, revoked, expired) without driving a full flow.
export const getTestRefreshToken = async (
  tokenOptions: Partial<{
    readOnly: boolean;
    revokedAt: Date;
    rotatedAt: Date;
    expiresAt: Date;
    scope: string;
    familyId: string;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestRefreshToken> => {
  const { user, organization, role } = await createRandomOrgAndUser(roleType);
  const { generateRefreshToken } = await import("../mcp/oauth/refreshTokens");
  const { hashToken } = await import("../models/apiToken/token");
  const plaintext = generateRefreshToken();

  const client = await prisma.oAuthClient.create({
    data: { clientId: getRandomCode(12), redirectUris: ["http://localhost/cb"] },
  });

  const token = await prisma.oAuthRefreshToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      familyId: tokenOptions.familyId ?? randomUUID(),
      scope: tokenOptions.scope ?? "read write",
      readOnly: tokenOptions.readOnly ?? false,
      rotatedAt: tokenOptions.rotatedAt,
      revokedAt: tokenOptions.revokedAt,
      expiresAt: tokenOptions.expiresAt ?? fromNow(60),
      clientId: client.id,
      roleId: role.id,
      organizationId: organization.id,
    },
  });

  return { plaintext, token, client, user, organization, role };
};

export interface TestGrant {
  familyId: string;
  client: OAuthClient;
  accessPlaintext: string;
  refreshPlaintext: string;
  accessToken: OAuthAccessToken;
  refreshToken: OAuthRefreshToken;
  user: User;
  organization: Organization;
  role: Role;
}

/**
 * Seed a complete OAuth grant — one connected client the way a real connect
 * leaves the database: an OAuthClient plus an access token AND a refresh token
 * sharing one familyId/role/org. The grant abstraction (mcp/oauth/grants) keys
 * off exactly this shape, so listing and revocation tests need the whole chain,
 * not the single-token rows getTestOAuthToken / getTestRefreshToken seed.
 *
 * Pass an existing `organization` + `role` to attach several grants to one Role
 * (listing / tenant-scoping tests); omit them to mint a fresh org/user/role.
 */
export const getTestGrant = async (
  tokenOptions: Partial<{
    scope: string;
    readOnly: boolean;
    familyId: string;
    lastUsedAt: Date;
    expiresAt: Date;
    revokedAt: Date;
    rotatedAt: Date;
    clientName: string;
    organization: Organization;
    role: Role;
    client: OAuthClient;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestGrant> => {
  let { organization, role } = tokenOptions;
  let user: User;
  if (organization && role) {
    user = await prisma.user.findUniqueOrThrow({ where: { id: role.userId } });
  } else {
    const created = await createRandomOrgAndUser(roleType);
    organization = created.organization;
    role = created.role;
    user = created.user;
  }

  const { hashToken } = await import("../models/apiToken/token");
  const { generateAccessToken } = await import("../mcp/oauth/accessTokens");
  const { generateRefreshToken } = await import("../mcp/oauth/refreshTokens");

  const client =
    tokenOptions.client ??
    (await prisma.oAuthClient.create({
      data: {
        clientId: getRandomCode(12),
        name: tokenOptions.clientName ?? faker.company.name(),
        redirectUris: ["http://localhost/cb"],
      },
    }));

  const familyId = tokenOptions.familyId ?? randomUUID();
  const scope = tokenOptions.scope ?? "read write";
  const readOnly = tokenOptions.readOnly ?? false;
  const expiresAt = tokenOptions.expiresAt ?? fromNow(60);

  const accessPlaintext = generateAccessToken();
  const accessToken = await prisma.oAuthAccessToken.create({
    data: {
      tokenHash: hashToken(accessPlaintext),
      scope,
      readOnly,
      familyId,
      lastUsedAt: tokenOptions.lastUsedAt,
      revokedAt: tokenOptions.revokedAt,
      expiresAt,
      clientId: client.id,
      roleId: role.id,
      organizationId: organization.id,
    },
  });

  const refreshPlaintext = generateRefreshToken();
  const refreshToken = await prisma.oAuthRefreshToken.create({
    data: {
      tokenHash: hashToken(refreshPlaintext),
      familyId,
      scope,
      readOnly,
      rotatedAt: tokenOptions.rotatedAt,
      revokedAt: tokenOptions.revokedAt,
      expiresAt,
      clientId: client.id,
      roleId: role.id,
      organizationId: organization.id,
    },
  });

  return {
    familyId,
    client,
    accessPlaintext,
    refreshPlaintext,
    accessToken,
    refreshToken,
    user,
    organization,
    role,
  };
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

  // Mirror the production Apollo context factory: build `me` from the session
  // so authScopes and resolvers see the same shape they do at runtime.
  const req = {
    session: {
      ...session,
      destroy: (x: () => void) => x(),
    },
    ip: TEST_IP,
    ips: TEST_IPS,
  };

  const result = await graphql({
    schema: await cachedSchema,
    source,
    variableValues,
    contextValue: {
      prisma: prisma,
      req,
      res: {
        clearCookie: () => null,
      },
      me: buildMeContext(req as never),
    },
  });

  // Mirror HTTP transport: the wire serialises the response to JSON, so scalars
  // like DateTime reach clients as ISO strings rather than the in-memory Date
  // objects graphql() returns. Round-trip `data` so assertions match the shape
  // a real client receives.
  //
  // Errors are run through the same normaliser the production Apollo
  // `formatError` hook uses, so Prisma "record not found" failures surface the
  // clean "No {Model} found" message clients actually receive.
  return {
    ...result,
    data: result.data
      ? JSON.parse(JSON.stringify(result.data))
      : result.data,
    errors: result.errors
      ? result.errors.map(formatGraphQLError)
      : result.errors,
  };
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
  values: Partial<Prisma.ProjectCreateInput> = {},
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

/**
 * Seed a ticket that surfaces in the caller's `myNextTickets` (the MCTS work
 * queue) without standing up the real scheduler.
 *
 * getMyNextTickets keys off the latest Estimate epoch for the organization: a
 * SCHEDULED ticket only appears when its first active workflow state has an
 * Estimate row at that epoch assigned to the role, and the queue is ordered by
 * each estimate's `start`. This builds exactly that — a scheduled ticket plus
 * the one Estimate that makes it "next".
 *
 * Pass distinct `start` values across tickets in one test to fix their relative
 * order; keep `epoch` constant within a test so all seeded tickets share the
 * latest epoch (it is per-organization, and each token gets its own org).
 */
export const seedNextTicket = async (
  organization: Organization,
  role: Role,
  values: Partial<{ epoch: number; start: number }> = {},
): Promise<{ ticket: Ticket; ticketWorkflowState: TicketWorkflowState }> => {
  const { ticket, ticketWorkflowStates } = await createRandomTicket(
    organization,
    role,
    undefined,
    { status: TicketStatus.SCHEDULED },
  );
  // The first active state (lowest position) is the one getMyNextTickets ranks
  // for an untouched ticket; its id IS the Estimate's id (the AI keys estimates
  // by the record they describe).
  const firstState = ticketWorkflowStates[0];
  const epoch = values.epoch ?? 1_700_000_000;
  const start = values.start ?? 0;
  const end = start + 3600;

  await prisma.estimate.create({
    data: {
      id: firstState.id,
      organizationId: organization.id,
      type: EstimateType.TicketWorkflowState,
      epoch,
      updatedEpoch: epoch,
      assigneeId: role.id,
      start,
      start_min: start,
      start_max: start,
      start_p50: start,
      start_p70: start,
      start_p80: start,
      start_p90: start,
      start_p95: start,
      end,
      end_min: end,
      end_max: end,
      end_p50: end,
      end_p70: end,
      end_p80: end,
      end_p90: end,
      end_p95: end,
    },
  });

  return { ticket, ticketWorkflowState: firstState };
};

export const getRandomCode = (length: number = 5): string => {
  const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM";
  return map(range(length), () => sample(alphabet)).join("");
};

// The S256 challenge for a PKCE verifier: base64url(sha256(verifier)).
export const pkceChallengeFor = (verifier: string): string =>
  createHash("sha256").update(verifier).digest("base64url");

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
