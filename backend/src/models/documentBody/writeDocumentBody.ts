/**
 * writeDocumentBody (#40) — the one service every body write funnels through,
 * shared by the GraphQL mutation and (via that mutation) the /v1 REST surface.
 *
 * Exports: writeDocumentBody(params) -> SaveDocumentBodyResultShape.
 *
 * It composes the #38/#39 modules into the write contract of ADR 0007:
 *   1. resolve loose `@name` / `#123` references to id-bearing directives
 *      (org-scoped lookups), surfacing unresolved ones as warnings;
 *   2. persist with optimistic concurrency (fast-forward / 3-way merge / conflict);
 *   3. on success, repopulate the parent's `indexableContent` for search and
 *      notify the Roles newly mentioned by this write (diffed against the body
 *      as it stood before the write, so re-saves don't re-notify).
 *
 * Tenant scoping is the caller's responsibility (see assertDocumentInOrg): this
 * service trusts that `id` belongs to `organizationId`.
 *
 * Documentation bodies have no notification target in the schema, so mentions in
 * them resolve and index but raise no notification.
 */

import { NotificationCategory, NotificationTarget } from "@prisma/client";
import prisma from "../../prisma";
import { analyze } from "../../markdown/analysis";
import { getBody, saveBody, type BodyType } from "../../markdown/bodyRepository";
import { resolveMentions, type MentionResolvers } from "../../markdown/resolve";
import { createNotificationsForTarget } from "../notification/createNotification";
import type {
  MentionWarningShape,
  SaveDocumentBodyResultShape,
} from "./entity";

export type WriteDocumentBodyParams = {
  type: BodyType;
  id: number;
  markdown: string;
  baseVersion: number;
  organizationId: number;
  actorRoleId: number;
};

// Per-type repopulation of the search column. Kept beside the write so search
// can never drift from the stored Markdown.
const REINDEXERS: Record<
  BodyType,
  (id: number, indexableContent: string) => Promise<unknown>
> = {
  ticket: (id, indexableContent) =>
    prisma.ticket.update({ where: { id }, data: { indexableContent } }),
  project: (id, indexableContent) =>
    prisma.project.update({ where: { id }, data: { indexableContent } }),
  documentation: (id, indexableContent) =>
    prisma.documentationPage.update({ where: { id }, data: { indexableContent } }),
};

// Which notification target a mention in each body type maps to. Documentation
// has none (no DOCUMENTATION target exists), so its mentions never notify.
const NOTIFY_TARGET: Partial<Record<BodyType, NotificationTarget>> = {
  ticket: NotificationTarget.TICKET,
  project: NotificationTarget.PROJECT,
};

function buildResolvers(organizationId: number): MentionResolvers {
  return {
    rolesByName: async (name) => {
      const roles = await prisma.role.findMany({
        where: { organizationId, name },
        select: { id: true },
      });
      return roles.map((role) => role.id);
    },
    // A `#n` reference is a ticket's per-product localId within the org. IDEA:
    // localId is not globally unique across products, so an ambiguous number
    // resolves to the first match; a product-qualified reference would be exact.
    ticketByNumber: async (n) => {
      const ticket = await prisma.ticket.findFirst({
        where: { organizationId, localId: n },
        select: { id: true },
      });
      return ticket?.id ?? null;
    },
  };
}

function toWarning(warning: {
  kind: string;
  reference: string;
  matches?: number;
}): MentionWarningShape {
  return {
    kind: warning.kind,
    reference: warning.reference,
    matches: warning.matches ?? null,
  };
}

export async function writeDocumentBody({
  type,
  id,
  markdown,
  baseVersion,
  organizationId,
  actorRoleId,
}: WriteDocumentBodyParams): Promise<SaveDocumentBodyResultShape> {
  // Mentions present before this write — the baseline for "newly mentioned".
  const priorMentions = new Set(
    analyze((await getBody(type, id)).markdown).mentions,
  );

  const resolution = await resolveMentions(markdown, buildResolvers(organizationId));
  const result = await saveBody(type, id, resolution.markdown, baseVersion);

  // A conflict wrote nothing, so neither index nor notifications change.
  if (!result.ok) {
    return {
      body: null,
      conflict: { markdown: result.markered, version: result.version },
      warnings: [],
    };
  }

  const analysis = analyze(result.body.markdown);
  await REINDEXERS[type](id, analysis.plainText);

  const target = NOTIFY_TARGET[type];
  if (target) {
    const newlyMentioned = analysis.mentions.filter((m) => !priorMentions.has(m));
    if (newlyMentioned.length > 0) {
      await createNotificationsForTarget(
        organizationId,
        NotificationCategory.MENTION,
        target,
        id,
        newlyMentioned,
        actorRoleId,
        `{} mentioned you in a ${type}`,
      );
    }
  }

  return {
    body: result.body,
    conflict: null,
    warnings: resolution.warnings.map(toWarning),
  };
}
