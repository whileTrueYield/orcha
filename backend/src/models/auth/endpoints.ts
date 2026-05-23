import { config } from "../../config";
import { Request, Response } from "express";
import { UserStatus } from "@generated/type-graphql";
import prisma from "../../prisma";
import { verifyConfirmation } from "./helper";
import { randomBytes } from "crypto";
import { redis } from "../../redis";

/**
 * Confirm a user's email address when a user clicks on the link provided in the
 * confirmation email.
 */
export async function emailConfirmation(req: Request, res: Response) {
  const { secret, email } = req.query;

  if (typeof secret === "string" && typeof email === "string") {
    const isValid = await verifyConfirmation({
      email,
      secret,
    });

    if (!isValid) {
      res.status(404);
      return res.send();
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404);
      return res.send();
    }

    // make sure we don't allow a banned users to re-activate their
    // account by using a confirmation email.
    if (user.status === UserStatus.UNCONFIRMED) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: UserStatus.ACTIVE,
        },
      });
    }
  }

  res.redirect(302, config.webAppUri + "?confirmed=true");
  return res.send();
}

export async function pow(req: Request, res: Response) {
  const hash = randomBytes(32).toString("hex") + ":" + config.pow_difficulty;

  // expires in 10 seconds
  redis.set(hash, req.ip, "EX", 10);

  res.status(200);
  res.setHeader("Content-Type", "application/json");
  res.send({ hash });
  res.end();
}
