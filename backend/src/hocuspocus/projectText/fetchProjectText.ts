import { ModelStage } from "@prisma/client";
import { DocumentToken } from "../documentToken";
import prisma from "../../prisma";
import { logger } from "../../logger";
import { getInitialYjsDocument } from "../helper";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { getDocFromBytes } from "../../utils/yjs";

export async function fetchProjectText(
  token: DocumentToken
): Promise<Buffer | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: token.documentId,
      organizationId: token.orgId,
      stage: { not: ModelStage.DELETED },
    },
    include: {
      projectText: true,
    },
  });

  if (!project) {
    return null;
  }

  if (project.projectText) {
    if (project.projectText.bytes) {
      const doc = getDocFromBytes(project.projectText.bytes);
      logger.info(JSON.stringify(TiptapTransformer.fromYdoc(doc), null, 2));
    }

    return project.projectText.bytes;
  } else {
    logger.info(" ++++++++++++++ adding an empty line ++++++++++++++ ");
    return getInitialYjsDocument();
  }
}
