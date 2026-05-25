import prisma from "../../prisma";
import { estimateAllScheduledTickets } from "../../models/ticket/jobs/estimateTickets";
import { OrganizationStatus } from "@prisma/client";
import { logger } from "../../logger";

export async function nightlyEstimateTickets(): Promise<void> {
  // runs every organization at least every 4 hours
  const jobDelay = new Date().getTime() - 4 * 3600 * 1000;

  let organization = await prisma.organization.findFirst({
    where: {
      estimatedAt: { lt: new Date(jobDelay) },
      status: OrganizationStatus.ACTIVE,
    },
    orderBy: {
      estimatedAt: "desc",
    },
  });

  // nothing to do
  if (!organization) {
    logger.info("No organization to estimate");
    return;
  }

  logger.info(`Starting gap estimate for org. ${organization.id}...`);

  // update the organization last estimate
  await prisma.organization.update({
    where: { id: organization.id },
    data: { estimatedAt: new Date() },
  });

  // Run the job
  await estimateAllScheduledTickets(organization.id);
}
