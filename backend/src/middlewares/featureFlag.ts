/**
 * Feature flag assertion helper.
 *
 * Checks the FeatureFlag record for an organization and throws a
 * GraphQLError if the requested feature is not enabled.
 *
 * Exports: FeatureFlags enum, assertFeatureFlag.
 */

import { GraphQLError } from "graphql";
import { get } from "lodash";
import prisma from "../prisma";

export enum FeatureFlags {
  DOCUMENTATION = "documentation",
  SUPPORT = "support",
  REPORT = "report",
}

// ---------------------------------------------------------------------------
// assertFeatureFlag — standalone guard for Pothos resolvers
//
// Usage inside a Pothos resolve function:
//   await assertFeatureFlag(ctx.me.organizationId, FeatureFlags.SUPPORT);
// ---------------------------------------------------------------------------

export async function assertFeatureFlag(
  organizationId: number,
  featureFlag: FeatureFlags,
): Promise<void> {
  const orgFeatureFlag = await prisma.featureFlag.findFirst({
    where: { organizationId },
  });

  if (orgFeatureFlag && get(orgFeatureFlag, featureFlag) === true) {
    return;
  }

  throw new GraphQLError("Access to this feature is restricted", {
    extensions: { code: "UNAUTHENTICATED" },
  });
}
