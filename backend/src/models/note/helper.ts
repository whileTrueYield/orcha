import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Note, NoteColor } from "@generated/type-graphql";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { PaginatedNotes } from "./entity";
import { Prisma } from ".prisma/client";

interface GetPageArgs extends GetPageArgsFor<Note> {
  ownerId?: number;
  organizationId: number;
  colors?: NoteColor[];
}

export async function getPaginatedNotes(
  args: GetPageArgs
): Promise<PaginatedNotes> {
  const { first, last, organizationId, ownerId, search, colors } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Note = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const noteQuery: Prisma.NoteWhereInput = {
    organizationId,
  };

  // We allow search on notes by body
  const query = trim(search);
  if (query) {
    noteQuery.body = { contains: query, mode: "insensitive" };
  }

  if (colors?.length) {
    noteQuery.color = { in: colors };
  }

  // optionally filter by owner
  if (ownerId) {
    noteQuery.ownerId = ownerId;
  }

  const notes = await prisma.note.findMany({
    where: noteQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.note.count({ where: noteQuery });

  return paginateNodes({ nodes: notes, offset, pageSize, count });
}
