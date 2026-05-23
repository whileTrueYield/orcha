import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { User } from "@generated/type-graphql";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import {
  DEFAULT_USER_PREFERENCES,
  PaginatedUsers,
  UserPreferences,
} from "./entity";
import { Prisma } from ".prisma/client";

interface GetPageArgs extends GetPageArgsFor<User> {
  organizationId?: number;
}

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: { email: { equals: email.toLowerCase(), mode: "insensitive" } },
  });
}

export const getUserPreferences = (user: User): UserPreferences => {
  if (user.preferences) {
    try {
      return JSON.parse(user.preferences);
    } catch (error) {}
  }

  return DEFAULT_USER_PREFERENCES;
};

export async function updatePreferences(
  user: User,
  preferences: Partial<UserPreferences>
): Promise<User> {
  const userPreferences = getUserPreferences(user);

  return prisma.user.update({
    where: { id: user.id },
    data: {
      preferences: JSON.stringify({ ...userPreferences, ...preferences }),
    },
  });
}

export async function getPaginatedUsers(
  args: GetPageArgs
): Promise<PaginatedUsers> {
  const { first, last, organizationId, search } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof User = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const userQuery: Prisma.UserWhereInput = {};

  // We allow search on users by body
  const query = trim(search);
  if (query) {
    userQuery.OR = [{ email: { contains: query, mode: "insensitive" } }];
  }

  // filtering by ticket ID is optional since we might also want
  // to filter by author
  if (organizationId) {
    userQuery.roles = { some: { organizationId } };
  }

  const users = await prisma.user.findMany({
    where: userQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.user.count({ where: userQuery });

  return paginateNodes({ nodes: users, offset, pageSize, count });
}
