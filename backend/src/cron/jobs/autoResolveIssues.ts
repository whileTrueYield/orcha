import prisma from "../../prisma";
import { logger } from "../../logger";
import { IssueActionCategory, IssueStatus } from "@prisma/client";

export async function autoResolveIssues(): Promise<void> {
  const issuesToResolve = await prisma.issue.findMany({
    select: {
      id: true,
      organizationId: true,
    },
    where: {
      status: { not: IssueStatus.RESOLVED },
      resolveAfterDate: { lt: new Date() },
    },
    take: 50,
  });

  // nothing to do
  if (issuesToResolve.length === 0) {
    logger.info("No issue to auto-resolve");
    return;
  }

  for (const issue of issuesToResolve) {
    await prisma.issue.update({
      where: { id: issue.id },
      data: {
        status: IssueStatus.RESOLVED,
      },
    });

    // add to actions for audit, we do not need to create any other
    // record since issue information are mostly made out of issue actions
    await prisma.issueAction.create({
      data: {
        organizationId: issue.organizationId,
        issueId: issue.id,
        title: "Issue was resolved due to inactivity",
        category: IssueActionCategory.AUTO_RESOLVED,
      },
    });
  }

  logger.info(`Marked ${issuesToResolve.length} issues as resolved`);
}
