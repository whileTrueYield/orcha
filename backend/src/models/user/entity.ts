import { Field, Int, ObjectType } from "type-graphql";
import { UserStatus, User } from "@generated/type-graphql";
import { PaginatedNodes } from "../../utils/pagination";

export const userStatuses = Object.values(UserStatus);

@ObjectType()
export class PaginatedUsers extends PaginatedNodes {
  @Field(() => [User])
  nodes: User[];
}

@ObjectType()
export class UserPreferences {
  @Field((_type) => [Int], { nullable: "items" })
  favoriteOrganizations: number[];

  @Field((_type) => Int, { nullable: true })
  lastOrganizationId: number | null;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  favoriteOrganizations: [],
  lastOrganizationId: null,
};
