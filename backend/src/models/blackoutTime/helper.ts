import { clamp, trim } from "lodash";
import { BlackoutTime, RecurringBlackoutTime } from "@prisma/client";
import prisma from "../../prisma";
import { Prisma } from ".prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";

interface GetBlackoutTimesArgs extends GetPageArgsFor<BlackoutTime> {
  organizationId: number;
  disabled?: boolean;
}

export async function getPaginatedBlackoutTimes(
  args: GetBlackoutTimesArgs
) {
  const { first, last, search, organizationId, disabled } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof BlackoutTime = args.sort ? args.sort : "id";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const blackoutTimeQuery: Prisma.BlackoutTimeWhereInput = {
    organizationId,
  };

  // We allow search on organizations by name
  const query = trim(search);
  if (query) {
    blackoutTimeQuery.roles = {
      some: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    };
  }

  if (disabled === false) {
    blackoutTimeQuery.disabled = false;
  } else if (disabled === true) {
    blackoutTimeQuery.disabled = true;
  }

  const blackoutTimes = await prisma.blackoutTime.findMany({
    where: blackoutTimeQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });

  const count = await prisma.blackoutTime.count({ where: blackoutTimeQuery });

  return paginateNodes({ nodes: blackoutTimes, offset, pageSize, count });
}

interface GetRecurringBlackoutTimesArgs
  extends GetPageArgsFor<RecurringBlackoutTime> {
  organizationId: number;
  disabled?: boolean;
}

export async function getPaginatedRecurringBlackoutTimes(
  args: GetRecurringBlackoutTimesArgs
) {
  const { first, last, search, organizationId, disabled } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof RecurringBlackoutTime = args.sort ? args.sort : "id";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const recurringBlackoutTimeQuery: Prisma.RecurringBlackoutTimeWhereInput = {
    organizationId,
  };

  // We allow search on organizations by name
  const query = trim(search);
  if (query) {
    recurringBlackoutTimeQuery.roles = {
      some: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    };
  }

  if (disabled === false) {
    recurringBlackoutTimeQuery.disabled = false;
  } else if (disabled === true) {
    recurringBlackoutTimeQuery.disabled = true;
  }

  const recurringBlackoutTimes = await prisma.recurringBlackoutTime.findMany({
    where: recurringBlackoutTimeQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });

  const count = await prisma.recurringBlackoutTime.count({
    where: recurringBlackoutTimeQuery,
  });

  return paginateNodes({
    nodes: recurringBlackoutTimes,
    offset,
    pageSize,
    count,
  });
}
