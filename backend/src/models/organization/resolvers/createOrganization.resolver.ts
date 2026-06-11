/**
 * Mutation resolver for creating a new Organisation.
 *
 * Registers: Mutation.createOrganization(input: CreateOrganizationInput!): NewOrganization!
 *
 * Requires the caller to be authenticated (not necessarily linked to an org).
 * Creates the organisation, the caller's owner Role, default workflows,
 * default tags, priorities, a first product, and a getting-started project.
 *
 * The NewOrganization type bundles the organisation and the initial project
 * so the frontend can redirect the user immediately.
 */

import { GraphQLError } from "graphql";
import {
  OrganizationStatus,
  RoleType,
  RoleStatus,
  ModelStage,
  Organization,
  Project,
  Role,
} from "@prisma/client";
import builder from "../../../schema/builder";
import { OrganizationRef } from "../entity";
import { ProjectRef } from "../../project/entity";
import { findOrganizationByName } from "../helper";
import prisma from "../../../prisma";
import { DEFAULT_WORK_WEEK } from "../../entities";
import initialWorkflows from "./initialWorkflows.json";
import initialTags from "./initialTags.json";
import { AuthUserContext } from "../../../types";
import { writeDocumentBody } from "../../documentBody/writeDocumentBody";
import { GETTING_STARTED_BODY } from "../gettingStartedBody";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateOrganizationInput = builder.inputType("CreateOrganizationInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    userName: t.string({ required: true }),
    timeZone: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// NewOrganization — bundles the org and the first project
// ---------------------------------------------------------------------------

const NewOrganizationRef = builder.objectRef<{
  organization: Organization;
  project: Project;
}>("NewOrganization");

builder.objectType(NewOrganizationRef, {
  fields: (t) => ({
    organization: t.prismaField({
      type: OrganizationRef,
      resolve: (_query, parent) => parent.organization,
    }),
    project: t.prismaField({
      type: ProjectRef,
      resolve: (_query, parent) => parent.project,
    }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createOrganization", (t) =>
  t.field({
    type: NewOrganizationRef,
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: CreateOrganizationInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const existing = await findOrganizationByName(args.input.name);

      if (existing) {
        throw new GraphQLError(
          "An organization with the same name already exists",
        );
      }

      const organization = await ctx.prisma.organization.create({
        data: {
          name: args.input.name,
          status: OrganizationStatus.ACTIVE,
        },
      });

      const role = await ctx.prisma.role.create({
        data: {
          organizationId: organization.id,
          name: args.input.userName,
          userId: (ctx.me as AuthUserContext).userId,
          type: RoleType.OWNER,
          status: RoleStatus.ACCEPTED,
          workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
          timeZone: args.input.timeZone,
        },
      });

      await createDefaultWorkflow(organization);
      await createDefaultTags(organization, role);
      await createDefaultPriorities(organization);
      await createFirstProduct(organization);
      const project = await createGettingStartedProject([role], organization);

      return { organization, project };
    },
  }),
);

// ---------------------------------------------------------------------------
// Setup helpers — extracted from the old class methods
// ---------------------------------------------------------------------------

async function createDefaultWorkflow(organization: Organization) {
  for (const initialWorkflow of initialWorkflows.workflows) {
    const workflowStates = initialWorkflow.states.map((state, index) => ({
      name: state.name,
      organization: { connect: { id: organization.id } },
      position: index,
    }));

    await prisma.workflow.create({
      data: {
        name: initialWorkflow.name,
        stage: ModelStage.PUBLISHED,
        organization: { connect: { id: organization.id } },
        workflowStates: { create: workflowStates },
        color: initialWorkflow.color,
      },
    });
  }
}

async function createDefaultTags(organization: Organization, role: Role) {
  return prisma.tag.createMany({
    data: initialTags.tags.map(({ name, color }) => ({
      name,
      organizationId: organization.id,
      color,
      authorId: role.id,
    })),
  });
}

async function createDefaultPriorities(organization: Organization) {
  const tags = await prisma.tag.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: "asc" },
  });

  return Promise.all(
    tags.map((tag, index) =>
      prisma.scheduleConfig.create({
        data: {
          priority: index + 1,
          organizationId: organization.id,
          tags: { connect: { id: tag.id } },
        },
      }),
    ),
  );
}

async function createFirstProduct(organization: Organization) {
  await prisma.product.create({
    data: {
      name: "My First Product",
      code: "TWKS",
      description:
        "We've created this product to get your started.\n\nChange its name and code to match yours.",
      stage: ModelStage.PUBLISHED,
      organizationId: organization.id,
    },
  });
}

/**
 * Creates a Getting Started Project to help new users get a footing.
 * Also pins it to every provided role.
 */
export async function createGettingStartedProject(
  roles: Role[],
  organization: Organization,
) {
  const project = await prisma.project.create({
    data: {
      name: "Getting Started Project",
      stage: ModelStage.PUBLISHED,
      organization: { connect: { id: organization.id } },
    },
  });

  const roleUpdates = roles.map((role) =>
    prisma.role.update({
      where: { id: role.id },
      data: { pinnedProjects: { connect: { id: project.id } } },
    }),
  );

  await Promise.all(roleUpdates);

  // Seed the project body as Markdown (ADR 0007) through the shared write
  // service, so the seed populates `indexableContent` for search exactly like a
  // user edit would. base 0: the body is unwritten, so this is a fast-forward.
  await writeDocumentBody({
    type: "project",
    id: project.id,
    markdown: GETTING_STARTED_BODY,
    baseVersion: 0,
    organizationId: organization.id,
    actorRoleId: roles[0].id,
  });

  return project;
}
