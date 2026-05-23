require("reflect-metadata");

import prisma from "../../prisma";
import { estimateAllScheduledTickets } from "../../models/ticket/jobs/estimateTickets";
import { OrganizationStatus } from "@generated/type-graphql";
import { logger } from "../../logger";

export async function onDemandEstimateTickets(
  organizationId: number,
  jobTimestamp: number
): Promise<void> {
  let organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      status: OrganizationStatus.ACTIVE,
    },
  });

  // nothing to do
  if (!organization) {
    logger.info("No organization to estimate");
    return;
  }

  // This is a control gate that prevents us from running a simulation if
  // a previous job ran after the job was scheduled (remember that the job
  // is scheduled to be ran 65 secs after it's creation)
  if (organization.estimatedAt > new Date(jobTimestamp)) {
    logger.info(
      `No need to estimate, request was made ${new Date(
        jobTimestamp
      )}, last estimate was ${organization.estimatedAt}`
    );
    return;
  }

  logger.info(`Starting ticket estimate for org. ${organization.id}...`);

  // update the organization last estimate so we won't have competitive
  // estimates running for the same organization (estimate are organization wide)
  await prisma.organization.update({
    where: { id: organization.id },
    data: { estimatedAt: new Date() },
  });

  // Request the AI to run simulations
  await estimateAllScheduledTickets(organization.id);
}
