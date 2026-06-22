// Handles an inbound GitHub webhook delivery for a Repository link. The route
// is mounted ahead of the global JSON body parser (like /v1 and /mcp) and uses
// its own raw() parser, so `req.body` is the exact bytes GitHub signed — needed
// for HMAC verification.
//
// Flow: verify the signature, then on a ping/pull_request from the repo promote
// a pending link to active (proving repo control). For a `pull_request` event
// whose action carries reviewable state, also mirror the PR onto the Ticket(s)
// it references (#121). See ADR 0011.

import { Request, Response } from "express";
import prisma from "../prisma";
import { logger } from "../logger";
import { decryptSecret } from "../utils/crypto";
import { verifySignature } from "./credentials";
import { activateRepositoryLink } from "./activation";
import { mirrorPullRequest } from "./mirror";

// The `pull_request` actions that change what the mirror should show. We
// deliberately ignore `synchronize` (a new commit pushed) — it does not change
// the PR's title, state, or draft flag, so it would re-derive to the same row.
const MIRRORED_PR_ACTIONS = new Set([
  "opened",
  "edited",
  "reopened",
  "closed",
  "ready_for_review",
  "converted_to_draft",
]);

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const link = await prisma.repositoryLink.findUnique({
    where: { webhookToken: req.params.token },
  });

  // Unknown token: respond 404 without distinguishing "never existed" from
  // "deleted" — there is nothing to verify against.
  if (!link) {
    res.status(404).json({ error: "unknown webhook" });
    return;
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
  const secret = decryptSecret(link.webhookSecretEnc);
  const signature = req.header("x-hub-signature-256");

  if (!verifySignature(rawBody, secret, signature)) {
    res.status(401).json({ error: "invalid signature" });
    return;
  }

  const event = req.header("x-github-event");

  // ping (sent on webhook creation) and pull_request both carry the repository,
  // so either can prove control and activate the link.
  if (event === "ping" || event === "pull_request") {
    const payload = JSON.parse(rawBody.toString("utf8"));
    const repoFullName: unknown = payload?.repository?.full_name;

    if (typeof repoFullName !== "string" || repoFullName.length === 0) {
      res.status(400).json({ error: "missing repository.full_name" });
      return;
    }

    const result = await activateRepositoryLink(prisma, link, repoFullName);

    if (result.outcome === "repo_taken") {
      res.status(409).json({ error: "repository already linked" });
      return;
    }

    // The link is now active (just activated, or already was). A reviewable
    // pull_request action mirrors the PR onto its Ticket(s); activation is
    // already committed, so a mirror failure never un-proves repo control.
    if (event === "pull_request" && MIRRORED_PR_ACTIONS.has(payload?.action)) {
      await mirrorPullRequest(prisma, result.link, payload);
    }

    res.status(200).json({ status: result.outcome });
    return;
  }

  // Any other event is acknowledged so GitHub marks the delivery successful,
  // but is otherwise a no-op in this slice.
  logger.info(`Ignoring GitHub webhook event "${event}" for link ${link.id}`);
  res.status(202).json({ status: "ignored" });
}
