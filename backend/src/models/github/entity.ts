/**
 * Pothos type definitions for GitHub Repository links.
 *
 * Exports:
 *  - RepositoryLinkRef: the GraphQL view of a RepositoryLink. Deliberately omits
 *    webhookToken and webhookSecretEnc — credential material is never exposed.
 *  - CreateRepositoryLinkResult: the one-time create payload carrying the
 *    webhook URL and plaintext secret (shown once, never recoverable) alongside
 *    the link.
 */

import builder from "../../schema/builder";
import { RepositoryLinkStatusEnum } from "../../schema/enums";

export const RepositoryLinkRef = builder.prismaObject("RepositoryLink", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name", { nullable: true }),
    status: t.expose("status", { type: RepositoryLinkStatusEnum }),
    repoFullName: t.exposeString("repoFullName", { nullable: true }),
    activatedAt: t.expose("activatedAt", { type: "DateTime", nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    // webhookToken and webhookSecretEnc are intentionally never exposed.
  }),
});

export const CreateRepositoryLinkResult = builder.simpleObject(
  "CreateRepositoryLinkResult",
  {
    fields: (t) => ({
      // The URL an admin pastes into the repo's webhook settings.
      webhookUrl: t.string({}),
      // The HMAC secret to paste alongside it — returned exactly once.
      webhookSecret: t.string({}),
      link: t.field({ type: RepositoryLinkRef, nullable: false }),
    }),
  },
);
