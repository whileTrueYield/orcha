/**
 * Document-body tenant scoping + writability (#40).
 *
 * Exports: assertDocumentWritable(type, id, organizationId).
 *
 * The body repository keys on a raw parent id with no organization or state
 * check — it is a pure storage layer. Every write must first prove the parent
 * document (a) belongs to the caller's Organization and (b) is in a writable
 * state. We reuse `findFirstOrThrow` excluding DELETED so a foreign, missing, or
 * deleted parent raises the same Prisma not-found the rest of the schema maps to
 * NOT_FOUND / 404; an ARCHIVED document exists but is read-only, so it raises
 * FORBIDDEN / 403. A documentation page inherits its parent Documentation's
 * stage (pages have no stage of their own).
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import prisma from "../../prisma";
import type { BodyType } from "../../markdown/bodyRepository";

// Load the document's governing stage, scoped to the org and excluding DELETED
// (which reads as not-found). Throws Prisma's not-found for a foreign/missing/
// deleted parent.
const STAGE_OF: Record<
  BodyType,
  (id: number, organizationId: number) => Promise<ModelStage>
> = {
  ticket: async (id, organizationId) =>
    (
      await prisma.ticket.findFirstOrThrow({
        where: { id, organizationId, stage: { not: ModelStage.DELETED } },
        select: { stage: true },
      })
    ).stage,
  project: async (id, organizationId) =>
    (
      await prisma.project.findFirstOrThrow({
        where: { id, organizationId, stage: { not: ModelStage.DELETED } },
        select: { stage: true },
      })
    ).stage,
  documentation: async (id, organizationId) =>
    (
      await prisma.documentationPage.findFirstOrThrow({
        where: {
          id,
          organizationId,
          documentation: { stage: { not: ModelStage.DELETED } },
        },
        select: { documentation: { select: { stage: true } } },
      })
    ).documentation.stage,
};

export async function assertDocumentWritable(
  type: BodyType,
  id: number,
  organizationId: number,
): Promise<void> {
  const stage = await STAGE_OF[type](id, organizationId);
  if (stage === ModelStage.ARCHIVED) {
    throw new GraphQLError(`This ${type} is archived and cannot be edited.`, {
      extensions: { code: "FORBIDDEN" },
    });
  }
}
