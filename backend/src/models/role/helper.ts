import prisma from "../../prisma";
import { clamp, trim, lowerCase } from "lodash";
import { Role } from "@generated/type-graphql";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { PaginatedRoles } from "./entity";
import { Prisma } from ".prisma/client";

interface GetPageArgs extends GetPageArgsFor<Role> {
  userId?: number;
  organizationId?: number;
  teamId?: number;
}

export async function getPaginatedRoles(
  args: GetPageArgs
): Promise<PaginatedRoles> {
  const { first, last, userId, teamId, search, organizationId } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Role = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const roleQuery: Prisma.RoleWhereInput = {};

  // We allow search on roles for a given user
  if (userId) {
    roleQuery.userId = userId;
  }

  // We allow search on the roles of an organization
  if (organizationId) {
    roleQuery.organizationId = organizationId;
  }

  // We allow search on roles contained in a team
  if (teamId) {
    roleQuery.teams = { some: { id: teamId } };
  }

  const query = lowerCase(trim(search));
  if (query) {
    roleQuery.name = { contains: search, mode: "insensitive" };
  }

  const roles = await prisma.role.findMany({
    where: roleQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.role.count({ where: roleQuery });

  return paginateNodes({ nodes: roles, offset, pageSize, count });
}
