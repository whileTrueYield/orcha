import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { OrganizationStatus, Organization } from "@generated/type-graphql";

export const organizationStatuses = Object.values(OrganizationStatus);

@ObjectType()
export class PaginatedOrganizations extends PaginatedNodes {
  @Field(() => [Organization])
  nodes: Organization[];
}

@ObjectType()
export class OnboardingStatus {
  @Field()
  invite: boolean;

  @Field()
  product: boolean;

  @Field()
  ticket: boolean;
}

@ObjectType()
export class OrganizationPreferences {
  @Field((_type) => Boolean)
  showOnboarding: boolean;
}

export const DEFAULT_ORGANIZATION_PREFERENCES: OrganizationPreferences = {
  showOnboarding: true,
};
