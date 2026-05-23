import { Prisma } from "@prisma/client";
import prisma from "../prisma";

export const createTag = (
  tagName: string,
  organizationId: number,
  authorId: number,
  values?: Partial<Prisma.TagUncheckedCreateInput>
) => {
  return prisma.tag.create({
    data: {
      name: tagName,
      organizationId: organizationId,
      authorId: authorId,
      ...values,
    },
  });
};
