import { ModelStage } from "@prisma/client";
import prisma from "../../prisma";
import { logger } from "../../logger";
import { getInitialYjsDocument } from "../helper";
import { DocumentToken } from "../documentToken";

export async function fetchDocumentationText(
  token: DocumentToken
): Promise<Buffer | null> {
  const documentationPage = await prisma.documentationPage.findFirst({
    where: {
      id: token.documentId,
      organizationId: token.orgId,
      documentation: {
        stage: { not: ModelStage.DELETED },
      },
    },
    include: {
      documentationPageText: true,
    },
  });

  if (!documentationPage) {
    return null;
  }

  if (documentationPage.documentationPageText) {
    return documentationPage.documentationPageText.bytes;
  } else {
    logger.info(" ++++++++++++++ adding an empty line ++++++++++++++ ");
    return getInitialYjsDocument();
  }
}
