/**
 * Pagination helper for Todos.
 *
 * Builds a Prisma query with optional filters (owner, search, dynamic)
 * and returns a paginated result compatible with the PaginatedTodos type.
 *
 * The `dynamic` filter hides checked todos older than 5 minutes, giving
 * the user a brief window to undo a check before it disappears from view.
 *
 * Exports: getPaginatedTodos.
 */

import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Todo, Prisma } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { subMinutes } from "date-fns";

interface GetPageArgs extends GetPageArgsFor<Todo> {
  ownerId?: number;
  organizationId: number;
  dynamic?: boolean;
}

export async function getPaginatedTodos(args: GetPageArgs) {
  const { first, last, organizationId, ownerId, search, dynamic } = args;

  // default offset to be at the start (or the end depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Todo = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const todoQuery: Prisma.TodoWhereInput = {
    organizationId,
  };

  // we don't include any ticket that has been checked more
  // than 5 minutes ago
  if (dynamic) {
    todoQuery.OR = [
      { checkedAt: { gte: subMinutes(new Date(), 5) } },
      { checked: false },
    ];
  }

  // We allow search on todos by body
  const query = trim(search);
  if (query) {
    todoQuery.body = { contains: query, mode: "insensitive" };
  }

  // optionally filter by owner
  if (ownerId) {
    todoQuery.ownerId = ownerId;
  }

  const todos = await prisma.todo.findMany({
    where: todoQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.todo.count({ where: todoQuery });

  return paginateNodes({ nodes: todos, offset, pageSize, count });
}
