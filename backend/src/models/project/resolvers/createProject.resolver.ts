/**
 * Mutation: createProject.
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { ModelStage, Prisma } from "@prisma/client";
import { findProjectByName } from "../helper";
import { AuthRoleContext } from "../../../types";
import { assertLength } from "../../../utils/validation";

export const CreateProjectInput = builder.inputType("CreateProjectInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    parentId: t.int({ required: false }),
  }),
});

builder.mutationField("createProject", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateProjectInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // Legacy contract: project name must be 1–128 chars (no empty names).
      assertLength(args.input.name, 1, 128, "name");

      const projectUsingSameName = await findProjectByName(
        args.input.name,
        args.input.parentId ?? null,
        (ctx.me as AuthRoleContext).organizationId,
      );

      if (projectUsingSameName) {
        throw new GraphQLError("This project already exists", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const projectData: Prisma.ProjectUncheckedCreateInput = {
        name: args.input.name,
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        ownerId: (ctx.me as AuthRoleContext).roleId,
        authorId: (ctx.me as AuthRoleContext).roleId,
        stage: ModelStage.PUBLISHED,
      };

      if (args.input.parentId) {
        const parentProject = await ctx.prisma.project.findFirstOrThrow({
          where: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            id: args.input.parentId,
          },
        });
        projectData.parentId = parentProject.id;
      }

      return ctx.prisma.project.create({ ...query, data: projectData });
    },
  }),
);
