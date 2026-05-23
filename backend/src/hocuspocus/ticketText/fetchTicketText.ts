import { ModelStage } from "@prisma/client";
import { DocumentToken } from "../documentToken";
import prisma from "../../prisma";
import { logger } from "../../logger";
import { getInitialYjsDocument } from "../helper";

export async function fetchTicketText(
  token: DocumentToken
): Promise<Buffer | null> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: token.documentId,
      organizationId: token.orgId,
      stage: { not: ModelStage.DELETED },
    },
    include: {
      ticketText: true,
    },
  });

  if (!ticket) {
    return null;
  }

  if (ticket.ticketText) {
    return ticket.ticketText.bytes;
  } else {
    logger.info(" ++++++++++++++ adding an empty line ++++++++++++++ ");
    return getInitialYjsDocument();
  }
}
