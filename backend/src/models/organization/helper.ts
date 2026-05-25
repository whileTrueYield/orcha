import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Organization, Prisma } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";

interface GetPageArgs extends GetPageArgsFor<Organization> {}

export async function findOrganizationByName(
  name: string
): Promise<Organization | null> {
  return await prisma.organization.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
}

export async function getPaginatedOrganizations(
  args: GetPageArgs
) {
  const { first, last, search } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Organization = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const organizationQuery: Prisma.OrganizationWhereInput = {};

  // We allow search on organizations by name
  const query = trim(search);
  if (query) {
    organizationQuery.name = { contains: query, mode: "insensitive" };
  }

  const organizations = await prisma.organization.findMany({
    where: organizationQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.organization.count({
    where: organizationQuery,
  });

  return paginateNodes({ nodes: organizations, offset, pageSize, count });
}
