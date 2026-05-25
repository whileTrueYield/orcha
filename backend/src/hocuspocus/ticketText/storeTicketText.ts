import { ModelStage } from "@prisma/client";
import prisma from "../../prisma";
import { logger } from "../../logger";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { getDocFromBytes } from "../../utils/yjs";
import { getTextFromTipTapJson } from "../getText";
import { DocumentToken } from "../documentToken";
import { notifyMentionedUsersInTicket } from "../../models/notification/createNotification";

export async function storeTicketText(
  token: DocumentToken,
  state: Uint8Array,
): Promise<null> {
  logger.info("storing ticket text");
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: token.documentId,
      organizationId: token.orgId,
      stage: { in: [ModelStage.DRAFT, ModelStage.PUBLISHED] },
      project: {
        OR: [{ ancestorIsArchived: false }, { stage: ModelStage.PUBLISHED }],
      },
    },
    include: {
      ticketText: true,
    },
  });

  // do not save if ticket not found or not allowed to receive edits
  // (archived ticket are read only)
  if (!ticket) {
    return null;
  }

  if (ticket.ticketText) {
    await prisma.ticketText.updateMany({
      where: { ticketId: ticket.id },
      data: { bytes: Buffer.from(state) },
    });

    // store the indexable data into the database for search
    try {
      const doc = getDocFromBytes(state);
      const content = TiptapTransformer.fromYdoc(doc);

      await notifyMentionedUsersInTicket(
        ticket.id,
        ticket.organizationId,
        token.roleId,
        content,
      );

      logger.info(getTextFromTipTapJson(content));
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { indexableContent: getTextFromTipTapJson(content) },
      });
    } catch (error) {
      logger.error(error);
    }
  } else {
    logger.error("ticket.ticketText is null");
    await prisma.ticketText.create({
      data: {
        ticket: { connect: { id: ticket.id } },
        bytes: Buffer.from(state),
      },
    });
  }

  return null;
}
