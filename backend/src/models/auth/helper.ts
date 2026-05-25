import prisma from "../../prisma";
import { compare, hash } from "bcrypt";
import { config } from "../../config";
import { createHash, randomBytes } from "crypto";
import { PasswordLost, EmailConfirmation } from "@prisma/client";
import { redis } from "../../redis";
import { subSeconds } from "date-fns";
import { logger } from "../../logger";

export interface VerifyConfirmationArgs {
  email: string;
  secret: string;
}
export async function verifyConfirmation({
  email,
  secret,
}: VerifyConfirmationArgs): Promise<boolean> {
  const emailConfirmation = await prisma.emailConfirmation.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!emailConfirmation) {
    return false;
  }

  const expirationDate =
    new Date(emailConfirmation.updatedAt).getTime() +
    config.email.confirmLinkExpiration * 1000;
  if (expirationDate < new Date().getTime()) {
    return false;
  }

  return compare(secret, emailConfirmation.secret);
}
interface PasswordLostRequestArgs {
  email: string;
  secret: string;
}

export async function verifyPasswordLost({
  email,
  secret,
}: PasswordLostRequestArgs): Promise<boolean> {
  const passwordLostRequests = await prisma.passwordLost.findMany({
    where: {
      email: email.toLowerCase(),
      createdAt: {
        gt: subSeconds(new Date(), config.password_lost_token_expiration),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  for (const passwordLostRequest of passwordLostRequests) {
    if (await compare(secret, passwordLostRequest.secret)) {
      return true;
    }
  }

  return false;
}

interface RequestPasswordLostArgs {
  email: string;
}

interface RequestPasswordLost {
  secret: string;
  passwordLost: PasswordLost;
}

export async function requestPasswordLost({
  email,
}: RequestPasswordLostArgs): Promise<RequestPasswordLost> {
  // delete any password lost request older than 10 minutes
  await prisma.passwordLost.deleteMany({
    where: {
      createdAt: {
        lt: subSeconds(new Date(), config.password_lost_token_expiration),
      },
    },
  });

  const secret = randomBytes(64).toString("hex");

  const newPasswordLost = await prisma.passwordLost.create({
    data: { email, secret: await hash(secret, 12) },
  });

  return { secret, passwordLost: newPasswordLost };
}

interface RequestConfirmationArgs {
  email: string;
}

interface ConfirmationRequest {
  secret: string;
  emailConfirmation: EmailConfirmation;
}

export async function requestConfirmation({
  email,
}: RequestConfirmationArgs): Promise<ConfirmationRequest> {
  const existingEmailConfirmation = await prisma.emailConfirmation.findUnique({
    where: { email },
  });

  const secret = randomBytes(64).toString("hex");

  if (existingEmailConfirmation) {
    const updatedEmailConfirmation = await prisma.emailConfirmation.update({
      where: { email },
      data: { secret: await hash(secret, 12) },
    });

    return { secret, emailConfirmation: updatedEmailConfirmation };
  } else {
    const newEmailConfirmation = await prisma.emailConfirmation.create({
      data: {
        email,
        secret: await hash(secret, 12),
      },
    });

    return { secret, emailConfirmation: newEmailConfirmation };
  }
}

export const assertProofOfWork = async (
  ip: string | undefined,
  hashWithDifficulty: string,
  proof: string,
) => {
  if (!hashWithDifficulty || !proof || !ip) {
    logger.error("Missing some variables", { hashWithDifficulty, proof, ip });
    throw new Error("proof is not valid");
  }

  const hashIp = await redis.getdel(hashWithDifficulty);

  // the record should exist
  if (!hashIp || hashIp !== ip) {
    logger.error(`hash IP addresses do not match ("${ip} !== ${hashIp}`);
    throw new Error(`hash IP addresses do not match ("${ip} !== ${hashIp}`);
  }

  const [hash, difficultyStr] = hashWithDifficulty.split(":");
  const difficulty = parseInt(difficultyStr);

  const hasher = createHash("sha256");
  const digest = hasher.update(hash + proof).digest("hex");
  if (digest.slice(0, difficulty) !== "0".repeat(difficulty)) {
    logger.error("proof is not valid");
    throw new Error("proof is not valid");
  }
};
