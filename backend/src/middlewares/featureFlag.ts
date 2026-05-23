import { MiddlewareFn } from "type-graphql";
import { AppContext, AuthStatus, AuthContext } from "../types";
import { AuthenticationError } from "apollo-server-express";
import { get, isArray } from "lodash";
import prisma from "../prisma";

export enum FeatureFlags {
  DOCUMENTATION = "documentation",
  SUPPORT = "support",
  REPORT = "report",
}

export const hasFeature =
  (
    featureFlags: FeatureFlags[] | FeatureFlags
  ): MiddlewareFn<AppContext<AuthContext>> =>
  async ({ context }, next) => {
    if (context.me.status === AuthStatus.LINKED) {
      context.me.organizationId;
      const orgFeatureFlag = await prisma.featureFlag.findFirst({
        where: { organizationId: context.me.organizationId },
      });

      if (orgFeatureFlag) {
        if (isArray(featureFlags)) {
          // if we received an array of feature flags:
          // @UseMiddleware(hasFeature(["support", "documentation"]))
          for (const featureFlag of featureFlags) {
            if (get(orgFeatureFlag, featureFlag) === true) {
              return next();
            }
          }
        } else {
          // if we received a single feature flag:
          // @UseMiddleware(hasFeature("documentation"))
          if (get(orgFeatureFlag, featureFlags) === true) {
            return next();
          }
        }
      }
    }

    throw new AuthenticationError("Access to this feature is restricted");
  };
