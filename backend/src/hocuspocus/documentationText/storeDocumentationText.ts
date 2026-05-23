import { ModelStage } from "@prisma/client";
import prisma from "../../prisma";
import { DocumentToken } from "../documentToken";
import { logger } from "../../logger";
import { getTextFromTipTapJson } from "../getText";
import { getDocFromBytes } from "../../utils/yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";

export async function storeDocumentationText(
  token: DocumentToken,
  state: Buffer
): Promise<null> {
  const documentationPage = await prisma.documentationPage.findFirst({
    where: {
      id: token.documentId,
      organizationId: token.orgId,
      documentation: {
        stage: { in: [ModelStage.DRAFT, ModelStage.PUBLISHED] },
      },
    },
    include: {
      documentationPageText: true,
    },
  });

  // do not save if documentation not found or not allowed to receive edits
  // (archived documentation are read only)
  if (!documentationPage) {
    return null;
  }

  if (documentationPage.documentationPageText) {
    await prisma.documentationPageText.updateMany({
      where: { documentationPageId: documentationPage.id },
      data: { bytes: state },
    });

    // store the indexable data into the database for search
    try {
      const doc = getDocFromBytes(state);
      const content = TiptapTransformer.fromYdoc(doc);
      await prisma.documentationPage.update({
        where: { id: documentationPage.id },
        data: { indexableContent: getTextFromTipTapJson(content) },
      });
    } catch (e) {
      logger.error("Error while storing indexable content", e);
    }
  } else {
    await prisma.documentationPageText.create({
      data: {
        documentationPage: { connect: { id: documentationPage.id } },
        bytes: state,
      },
    });
  }

  return null;
}
