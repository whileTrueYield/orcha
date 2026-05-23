import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  ObjectType,
} from "type-graphql";

import { IsIn, Length } from "class-validator";
import {
  Organization,
  OrganizationStatus,
  RoleType,
  RoleStatus,
  ModelStage,
  Project,
} from "@generated/type-graphql";
import { AppContext, AuthUserContext } from "../../../types";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import initialWorkflows from "./initialWorkflows.json";
import initialTags from "./initialTags.json";
import { findOrganizationByName } from "../helper";
import prisma from "../../../prisma";
import { DEFAULT_WORK_WEEK } from "../../entities";
import { listTimeZones } from "timezone-support";
import { Role } from "@prisma/client";
import gettingStartedProject from "./GettingStartedProject.json";
import * as Y from "yjs";
import { tiptapToYdoc } from "../../../utils/tiptap";

@InputType()
class CreateOrganizationInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field()
  @Length(1, 128)
  userName: string;

  @Field()
  @IsIn(listTimeZones())
  timeZone: string;
}

@ObjectType()
class NewOrganization {
  @Field(() => Organization)
  organization: Organization;

  @Field(() => Project)
  project: Project;
}

@Resolver(NewOrganization)
export class CreateOrganizationResolver {
  @Mutation(() => NewOrganization)
  @UseMiddleware(isAuthenticated)
  async createOrganization(
    @Arg("input") input: CreateOrganizationInput,
    @Ctx() ctx: AppContext<AuthUserContext>,
  ): Promise<NewOrganization> {
    const existingOrganization = await findOrganizationByName(input.name);

    if (existingOrganization) {
      new UserInputError("An organization with the same name already exists");
    }

    const organization = await ctx.prisma.organization.create({
      data: {
        name: input.name,
        status: OrganizationStatus.ACTIVE,
      },
    });

    const role = await ctx.prisma.role.create({
      data: {
        organizationId: organization.id,
        name: input.userName,
        userId: ctx.me.userId,
        type: RoleType.OWNER,
        status: RoleStatus.ACCEPTED,
        workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
        timeZone: input.timeZone,
      },
    });

    await this.createDefaultWorkflow(organization);
    await this.createDefaultTags(organization, role);
    // make sure createDefaultPriorities is called after default tag creation
    await this.createDefaultPriorities(organization);
    await this.createFirstProduct(organization);
    const project = await createGettingStartedProject([role], organization);

    return { organization, project };
  }

  async createDefaultWorkflow(organization: Organization) {
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

  async createDefaultTags(organization: Organization, role: Role) {
    return prisma.tag.createMany({
      data: initialTags.tags.map(({ name, color }) => ({
        name: name,
        organizationId: organization.id,
        color: color,
        authorId: role.id,
      })),
    });
  }

  /**
   * Use all default tags to set initial priorities
   */
  async createDefaultPriorities(organization: Organization) {
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

  async createFirstProduct(organization: Organization) {
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
}

/**
 * Creates a Getting Started Project to help new user get a footing.
 * This also adds the project to every existing roles. This is useful
 * for the demo since we create 10 roles all at once.
 * @param roles
 * @param organization
 * @returns
 */
export const createGettingStartedProject = async (
  roles: Role[],
  organization: Organization,
) => {
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
      data: {
        pinnedProjects: {
          connect: { id: project.id },
        },
      },
    }),
  );

  await Promise.all(roleUpdates);

  const doc = tiptapToYdoc(gettingStartedProject);
  await prisma.projectText.create({
    data: {
      projectId: project.id,
      bytes: Buffer.from(Y.encodeStateAsUpdate(doc)),
    },
  });

  return project;
};
