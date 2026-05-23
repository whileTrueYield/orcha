import { clamp, trim } from "lodash";
import { Documentation, ModelStage } from "@generated/type-graphql";
import prisma from "../../prisma";
import { Prisma } from ".prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { PaginatedDocumentations } from "./entity";

interface GetDocumentatingsArgs extends GetPageArgsFor<Documentation> {
  organizationId: number;
  stages?: ModelStage[];
}

export async function getPaginatedDocumentations(
  args: GetDocumentatingsArgs
): Promise<PaginatedDocumentations> {
  const { first, last, search, organizationId, stages } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Documentation = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const documentationQuery: Prisma.DocumentationWhereInput = {
    organizationId,
  };

  // We allow search on organizations by name
  const query = trim(search);
  if (query) {
    documentationQuery.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (stages?.length) {
    documentationQuery.stage = { in: stages, not: ModelStage.DELETED };
  } else {
    documentationQuery.stage = { not: ModelStage.DELETED };
  }

  const documentations = await prisma.documentation.findMany({
    where: documentationQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.documentation.count({ where: documentationQuery });

  return paginateNodes({ nodes: documentations, offset, pageSize, count });
}
