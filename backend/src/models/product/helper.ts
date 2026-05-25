import { clamp, trim } from "lodash";
import { Product, ModelStage, Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";

export async function findProductByCode(
  code: string,
  organizationId: number
): Promise<Product | null> {
  return prisma.product.findFirst({
    where: {
      organizationId,
      code: {
        equals: code,
        mode: "insensitive",
      },
    },
  });
}

interface GetPageArgs extends GetPageArgsFor<Product> {
  organizationId: number;
  stages?: ModelStage[];
}

export async function getPaginatedProducts(
  args: GetPageArgs
) {
  const { first, last, search, organizationId, stages } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Product = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const productQuery: Prisma.ProductWhereInput = {
    organizationId,
  };

  // We allow search on organizations by name
  const query = trim(search);
  if (query) {
    productQuery.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        code: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (stages?.length) {
    productQuery.stage = { in: stages, not: ModelStage.DELETED };
  } else {
    productQuery.stage = { not: ModelStage.DELETED };
  }

  const products = await prisma.product.findMany({
    where: productQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.product.count({ where: productQuery });

  return paginateNodes({ nodes: products, offset, pageSize, count });
}
