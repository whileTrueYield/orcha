// Promotes a GitHub Repository link from pending to active once a webhook
// delivery has proven the creator controls the repo. Reservation correctness
// rests on the DB: repoFullName is @unique, so the activating UPDATE either
// succeeds (this link reserves the repo) or violates the constraint (another
// active link already holds it). That makes the squatting guard atomic — no
// read-then-write race to lose. See ADR 0011.

import {
  Prisma,
  PrismaClient,
  RepositoryLink,
  RepositoryLinkStatus,
} from "@prisma/client";

export type ActivationOutcome = "activated" | "already_active" | "repo_taken";

export interface ActivationResult {
  outcome: ActivationOutcome;
  link: RepositoryLink;
}

export async function activateRepositoryLink(
  db: PrismaClient,
  link: RepositoryLink,
  repoFullName: string
): Promise<ActivationResult> {
  // Re-deliveries of a ping/PR event to an already-bound repo are normal; treat
  // them as a no-op rather than re-stamping or erroring.
  if (link.status === RepositoryLinkStatus.ACTIVE) {
    return { outcome: "already_active", link };
  }

  try {
    const activated = await db.repositoryLink.update({
      where: { id: link.id },
      data: {
        status: RepositoryLinkStatus.ACTIVE,
        repoFullName,
        activatedAt: new Date(),
      },
    });
    return { outcome: "activated", link: activated };
  } catch (error) {
    // P2002 = unique violation. The only unique column this UPDATE touches is
    // repoFullName, so a violation means the repo is already actively bound
    // elsewhere. Surface that as a domain outcome and leave this link pending;
    // any other error is unexpected and propagates.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { outcome: "repo_taken", link };
    }
    throw error;
  }
}
