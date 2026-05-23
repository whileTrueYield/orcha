import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Team } from "@generated/type-graphql";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { PaginatedTeams } from "./entity";
import { Prisma } from ".prisma/client";

export async function findTeamByCode(
  code: string,
  organizationId: number
): Promise<Team | null> {
  return prisma.team.findFirst({
    where: {
      organizationId: organizationId,
      code: { contains: code, mode: "insensitive" },
    },
  });
}

interface GetPageArgs extends GetPageArgsFor<Team> {
  organizationId: number;
}
export async function getPaginatedTeams(
  args: GetPageArgs
): Promise<PaginatedTeams> {
  const { first, last, organizationId, search } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Team = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const teamQuery: Prisma.TeamWhereInput = {
    organizationId,
  };

  // We allow search on teams by body
  const query = trim(search);
  if (query) {
    teamQuery.OR = [
      { code: { contains: query, mode: "insensitive" } },
      { name: { contains: query, mode: "insensitive" } },
    ];
  }

  const teams = await prisma.team.findMany({
    where: teamQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.team.count({ where: teamQuery });

  return paginateNodes({ nodes: teams, offset, pageSize, count });
}
