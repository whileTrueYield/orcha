import { Arg, Query, Resolver, Int, UseMiddleware } from "type-graphql";
import { Organization } from "@generated/type-graphql";
import { StaffOnly } from "../../../middlewares/isAuthenticated";
import { getPaginatedOrganizations } from "../helper";
import { PaginatedOrganizations } from "../entity";

@Resolver(Organization)
export class OrganizationsResolver {
  @Query((_returns) => PaginatedOrganizations)
  @UseMiddleware(StaffOnly)
  async organizations(
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Organization,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedOrganizations> {
    return getPaginatedOrganizations({
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}
