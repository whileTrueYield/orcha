import { ModelStage } from "@prisma/client";
import { DocumentToken } from "../documentToken";
import prisma from "../../prisma";
import { logger } from "../../logger";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { getDocFromBytes } from "../../utils/yjs";
import { getTextFromTipTapJson } from "../getText";
import { notifyMentionedUsersInProject } from "../../models/notification/createNotification";

export async function storeProjectText(
  token: DocumentToken,
  state: Uint8Array<ArrayBuffer>,
): Promise<null> {
  logger.info("storing project text");
  const project = await prisma.project.findFirst({
    where: {
      id: token.documentId,
      organizationId: token.orgId,
      ancestorIsArchived: false,
      stage: { in: [ModelStage.DRAFT, ModelStage.PUBLISHED] },
    },
    include: {
      projectText: true,
    },
  });

  // do not save if project not found or not allowed to receive edits
  // (archived project are read only)
  if (!project) {
    return null;
  }

  if (project.projectText) {
    logger.info("project.projectText exists, updating it");
    await prisma.projectText.updateMany({
      where: { projectId: project.id },
      data: { bytes: state },
    });

    // store the indexable data into the database for search
    try {
      const doc = getDocFromBytes(state);
      const content = TiptapTransformer.fromYdoc(doc);

      await notifyMentionedUsersInProject(
        project.id,
        project.organizationId,
        token.roleId,
        content,
      );

      await prisma.project.update({
        where: { id: project.id },
        data: { indexableContent: getTextFromTipTapJson(content) },
      });
    } catch (error) {
      logger.info(error);
    }
  } else {
    logger.info("project.projectText is null");
    await prisma.projectText.create({
      data: {
        project: { connect: { id: project.id } },
        bytes: state,
      },
    });
  }

  return null;
}
