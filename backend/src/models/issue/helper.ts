import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Issue, IssueStatus } from "@generated/type-graphql";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { PaginatedIssues } from "./entity";
import { Prisma } from ".prisma/client";

interface GetPageArgs extends GetPageArgsFor<Issue> {
  productId?: number;
  organizationId: number;
  assigneeId?: number;
  unread?: boolean;
  unassigned?: boolean;
  statuses?: IssueStatus[];
}

export async function getPaginatedIssues(
  args: GetPageArgs
): Promise<PaginatedIssues> {
  const {
    first,
    last,
    organizationId,
    productId,
    search,
    statuses,
    unassigned,
    unread,
    assigneeId,
  } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Issue = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const issueQuery: Prisma.IssueWhereInput = {
    organizationId,
  };

  // We allow search on issues by body
  const query = trim(search);
  if (query) {
    issueQuery.OR = [
      { description: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { metaData: { contains: query, mode: "insensitive" } },
      { url: { contains: query, mode: "insensitive" } },
    ];
  }

  if (productId) {
    issueQuery.productId = productId;
  }

  if (unread) {
    issueQuery.unread = unread;
  }

  if (assigneeId) {
    issueQuery.assigneeId = assigneeId;
  }

  if (unassigned) {
    issueQuery.assigneeId = null;
  }

  if (statuses?.length) {
    issueQuery.status = { in: statuses };
  }

  const issues = await prisma.issue.findMany({
    where: issueQuery,
    skip: offset,
    take: pageSize,
    orderBy: getIssueSorting(sort, direction),
  });
  const count = await prisma.issue.count({ where: issueQuery });

  return paginateNodes({ nodes: issues, offset, pageSize, count });
}

export const getIssueSorting = (
  sort: string,
  direction: Prisma.SortOrder
): Prisma.Enumerable<Prisma.IssueOrderByWithRelationInput> => {
  if (sort === "product") {
    return {
      product: {
        name: direction,
      },
    };
  }

  if (sort === "assignee") {
    return {
      assignee: {
        name: direction,
      },
    };
  }

  return { [sort]: direction };
};
