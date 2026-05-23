import prisma from "../prisma";
import { ModelStage } from "@prisma/client";
import { map } from "lodash";
import { generateBlocks } from "./blocks";
import { Prisma } from ".prisma/client";

export const createProject = async (
  name: string,
  organizationId: number,
  values?: Partial<Prisma.ProjectCreateInput>,
) => {
  const project = await prisma.project.create({
    data: {
      name,
      organization: { connect: { id: organizationId } },
      stage: ModelStage.PUBLISHED,
      ...values,
    },
  });

  return project;
};
