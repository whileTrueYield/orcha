import { faker } from "@faker-js/faker";
import { first, map } from "lodash";
import {
  Prisma,
  Feature,
  FeatureGroup,
  FeatureGroupStatus,
  Organization,
  Product,
  Workflow,
} from ".prisma/client";
import prisma from "../prisma";
import { ModelStage } from "@generated/type-graphql";

export const createProduct = async (
  organization: Organization,
  values?: Partial<Prisma.ProductCreateInput>
): Promise<Product> => {
  const name = faker.hacker.adjective() + " " + faker.hacker.noun();
  const data: Prisma.ProductCreateInput = {
    name,
    code: map(name.split(" "), first).join("").toUpperCase(),
    description: faker.lorem.paragraph(),
    coverUrl: faker.image.url(),
    stage: ModelStage.PUBLISHED,
    organization: {
      connect: { id: organization.id },
    },
    ...values,
  };

  return prisma.product.create({ data });
};

export const createFeatureGroup = async (
  product: Product,
  values?: Partial<Prisma.FeatureGroupCreateInput>
): Promise<FeatureGroup> => {
  const data: Prisma.FeatureGroupCreateInput = {
    name: faker.hacker.noun(),
    status: FeatureGroupStatus.ACTIVE,
    product: { connect: { id: product.id } },
    organization: { connect: { id: product.organizationId } },
    ...values,
  };

  return prisma.featureGroup.create({ data });
};

export const createFeature = async (
  featureGroup: FeatureGroup,
  values?: Partial<Prisma.FeatureCreateInput>
): Promise<Feature> => {
  const data: Prisma.FeatureCreateInput = {
    name: faker.commerce.product(),
    featureGroup: { connect: { id: featureGroup.id } },
    ...values,
  };

  return prisma.feature.create({ data });
};

export const setProductWorkflows = async (
  product: Product,
  workflows: Workflow[]
): Promise<Product> => {
  return prisma.product.update({
    where: { id: product.id },
    data: {
      workflows: {
        set: workflows.map(({ id }) => ({ id })),
      },
    },
  });
};
