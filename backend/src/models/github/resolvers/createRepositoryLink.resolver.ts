/**
 * Mutation resolver for creating a GitHub Repository link.
 *
 * Registers:
 *  - Mutation.createRepositoryLink(input): CreateRepositoryLinkResult!
 *
 * ADMIN/OWNER only — binding a repo is an Organization-level configuration. The
 * link is created PENDING and reserves nothing; it activates only when a signed
 * webhook delivery proves repo control. The webhook secret is returned exactly
 * once and persisted encrypted (never recoverable from the API).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import {
  buildWebhookUrl,
  generateWebhookCredentials,
} from "../../../github/credentials";
import { encryptSecret } from "../../../utils/crypto";
import { CreateRepositoryLinkResult } from "../entity";

const CreateRepositoryLinkInput = builder.inputType("CreateRepositoryLinkInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
  }),
});

builder.mutationField("createRepositoryLink", (t) =>
  t.field({
    type: CreateRepositoryLinkResult,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateRepositoryLinkInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const { webhookToken, webhookSecret } = generateWebhookCredentials();

      const link = await ctx.prisma.repositoryLink.create({
        data: {
          name: args.input.name ?? null,
          webhookToken,
          webhookSecretEnc: encryptSecret(webhookSecret),
          organization: { connect: { id: me.organizationId } },
        },
      });

      return { webhookUrl: buildWebhookUrl(webhookToken), webhookSecret, link };
    },
  }),
);
