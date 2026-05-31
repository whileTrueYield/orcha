/**
 * In-process GraphQL executor for the REST API.
 *
 * Purpose: let a `/v1` request reuse the existing GraphQL schema — the same
 * resolvers, the same tenant-isolation Prisma middleware, the same auth scopes
 * — without an HTTP round-trip back to `/graphql`. The REST layer stays a thin
 * translation of HTTP ⇄ GraphQL, with zero duplicated business logic.
 *
 * Exports:
 *  - execute({ document, variables, me }) → { data, errors }
 *      Runs an operation against the built schema under a synthesized context.
 *
 * Non-obvious assumption — why we synthesize a `req.session`, not just `me`:
 * some resolvers (notably the `me` query) read identity straight off
 * `ctx.req.session` rather than `ctx.me`. To make the token path behave
 * exactly like the session path, we derive a session from the same
 * AuthRoleContext that produced `me`. One identity, two views, no drift.
 *
 * The schema is built once and cached, mirroring the test harness and the
 * Apollo server — building it per request would be wasteful and pointless.
 */

import { graphql, GraphQLError } from "graphql";
import { getSchema } from "../models";
import { AuthRoleContext } from "../types";
import prisma from "../prisma";
import { formatGraphQLError } from "../utils/graphqlErrors";

export interface ExecuteParams {
  document: string;
  me: AuthRoleContext;
  variables?: Record<string, unknown>;
}

export interface ExecuteResult {
  data: Record<string, any> | null | undefined;
  errors: readonly GraphQLError[] | undefined;
}

let cachedSchema: ReturnType<typeof getSchema> | undefined;

export async function execute({
  document,
  me,
  variables,
}: ExecuteParams): Promise<ExecuteResult> {
  if (!cachedSchema) {
    cachedSchema = getSchema();
  }

  // Synthesize the minimal Apollo-shaped context. The session mirrors `me` so
  // resolvers that read `ctx.req.session` see the same identity as those that
  // read `ctx.me`.
  const req = {
    session: {
      userId: me.userId,
      roleId: me.roleId,
      organizationId: me.organizationId,
      roleType: me.roleType,
      destroy: (callback: () => void) => callback(),
    },
  };

  const res = {
    clearCookie: () => null,
  };

  const result = await graphql({
    schema: await cachedSchema,
    source: document,
    variableValues: variables,
    contextValue: { req, res, prisma, me },
  });

  // Mirror the HTTP/Apollo boundary the GraphQL API goes through: JSON-
  // serialise `data` so DateTime scalars reach clients as ISO strings, and run
  // errors through the same normaliser Apollo's formatError uses, so the REST
  // layer maps the identical clean errors clients would otherwise receive.
  return {
    data: result.data
      ? JSON.parse(JSON.stringify(result.data))
      : result.data,
    errors: result.errors
      ? result.errors.map(formatGraphQLError)
      : result.errors,
  };
}
