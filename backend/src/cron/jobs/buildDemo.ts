import prisma from "../../prisma";
import { logger } from "../../logger";
import { DemoStatus } from "@generated/type-graphql";
import { generateDemo } from "../../mocker/demo/generateDemo";
import { DemoRequest } from "@prisma/client";
import { uniqBy } from "lodash";
import { createGettingStartedProject } from "../../models/organization/resolvers/createOrganization.resolver";

export async function buildDemo(): Promise<void> {
  const demoRequestProcessing = await prisma.demoRequest.findFirst({
    where: {
      status: DemoStatus.PROCESSING,
    },
  });

  // delete old failed ones after 1h
  await prisma.demoRequest.deleteMany({
    where: {
      status: DemoStatus.FAILED,
      createdAt: { lt: new Date(new Date().getTime() - 3600 * 1000) },
    },
  });

  if (demoRequestProcessing) {
    logger.info(`Request for ${demoRequestProcessing.email} is processing...`);
    return;
  }

  const nextDemoRequest = await prisma.demoRequest.findFirst({
    where: {
      status: DemoStatus.QUEUED,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!nextDemoRequest) {
    logger.info("No Demo Request in the queue.");

    return;
  }

  build(nextDemoRequest);
}

async function build(demoRequest: DemoRequest): Promise<void> {
  logger.info(`Building demo for ${demoRequest.email}...`);

  try {
    await prisma.demoRequest.update({
      where: { id: demoRequest.id },
      data: { status: DemoStatus.PROCESSING },
    });

    const { password, roles, organization } = await generateDemo();

    // lets create the Getting Started Project
    await createGettingStartedProject(roles, organization);

    await prisma.demoRequest.update({
      where: { id: demoRequest.id },
      data: {
        config: JSON.stringify({
          password,
          roles: uniqBy(roles, "title").map(
            ({ user, name, title, avatarUrl, status, type }) => ({
              email: user.email,
              name,
              title,
              avatarUrl,
              status,
              type,
            })
          ),
        }),
        status: DemoStatus.READY,
      },
    });
    logger.info(`Demo for ${demoRequest.email} is ready.`);
  } catch (error) {
    logger.error(error);
    await prisma.demoRequest.update({
      where: { id: demoRequest.id },
      data: { status: DemoStatus.FAILED },
    });
    return;
  }
}
