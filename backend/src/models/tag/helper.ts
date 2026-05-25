import prisma from "../../prisma";
import { clamp, find, trim } from "lodash";
import { Tag, PersonalTag, Prisma } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";

export async function findTagByName(
  name: string,
  organizationId: number
): Promise<Tag | null> {
  return prisma.tag.findFirst({
    where: {
      organizationId: organizationId,
      name: { equals: name, mode: "insensitive" },
    },
  });
}

export async function findOrCreateTags(
  organizationId: number,
  authorId: number,
  tagNames: string[]
): Promise<Tag[]> {
  const existingTags = await prisma.tag.findMany({
    where: {
      organizationId,
      name: { in: tagNames, mode: "insensitive" },
    },
  });

  const missingTagNames = [];
  for (const tagName of tagNames) {
    if (
      !find(
        existingTags,
        (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
      )
    ) {
      missingTagNames.push(tagName);
    }
  }

  // if there is some missing tags, we'll create them
  if (missingTagNames.length) {
    await prisma.tag.createMany({
      data: missingTagNames.map((name) => ({
        name,
        organizationId,
        authorId,
      })),
    });

    return findOrCreateTags(organizationId, authorId, tagNames);
  }

  return existingTags;
}

export async function findPersonalTagByName(
  name: string,
  organizationId: number,
  ownerId: number
): Promise<PersonalTag | null> {
  return prisma.personalTag.findFirst({
    where: {
      organizationId: organizationId,
      name: { equals: name, mode: "insensitive" },
      ownerId,
    },
  });
}

interface GetPaginatedTagsArgs extends GetPageArgsFor<Tag> {
  organizationId: number;
}

// Return a paginated set of tags where the format
// is normalized to maintain familiarity and functionality
// when working with pages
export async function getPaginatedTags(
  args: GetPaginatedTagsArgs
) {
  const { first, last, organizationId, search } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Tag = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const tagQuery: Prisma.TagWhereInput = {
    organizationId,
  };

  // We allow search on tags by name
  const query = trim(search);
  if (query) {
    tagQuery.name = { contains: query, mode: "insensitive" };
  }

  const tags = await prisma.tag.findMany({
    where: tagQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.tag.count({ where: tagQuery });

  return paginateNodes({ nodes: tags, offset, pageSize, count });
}

interface GetPaginatedPersonalTagsArgs extends GetPageArgsFor<PersonalTag> {
  organizationId: number;
  ownerId: number;
}

// Return a paginated set of personal tags where the format
// is normalized to maintain familiarity and functionality
// when working with pages
export async function getPaginatedPersonalTags(
  args: GetPaginatedPersonalTagsArgs
) {
  const { first, last, organizationId, ownerId, search } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof PersonalTag = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const personalTagQuery: Prisma.PersonalTagWhereInput = {
    organizationId,
    ownerId,
  };

  // We allow search on tags by name
  const query = trim(search);
  if (query) {
    personalTagQuery.name = { contains: query, mode: "insensitive" };
  }

  const personalTags = await prisma.personalTag.findMany({
    where: personalTagQuery,

    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });

  const count = await prisma.personalTag.count({ where: personalTagQuery });

  return paginateNodes({ nodes: personalTags, offset, pageSize, count });
}
