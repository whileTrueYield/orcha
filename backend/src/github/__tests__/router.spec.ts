/**
 * Integration tests for the GitHub webhook route, driven over real HTTP with
 * supertest. The route verifies the HMAC over the raw body and activates a
 * pending link on a signed ping/pull_request from the repo.
 */

import expect from "expect";
import express from "express";
import request from "supertest";
import { createHmac, randomUUID } from "crypto";
import prisma from "../../prisma";
import {
  buildPullRequestPayload,
  createRandomOrganization,
  createRandomOrgAndUser,
  createRandomRepositoryLink,
  createRandomTicket,
} from "../../utils/testing";
import { githubRouter } from "../router";

const app = express();
app.use("/github", githubRouter);

function sign(secret: string, body: string): string {
  return `sha256=${createHmac("sha256", secret).update(Buffer.from(body)).digest("hex")}`;
}

function pingBody(repoFullName: string): string {
  return JSON.stringify({ zen: "Keep it simple", repository: { full_name: repoFullName } });
}

describe("POST /github/webhook/:token", () => {
  it("activates a pending link on a signed ping from the repo", async () => {
    const org = await createRandomOrganization();
    const { link, webhookToken, webhookSecret } =
      await createRandomRepositoryLink(org);
    const repo = `octo/${randomUUID()}`;
    const body = pingBody(repo);

    const res = await request(app)
      .post(`/github/webhook/${webhookToken}`)
      .set("x-github-event", "ping")
      .set("x-hub-signature-256", sign(webhookSecret, body))
      .set("content-type", "application/json")
      .send(body);

    expect(res.status).toBe(200);
    const reloaded = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: link.id },
    });
    expect(reloaded.status).toBe("ACTIVE");
    expect(reloaded.repoFullName).toBe(repo);
  });

  it("rejects a delivery with a bad signature and leaves the link pending", async () => {
    const org = await createRandomOrganization();
    const { link, webhookToken } = await createRandomRepositoryLink(org);
    const body = pingBody(`octo/${randomUUID()}`);

    const res = await request(app)
      .post(`/github/webhook/${webhookToken}`)
      .set("x-github-event", "ping")
      .set("x-hub-signature-256", sign("the-wrong-secret", body))
      .set("content-type", "application/json")
      .send(body);

    expect(res.status).toBe(401);
    const reloaded = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: link.id },
    });
    expect(reloaded.status).toBe("PENDING");
  });

  it("returns 404 for an unknown webhook token", async () => {
    const res = await request(app)
      .post(`/github/webhook/does-not-exist`)
      .set("x-github-event", "ping")
      .set("content-type", "application/json")
      .send(pingBody("octo/whatever"));

    expect(res.status).toBe(404);
  });

  it("returns 409 when the repo is already bound to another link", async () => {
    const repo = `famous/${randomUUID()}`;

    const ownerOrg = await createRandomOrganization();
    const owner = await createRandomRepositoryLink(ownerOrg);
    await request(app)
      .post(`/github/webhook/${owner.webhookToken}`)
      .set("x-github-event", "ping")
      .set("x-hub-signature-256", sign(owner.webhookSecret, pingBody(repo)))
      .set("content-type", "application/json")
      .send(pingBody(repo));

    const squatterOrg = await createRandomOrganization();
    const squatter = await createRandomRepositoryLink(squatterOrg);
    const res = await request(app)
      .post(`/github/webhook/${squatter.webhookToken}`)
      .set("x-github-event", "ping")
      .set("x-hub-signature-256", sign(squatter.webhookSecret, pingBody(repo)))
      .set("content-type", "application/json")
      .send(pingBody(repo));

    expect(res.status).toBe(409);
    const reloaded = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: squatter.link.id },
    });
    expect(reloaded.status).toBe("PENDING");
  });

  it("mirrors a pull_request onto the ticket its branch references", async () => {
    const { organization, role } = await createRandomOrgAndUser();
    const { webhookToken, webhookSecret } =
      await createRandomRepositoryLink(organization);
    const { ticket, product } = await createRandomTicket(organization, role);

    const repo = `octo/${randomUUID()}`;
    const body = JSON.stringify(
      buildPullRequestPayload(repo, {
        number: 7,
        head: { ref: `feature/${product.code}-${ticket.localId}` },
        title: "Implement the thing",
      }),
    );

    const res = await request(app)
      .post(`/github/webhook/${webhookToken}`)
      .set("x-github-event", "pull_request")
      .set("x-hub-signature-256", sign(webhookSecret, body))
      .set("content-type", "application/json")
      .send(body);

    expect(res.status).toBe(200);
    const row = await prisma.linkedPullRequest.findUniqueOrThrow({
      where: { repoFullName_number: { repoFullName: repo, number: 7 } },
      include: { tickets: true },
    });
    expect(row.tickets.map((t) => t.id)).toEqual([ticket.id]);
  });

  it("ignores a synchronize action (activates but mirrors nothing)", async () => {
    const { organization, role } = await createRandomOrgAndUser();
    const { webhookToken, webhookSecret } =
      await createRandomRepositoryLink(organization);
    const { ticket, product } = await createRandomTicket(organization, role);

    const repo = `octo/${randomUUID()}`;
    const body = JSON.stringify(
      buildPullRequestPayload(repo, {
        action: "synchronize",
        number: 8,
        head: { ref: `feature/${product.code}-${ticket.localId}` },
      }),
    );

    const res = await request(app)
      .post(`/github/webhook/${webhookToken}`)
      .set("x-github-event", "pull_request")
      .set("x-hub-signature-256", sign(webhookSecret, body))
      .set("content-type", "application/json")
      .send(body);

    expect(res.status).toBe(200);
    const row = await prisma.linkedPullRequest.findUnique({
      where: { repoFullName_number: { repoFullName: repo, number: 8 } },
    });
    expect(row).toBeNull();
  });
});
