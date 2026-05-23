import { Page, Product } from "../models/entities";
import prisma from "../prisma";

export const createPageForProduct = (product: Product): Promise<Page> => {
  return prisma.page.create({
    data: {
      organization: { connect: { id: product.organizationId } },
      title: product.name,
      duration: 14,
      products: { connect: [{ id: product.id }] },
    },
  });
};
