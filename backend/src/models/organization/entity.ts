/**
 * Pothos type definitions for the Organization model.
 *
 * Exports:
 *  - OrganizationRef:             prismaObject for Organization
 *  - OnboardingStatusRef:         custom object (invite, product, ticket booleans)
 *  - OrganizationPreferencesRef:  custom object wrapping the JSON preferences blob
 *  - PaginatedOrganizations:      paginated wrapper for Organization
 *  - DEFAULT_ORGANIZATION_PREFERENCES: default preferences values
 *
 * IMPORTANT: The `preferences` column is intentionally omitted from the
 * prismaObject — it is an internal JSON blob and must not appear in the
 * public GraphQL API.
 *
 * TODO: Once the role model is migrated to Pothos, add a `roles`
 * paginated field resolver that returns PaginatedRoles.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import {
  OrganizationStatusEnum,
  ScheduleStatusEnum,
} from "../../schema/enums";
import { logger } from "../../logger";

// ---------------------------------------------------------------------------
// OrganizationPreferences — parsed from the JSON `preferences` column
// ---------------------------------------------------------------------------

export interface OrganizationPreferencesShape {
  showOnboarding: boolean;
}

export const DEFAULT_ORGANIZATION_PREFERENCES: OrganizationPreferencesShape = {
  showOnboarding: true,
};

export const OrganizationPreferencesRef =
  builder.objectRef<OrganizationPreferencesShape>("OrganizationPreferences");

builder.objectType(OrganizationPreferencesRef, {
  fields: (t) => ({
    showOnboarding: t.exposeBoolean("showOnboarding"),
  }),
});

// ---------------------------------------------------------------------------
// OnboardingStatus — computed from counts of products, roles, tickets
// ---------------------------------------------------------------------------

interface OnboardingStatusShape {
  invite: boolean;
  product: boolean;
  ticket: boolean;
}

export const OnboardingStatusRef =
  builder.objectRef<OnboardingStatusShape>("OnboardingStatus");

builder.objectType(OnboardingStatusRef, {
  fields: (t) => ({
    invite: t.exposeBoolean("invite"),
    product: t.exposeBoolean("product"),
    ticket: t.exposeBoolean("ticket"),
  }),
});

// ---------------------------------------------------------------------------
// OrganizationAddress — prismaObject for mailing/billing addresses
// ---------------------------------------------------------------------------

export const OrganizationAddressRef = builder.prismaObject("OrganizationAddress", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    address1: t.exposeString("address1"),
    address2: t.exposeString("address2", { nullable: true }),
    zipcode: t.exposeString("zipcode"),
    city: t.exposeString("city"),
    state: t.exposeString("state", { nullable: true }),
    country: t.exposeString("country"),
    organizationId: t.exposeInt("organizationId"),
  }),
});

// ---------------------------------------------------------------------------
// Organization — prismaObject
//
// `preferences` is NOT exposed (internal JSON blob).
// ---------------------------------------------------------------------------

export const OrganizationRef = builder.prismaObject("Organization", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    about: t.exposeString("about", { nullable: true }),
    coverUrl: t.exposeString("coverUrl", { nullable: true }),
    showOnboarding: t.exposeBoolean("showOnboarding"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    estimatedAt: t.expose("estimatedAt", { type: "DateTime" }),
    status: t.expose("status", { type: OrganizationStatusEnum }),
    scheduleStatus: t.expose("scheduleStatus", { type: ScheduleStatusEnum }),
    // Address relations
    mailingAddressId: t.exposeInt("mailingAddressId", { nullable: true }),
    billingAddressId: t.exposeInt("billingAddressId", { nullable: true }),
    mailingAddress: t.relation("mailingAddress", { nullable: true }),
    billingAddress: t.relation("billingAddress", { nullable: true }),

    // Direct relations
    roles: t.relation("roles"),
    teams: t.relation("teams"),
    products: t.relation("products"),
    tags: t.relation("tags"),
    featureFlag: t.relation("featureFlag", { nullable: true }),

    // Computed fields
    onboardingStatus: t.field({
      type: OnboardingStatusRef,
      resolve: async (organization, _args, ctx) => {
        const [products, roles, tickets] = await Promise.all([
          ctx.prisma.product.count({
            where: {
              organizationId: organization.id,
              stage: { not: ModelStage.DELETED },
            },
          }),
          ctx.prisma.role.count({
            where: { organizationId: organization.id },
          }),
          ctx.prisma.ticket.count({
            where: {
              organizationId: organization.id,
              stage: { not: ModelStage.DELETED },
            },
          }),
        ]);

        return {
          invite: roles > 1,
          product: products > 0,
          ticket: tickets > 0,
        };
      },
    }),

    preferences: t.field({
      type: OrganizationPreferencesRef,
      resolve: (organization) => {
        try {
          if (organization.preferences) {
            return {
              ...DEFAULT_ORGANIZATION_PREFERENCES,
              ...JSON.parse(organization.preferences),
            };
          }
        } catch {
          logger.warn(
            `Could not parse preferences for organization ${organization.id}: ${organization.preferences}`,
          );
        }
        return DEFAULT_ORGANIZATION_PREFERENCES;
      },
    }),
  }),
});

// ---------------------------------------------------------------------------
// Paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedOrganizations = createPaginatedType(
  "Organizations",
  OrganizationRef,
);
