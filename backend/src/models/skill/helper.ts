import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Skill } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { Prisma } from "@prisma/client";

interface GetPageArgs extends GetPageArgsFor<Skill> {
  organizationId: number;
  roleId?: number;
  featureId?: number;
}

// Return type matches the plain shape produced by paginateNodes.
// The GraphQL type (PaginatedSkills) is a Pothos ref defined in entity.ts.
export async function getPaginatedSkills(args: GetPageArgs) {
  const { first, last, featureId, roleId, search, organizationId } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on value
  const sort: keyof Skill = args.sort ? args.sort : "value";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const skillQuery: Prisma.SkillWhereInput = {
    organizationId,
  };

  // We allow search on skills by feature name
  const query = trim(search);
  if (query) {
    skillQuery.feature = {
      name: { contains: query, mode: "insensitive" },
    };
  }

  // filtering by feature is optional since we might also want
  // to filter by role
  if (featureId) {
    skillQuery.featureId = featureId;
  }

  // optionally filter by role
  if (roleId) {
    skillQuery.roleId = roleId;
  }

  const skills = await prisma.skill.findMany({
    where: skillQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.skill.count({ where: skillQuery });

  return paginateNodes({ nodes: skills, offset, pageSize, count });
}
