/**
 * Pothos type definitions for GitHub Repository links.
 *
 * Exports:
 *  - RepositoryLinkRef: the GraphQL view of a RepositoryLink. Deliberately omits
 *    webhookToken and webhookSecretEnc — credential material is never exposed.
 *  - CreateRepositoryLinkResult: the one-time create payload carrying the
 *    webhook URL and plaintext secret (shown once, never recoverable) alongside
 *    the link.
 *  - LinkedPullRequestRef: the read-only mirror of a GitHub pull request,
 *    surfaced under the Ticket(s) it references.
 */

import builder from "../../schema/builder";
import {
  PullRequestStateEnum,
  RepositoryLinkStatusEnum,
} from "../../schema/enums";

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

export const LinkedPullRequestRef = builder.prismaObject("LinkedPullRequest", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    repoFullName: t.exposeString("repoFullName"),
    number: t.exposeInt("number"),
    title: t.exposeString("title"),
    state: t.expose("state", { type: PullRequestStateEnum }),
    isDraft: t.exposeBoolean("isDraft"),
    authorLogin: t.exposeString("authorLogin", { nullable: true }),
    htmlUrl: t.exposeString("htmlUrl"),
    githubUpdatedAt: t.expose("githubUpdatedAt", { type: "DateTime" }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
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
