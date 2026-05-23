import { OrganizationStatus } from "@generated/type-graphql";
import { Request, Response } from "express";
import { filter, get, trim, truncate } from "lodash";
import prisma from "../../prisma";
import { randomBytes } from "crypto";
import { loadTemplate, sendEmail } from "../../emails/email";
import { config } from "../../config";
import { assertProofOfWork } from "../auth/helper";
import { logger } from "../../logger";
import { IssueActionCategory } from "@prisma/client";

export async function addImageToIssue(req: Request, res: Response) {
  const hash = get(req.body, "hash", "");
  const proof = get(req.body, "proof", "");
  const token = get(req.body, "token", "");
  const imageUrl = get(req.body, "imageUrl", "");

  try {
    await assertProofOfWork(req.ip, hash, proof);
  } catch {
    logger.warn(
      `reportIssue(...): Bad proof of work provided, IPs: ${req.ips},  IP: ${req.ip}`
    );
    return badRequest(res);
  }

  if (!token || !imageUrl) {
    return badRequest(res);
  }

  const issue = await prisma.issue.findFirstOrThrow({
    where: { token },
  });

  await prisma.issueAction.create({
    data: {
      organizationId: issue.organizationId,
      issueId: issue.id,
      title: `${issue.email} sent a new image`,
      category: IssueActionCategory.CLIENT_IMAGE,
      body: imageUrl,
    },
  });

  res.status(200);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ imageUrl }));
  res.end();
}
/**
 * Confirm a user's email address when a user clicks on the link provided in the
 * confirmation email.
 */
export async function reportIssue(req: Request, res: Response) {
  const hash = get(req.body, "hash", "");
  const proof = get(req.body, "proof", "");

  try {
    await assertProofOfWork(req.ip, hash, proof);
  } catch {
    logger.warn(
      `reportIssue(...): Bad proof of work provided, IPs: ${req.ips},  IP: ${req.ip}`
    );
    return badRequest(res);
  }

  const description = get(req.body, "description", "");
  const email = get(req.body, "email", "");
  const name = get(req.body, "name", "");
  const productId = parseInt(get(req.body, "productId", ""));
  const url = get(req.body, "url", "");
  const metaData = get(req.body, "metaData", "");
  const userAgent = get(req.headers, "user-agent", "");

  if (!userAgent) {
    return badRequest(res);
  }

  if (isNaN(productId)) {
    return badRequest(res, "Bad product ID");
  }

  const isEmail = /\S+@\S+\.\S+/gi.test(email);
  if (!isEmail) {
    return badRequest(res, "Bad email address");
  }

  // we should have a product URL restriction to reduce the chances of abuses
  // const origin = get(req.body, "origin", "");
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      organization: {
        status: OrganizationStatus.ACTIVE,
      },
    },
  });

  if (!product) {
    return badRequest(res, "Bad product ID");
  }

  if (!product.isSupportActive) {
    return badRequest(res, "Support has not been activated");
  }

  const last_issue = await prisma.issue.findFirst({
    where: {
      organizationId: product.organizationId,
    },
    select: { localId: true },
    orderBy: { localId: "desc" },
  });

  const token = randomBytes(32).toString("hex");
  const issue = await prisma.issue.create({
    data: {
      productId: product.id,
      organizationId: product.organizationId,
      email,
      name,
      description: truncate(description, { length: 2048 }),
      metaData,
      url,
      userAgent,
      token,
      localId: last_issue?.localId ? last_issue.localId + 1 : 1,
    },
  });

  const { html, text } = await loadTemplate({
    template: "new_issue",
    data: {
      email: issue.email,
      name: issue.name,
      url: `${config.webAppUri}/support/${token}/`,
      description: filter(issue.description.split("\n").map(trim)),
    },
  });

  try {
    await sendEmail({
      ToAddresses: [issue.email],
      html,
      text,
      subject: `Support Case: ${issue.id}`,
    });

    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ issueId: issue.id, token: issue.token }));
    res.end();
  } catch (error) {
    logger.error(error);
    res.status(500);
    res.setHeader("Content-Type", "application/json");
    res.send({
      status: "error",
      data: { message: "Server Error" },
    });
    res.end();
  }
}

export async function contactUs(req: Request, res: Response): Promise<void> {
  try {
    const hash = get(req.body, "hash", "") as string;
    const proof = get(req.body, "proof", "") as string;
    await assertProofOfWork(req.ip, hash, proof);
  } catch {
    logger.warn(
      `reportIssue(...): Bad proof of work provided, IPs: ${req.ips},  IP: ${req.ip}`
    );
    return badRequest(res);
  }

  try {
    const email = get(req.body, "email", "") as string;
    const firstName = get(req.body, "firstName", "") as string;
    const lastName = get(req.body, "lastName", "") as string;
    const companyName = get(req.body, "companyName", "") as string;
    const countryCode = get(req.body, "countryCode", "") as string;
    const phoneNumber = get(req.body, "phoneNumber", "") as string;
    const message = get(req.body, "message", "") as string;
    const topic = get(req.body, "topic", "") as string;
    const companySize = get(req.body, "companySize", "") as string;
    const department = get(req.body, "department", "") as string;

    const { html, text } = await loadTemplate({
      template: "new_contact_request",
      data: {
        email,
        firstName,
        lastName,
        companyName,
        countryCode,
        phoneNumber,
        topic,
        companySize,
        department,
        description: filter(message.split("\n").map(trim)),
      },
    });

    await sendEmail({
      ToAddresses: ["jill@orchalabs.com"],
      html,
      text,
      subject: "Prospect: " + topic,
    });
  } catch (error) {
    logger.error(error);
    return badRequest(res);
  }

  res.status(201);
  res.end();
}

function badRequest(res: Response, message: string = "Bad request"): void {
  res.status(400);
  res.setHeader("Content-Type", "application/json");
  res.send({
    status: "error",
    data: { message },
  });
  res.end();
}
