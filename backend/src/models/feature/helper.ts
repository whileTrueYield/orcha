import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { FeatureGroup, Feature } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { Prisma } from "@prisma/client";

interface GetFeatureGroupPageArgs extends GetPageArgsFor<FeatureGroup> {
  productId?: number;
  organizationId: number;
}

export async function getPaginatedFeatureGroups(
  args: GetFeatureGroupPageArgs
) {
  const { first, last, productId, organizationId, search } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on title
  const sort: keyof FeatureGroup = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const featureGroupQuery: Prisma.FeatureGroupWhereInput = {
    organizationId,
  };

  // We allow search on featureGroups by name
  const query = trim(search);
  if (query) {
    featureGroupQuery.name = { contains: query, mode: "insensitive" };
  }

  // filtering by ticket ID is optional since we might also want
  // to filter by author
  if (productId) {
    featureGroupQuery.productId = productId;
  }

  const featureGroups = await prisma.featureGroup.findMany({
    where: featureGroupQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.featureGroup.count({
    where: featureGroupQuery,
  });

  return paginateNodes({ nodes: featureGroups, offset, pageSize, count });
}

interface GetFeaturePageArgs extends GetPageArgsFor<Feature> {
  featureGroupId?: number;
  organizationId: number;
  productId?: number;
}

export async function getPaginatedFeatures(
  args: GetFeaturePageArgs
) {
  const { first, last, featureGroupId, organizationId, productId, search } =
    args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on title
  const sort: keyof Feature = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const featureQuery: Prisma.FeatureWhereInput = {
    featureGroup: { organizationId },
  };

  // We allow search on featureGroups by name
  const query = trim(search);
  if (query) {
    featureQuery.OR = [
      { name: { contains: query, mode: "insensitive" } },
      {
        featureGroup: {
          name: { contains: query, mode: "insensitive" },
        },
      },
    ];
  }

  // filtering by product ID is optional since we might also want
  // to filter by organization to list all the features
  if (productId) {
    featureQuery.featureGroup = { productId: productId };
  }

  // filtering by product ID is optional since we might also want
  // to filter by organization to list all the features
  if (featureGroupId) {
    featureQuery.featureGroupId = featureGroupId;
  }

  const features = await prisma.feature.findMany({
    where: featureQuery,
    include: {
      featureGroup: true,
    },
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.feature.count({ where: featureQuery });

  return paginateNodes({ nodes: features, offset, pageSize, count });
}
