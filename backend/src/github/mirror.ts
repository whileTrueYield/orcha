// Mirrors a GitHub pull request onto the Ticket(s) it references, for an ACTIVE
// Repository link. This is the core of the PR mirror (ADR 0011, issue #121):
//
//   parse refs from branch + title → resolve each within the bound org to a
//   published ticket → upsert a LinkedPullRequest keyed by (repo, number) whose
//   ticket associations are RE-DERIVED on every delivery.
//
// Two invariants shape the logic:
//   - The mirror reflects the PR's *current* refs, so the ticket set is replaced
//     (not appended) each event — a title edit that drops a ref drops the link.
//   - GitHub deliveries can arrive out of order, so a delivery whose payload
//     `updated_at` predates the stored one is dropped without regressing state.
//
// A PR that resolves to no tickets never creates a row (a busy repo's unrelated
// PRs must not accumulate as orphans); if an existing row loses all its refs it
// is removed, since nothing references it any more.

import { PrismaClient, RepositoryLink, Ticket } from "@prisma/client";
import { ModelStage } from "@prisma/client";
import { logger } from "../logger";
import { parseTicketRefs } from "./refs";
import { parsePullRequestPayload } from "./pullRequest";

export type MirrorOutcome = "mirrored" | "unlinked" | "no_refs" | "stale";

export interface MirrorResult {
  outcome: MirrorOutcome;
}

// Resolves Ticket refs to published tickets within one organization. Each ref's
// product code is matched case-insensitively, then its localId to a ticket in
// that product. Unresolved refs (no such product/localId, or a non-published
// ticket) are dropped silently. Returns deduped tickets.
export async function resolveTicketsForRefs(
  db: PrismaClient,
  organizationId: number,
  refs: { productCode: string; localId: number }[],
): Promise<Ticket[]> {
  const byId = new Map<number, Ticket>();

  for (const ref of refs) {
    const ticket = await db.ticket.findFirst({
      where: {
        organizationId,
        localId: ref.localId,
        stage: ModelStage.PUBLISHED,
        product: {
          // A product code is unique within an org; equals-insensitive resolves
          // the ref the way a user reading `BUGS-1` would.
          code: { equals: ref.productCode, mode: "insensitive" },
        },
      },
    });

    if (ticket) {
      byId.set(ticket.id, ticket);
    }
  }

  return Array.from(byId.values());
}

export async function mirrorPullRequest(
  db: PrismaClient,
  link: RepositoryLink,
  payload: unknown,
): Promise<MirrorResult> {
  const pr = parsePullRequestPayload(payload);

  const refs = parseTicketRefs(`${pr.headRef} ${pr.title}`);
  const tickets = await resolveTicketsForRefs(db, link.organizationId, refs);
  const ticketIds = tickets.map((ticket) => ({ id: ticket.id }));

  const existing = await db.linkedPullRequest.findUnique({
    where: {
      repoFullName_number: {
        repoFullName: pr.repoFullName,
        number: pr.number,
      },
    },
  });

  // Out-of-order guard: a delivery older than what we already stored is a stale
  // redelivery and must not regress the mirrored state or the link set.
  if (existing && pr.githubUpdatedAt < existing.githubUpdatedAt) {
    return { outcome: "stale" };
  }

  // The PR references nothing we recognise. Don't create an orphan row; if a row
  // existed it just lost its last ref, so remove it.
  if (tickets.length === 0) {
    if (existing) {
      await db.linkedPullRequest.delete({ where: { id: existing.id } });
      return { outcome: "unlinked" };
    }
    return { outcome: "no_refs" };
  }

  const mirrored = {
    title: pr.title,
    state: pr.state,
    isDraft: pr.isDraft,
    authorLogin: pr.authorLogin,
    htmlUrl: pr.htmlUrl,
    githubUpdatedAt: pr.githubUpdatedAt,
  };

  await db.linkedPullRequest.upsert({
    where: {
      repoFullName_number: {
        repoFullName: pr.repoFullName,
        number: pr.number,
      },
    },
    create: {
      repoFullName: pr.repoFullName,
      number: pr.number,
      organizationId: link.organizationId,
      repositoryLinkId: link.id,
      ...mirrored,
      tickets: { connect: ticketIds },
    },
    // `set` re-derives the association from the PR's current refs — the mirror's
    // central promise. `connect`/`disconnect` would leave stale links behind.
    update: {
      ...mirrored,
      tickets: { set: ticketIds },
    },
  });

  logger.info(
    `Mirrored PR ${pr.repoFullName}#${pr.number} onto ${tickets.length} ticket(s)`,
  );
  return { outcome: "mirrored" };
}
