/**
 * Mutation resolver for minting a Personal Access Token.
 *
 * Registers:
 *  - Mutation.createApiToken(input): CreateApiTokenResult!
 *
 * Any linked Role may mint a token for itself; the token inherits that Role's
 * identity and tenant scope. The plaintext is returned exactly once — only the
 * hash and display prefix are persisted.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { generateToken } from "../token";
import { CreateApiTokenResult } from "../entity";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const CreateApiTokenInput = builder.inputType("CreateApiTokenInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    readOnly: t.boolean({ required: false }),
    expiresInDays: t.int({ required: false }),
  }),
});

builder.mutationField("createApiToken", (t) =>
  t.field({
    type: CreateApiTokenResult,
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateApiTokenInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const { plaintext, hash, prefix } = generateToken();

      const expiresAt = args.input.expiresInDays
        ? new Date(Date.now() + args.input.expiresInDays * MS_PER_DAY)
        : null;

      const token = await ctx.prisma.personalAccessToken.create({
        data: {
          name: args.input.name,
          tokenHash: hash,
          tokenPrefix: prefix,
          readOnly: args.input.readOnly ?? false,
          expiresAt,
          role: { connect: { id: me.roleId } },
          organization: { connect: { id: me.organizationId } },
        },
      });

      return { plaintext, token };
    },
  }),
);
