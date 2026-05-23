import {
  Documentation,
  DocumentationPage,
  Organization,
  ModelStage,
} from ".prisma/client";
import prisma from "../prisma";
import { faker } from "@faker-js/faker";
import { map, random, range } from "lodash";
import { generateBlocks } from "./blocks";

export const createDocumentation = (
  organization: Organization,
): Promise<Documentation> => {
  return prisma.documentation.create({
    data: {
      organization: { connect: { id: organization.id } },
      name: faker.hacker.adjective() + " " + faker.hacker.noun(),
      description: faker.lorem.paragraph(),
      stage: ModelStage.DRAFT,
    },
  });
};

interface DataBlock {
  type: "header" | "paragraph" | "code";
  data: {};
}

export const createDocumentationPage = async (
  organization: Organization,
  documentation: Documentation,
): Promise<DocumentationPage> => {
  const documentationPage = await prisma.documentationPage.create({
    data: {
      organization: { connect: { id: organization.id } },
      documentation: { connect: { id: documentation.id } },
      title: faker.hacker.adjective() + " " + faker.hacker.noun(),
      body: "",
    },
  });

  const blocks = await generateBlocks();
  let index = 0;
  for (const block of blocks) {
    // TODO: Create documentation data block schema, convert MD to YJS doc
    // await prisma.documentationDataBlock.create({
    //   data: {
    //     documentationPageId: documentationPage.id,
    //     position: index++,
    //     type: block.type,
    //     data: JSON.stringify(block.data),
    //   },
    // });
  }

  return documentationPage;
};
