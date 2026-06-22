/**
 * Tests for mirrorPullRequest — the heart of the PR mirror. Given an active
 * Repository link and a `pull_request` payload, it resolves the Ticket refs in
 * the PR's branch + title to published tickets in the bound org, then upserts a
 * LinkedPullRequest keyed by (repo, number) whose ticket associations are
 * re-derived on every delivery. A stale (older updated_at) delivery never
 * regresses a row. See ADR 0011 and issue #121.
 */

import expect from "expect";
import prisma from "../../prisma";
import { ModelStage } from "@prisma/client";
import {
  buildPullRequestPayload,
  createRandomOrgAndUser,
  createRandomProduct,
  createRandomRepositoryLink,
  createRandomTicket,
} from "../../utils/testing";
import { mirrorPullRequest } from "../mirror";

// Stand up an org with an ACTIVE link bound to a repo, plus an authoring role.
async function setup() {
  const { organization, role } = await createRandomOrgAndUser();
  const repoFullName = `octo/${organization.id}-repo`;
  const { link } = await createRandomRepositoryLink(organization, {
    status: "ACTIVE",
    repoFullName,
    activatedAt: new Date(),
  });
  return { organization, role, link, repoFullName };
}

function refOf(productCode: string, localId: number): string {
  return `${productCode}-${localId}`;
}

describe("mirrorPullRequest", () => {
  it("mirrors a PR onto the published ticket its branch references", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const { ticket, product } = await createRandomTicket(organization, role);

    const payload = buildPullRequestPayload(repoFullName, {
      number: 10,
      head: { ref: `feature/${refOf(product.code, ticket.localId!)}-x` },
      title: "Some work",
    });

    const result = await mirrorPullRequest(prisma, link, payload);

    expect(result.outcome).toBe("mirrored");
    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 10 } },
      include: { tickets: true },
    });
    expect(row.tickets.map((t) => t.id)).toEqual([ticket.id]);
    expect(row.state).toBe("OPEN");
  });

  it("resolves the product code case-insensitively", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const product = await createRandomProduct(organization, { code: "WEB" });
    const { ticket } = await createRandomTicket(organization, role, product);

    const payload = buildPullRequestPayload(repoFullName, {
      number: 11,
      title: `fixes web-${ticket.localId}`,
      head: { ref: "feature/branch" },
    });

    await mirrorPullRequest(prisma, link, payload);
    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 11 } },
      include: { tickets: true },
    });
    expect(row.tickets.map((t) => t.id)).toEqual([ticket.id]);
  });

  it("links one PR to several tickets (branch + title)", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const a = await createRandomTicket(organization, role);
    const b = await createRandomTicket(organization, role);

    const payload = buildPullRequestPayload(repoFullName, {
      number: 12,
      head: { ref: `feat/${refOf(a.product.code, a.ticket.localId!)}` },
      title: `also ${refOf(b.product.code, b.ticket.localId!)}`,
    });

    await mirrorPullRequest(prisma, link, payload);
    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 12 } },
      include: { tickets: true },
    });
    expect(row.tickets.map((t) => t.id).sort()).toEqual(
      [a.ticket.id, b.ticket.id].sort(),
    );
  });

  it("re-derives the link set: a later title edit adds a ticket", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const a = await createRandomTicket(organization, role);
    const b = await createRandomTicket(organization, role);

    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 13,
        head: { ref: `feat/${refOf(a.product.code, a.ticket.localId!)}` },
        updated_at: "2026-06-21T10:00:00Z",
      }),
    );

    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 13,
        head: { ref: `feat/${refOf(a.product.code, a.ticket.localId!)}` },
        title: `now also ${refOf(b.product.code, b.ticket.localId!)}`,
        updated_at: "2026-06-21T11:00:00Z",
      }),
    );

    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 13 } },
      include: { tickets: true },
    });
    expect(row.tickets.map((t) => t.id).sort()).toEqual(
      [a.ticket.id, b.ticket.id].sort(),
    );
  });

  it("re-derives the link set: a later title edit removes a ticket", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const a = await createRandomTicket(organization, role);
    const b = await createRandomTicket(organization, role);

    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 14,
        head: { ref: `feat/${refOf(a.product.code, a.ticket.localId!)}` },
        title: `and ${refOf(b.product.code, b.ticket.localId!)}`,
        updated_at: "2026-06-21T10:00:00Z",
      }),
    );

    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 14,
        head: { ref: `feat/${refOf(a.product.code, a.ticket.localId!)}` },
        title: "dropped the second ref",
        updated_at: "2026-06-21T11:00:00Z",
      }),
    );

    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 14 } },
      include: { tickets: true },
    });
    expect(row.tickets.map((t) => t.id)).toEqual([a.ticket.id]);
  });

  it("drops an unresolved ref silently (no row created)", async () => {
    const { link, repoFullName } = await setup();
    const payload = buildPullRequestPayload(repoFullName, {
      number: 15,
      head: { ref: "feature/NOPE-999" },
      title: "references nothing real",
    });

    const result = await mirrorPullRequest(prisma, link, payload);

    expect(result.outcome).toBe("no_refs");
    const row = await prisma.linkedPullRequest.findUnique({
      where: { repoFullName_number: { repoFullName, number: 15 } },
    });
    expect(row).toBeNull();
  });

  it("does not resolve a draft (unpublished) ticket", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const { ticket, product } = await createRandomTicket(organization, role, undefined, {
      stage: ModelStage.DRAFT,
    });

    const payload = buildPullRequestPayload(repoFullName, {
      number: 16,
      head: { ref: `feature/${refOf(product.code, ticket.localId!)}` },
    });

    const result = await mirrorPullRequest(prisma, link, payload);
    expect(result.outcome).toBe("no_refs");
  });

  it("mirrors merged state on a close delivery", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const { ticket, product } = await createRandomTicket(organization, role);
    const ref = `feature/${refOf(product.code, ticket.localId!)}`;

    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 17,
        head: { ref },
        updated_at: "2026-06-21T10:00:00Z",
      }),
    );
    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 17,
        head: { ref },
        state: "closed",
        merged: true,
        updated_at: "2026-06-21T12:00:00Z",
      }),
    );

    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 17 } },
    });
    expect(row.state).toBe("MERGED");
  });

  it("ignores a stale (older updated_at) delivery", async () => {
    const { organization, role, link, repoFullName } = await setup();
    const { ticket, product } = await createRandomTicket(organization, role);
    const ref = `feature/${refOf(product.code, ticket.localId!)}`;

    // The current truth: merged, at noon.
    await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 18,
        head: { ref },
        state: "closed",
        merged: true,
        updated_at: "2026-06-21T12:00:00Z",
      }),
    );

    // A late, out-of-order "opened" delivery from the morning must not regress.
    const result = await mirrorPullRequest(
      prisma,
      link,
      buildPullRequestPayload(repoFullName, {
        number: 18,
        head: { ref },
        state: "open",
        merged: false,
        updated_at: "2026-06-21T09:00:00Z",
      }),
    );

    expect(result.outcome).toBe("stale");
    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName, number: 18 } },
    });
    expect(row.state).toBe("MERGED");
  });
});
