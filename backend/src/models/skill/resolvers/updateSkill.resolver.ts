/**
 * UpdateSkill mutation — allows admins/owners to set a skill value.
 *
 * Exports: none (side-effect: registers `updateSkill` mutation on the builder).
 *
 * Requires ADMIN or OWNER role. The skill value is clamped to [0, 5]
 * via manual validation (Pothos does not have class-validator, so we
 * replicate the @Max(5) @Min(0) decorators in the resolver).
 */

import { GraphQLError } from "graphql";
import { RoleType } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateSkillInput = builder.inputType("UpdateSkillInput", {
  fields: (t) => ({
    value: t.float({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateSkill", (t) =>
  t.prismaField({
    type: "Skill",
    authScopes: { hasRole: [RoleType.ADMIN, RoleType.OWNER] },
    args: {
      skillId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateSkillInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;
      const { value } = args.input;

      // Replaces the class-validator @Max(5) @Min(0) decorators.
      if (value < 0 || value > 5) {
        throw new GraphQLError("Skill value must be between 0 and 5", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Verify the skill belongs to the caller's organization before updating.
      const skill = await ctx.prisma.skill.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.skillId,
        },
      });

      return ctx.prisma.skill.update({
        ...query,
        where: { id: skill.id },
        data: { value },
      });
    },
  }),
);
