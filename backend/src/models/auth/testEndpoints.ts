import { RoleStatus } from "@generated/type-graphql";
import {
  Prisma,
  UserStatus,
  Role,
  Organization,
  OrganizationStatus,
  RoleType,
} from "@prisma/client";
import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { Request, Response } from "express";
import { faker } from "@faker-js/faker";
import { get } from "lodash";
import { logger } from "../../logger";
import prisma from "../../prisma";
import { redis } from "../../redis";
import { DEFAULT_WORK_WEEK } from "../entities";

/**
 * For testing purpose only, allow the front end to create an account
 *
 * isConfirmed: the user has confirmed their email (default TRUE)
 * isInvited: the user has not accepted their role yet (default FALSE)
 * isAdmin: the role is an ADMIN (default to FALSE)
 * isOwner: the role is the OWNER (default to FALSE)
 * organizationId: use the provided organization ID for the role
 *
 * Return an object with {user, role, organization} attribute
 * where role and organization can be null
 * @param req
 * @param res
 */
export async function createTestUser(req: Request, res: Response) {
  const isConfirmed = get(req.body, "isConfirmed", true);
  const isInvited = get(req.body, "isInvited", false);
  const isAdmin = get(req.body, "isAdmin", false);
  const isMember = get(req.body, "isMember", false);
  const isOwner = get(req.body, "isOwner", false);
  const organizationId = get(req.body, "organizationId", null);

  const withOrganization =
    isInvited || isAdmin || isOwner || organizationId || isMember
      ? true
      : get(req.body, "withOrganization", false);

  logger.info("req.body, " + JSON.stringify(req.body, null, 2));

  const status: UserStatus = isConfirmed
    ? UserStatus.ACTIVE
    : isInvited
      ? UserStatus.INVITED
      : UserStatus.UNCONFIRMED;

  const password = randomBytes(32).toString("hex");
  const email = randomBytes(16).toString("hex");
  const userValues: Prisma.UserCreateInput = {
    password: await hash(password, 12),
    email: email + "@example.com",
    isStaff: false,
    status,
  };

  const user = await prisma.user.create({ data: userValues });
  let organization: Organization | null = null;
  let role: Role | null = null;

  if (withOrganization) {
    if (organizationId) {
      organization = await prisma.organization.findUniqueOrThrow({
        where: { id: parseInt(organizationId) },
      });
    } else {
      organization = await prisma.organization.create({
        data: {
          name: faker.company.name(),
          status: OrganizationStatus.ACTIVE,
        },
      });
    }

    const roleType = isOwner
      ? RoleType.OWNER
      : isAdmin
        ? RoleType.ADMIN
        : RoleType.MEMBER;

    if (isInvited) {
      role = await prisma.role.create({
        data: {
          organizationId: organization.id,
          type: roleType,
          status: RoleStatus.INVITED,
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          userId: user.id,
          workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
        },
      });
    } else {
      role = await prisma.role.create({
        data: {
          organizationId: organization.id,
          status: RoleStatus.ACCEPTED,
          type: roleType,
          userId: user.id,
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
        },
      });
    }
  }

  res.status(200);
  res.setHeader("Content-Type", "application/json");
  res.send({ password, user, role, organization });
  res.end();
}

// Retrieve the last email stored in redis for the given email
export async function getLastEmailForTest(req: Request, res: Response) {
  const email = get(req.body, "email");
  const lastEmail = await redis.get(`email:${email}`);

  if (lastEmail) {
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.parse(lastEmail));
    res.end();
  } else {
    res.status(404);
    res.end();
  }
}

// Logs the user in, only works with xxx@example.com emails (test emails)
// and if the account is not a staff account
export async function loginForTest(req: Request, res: Response) {
  const email = get(req.body, "email");
  const password = get(req.body, "password");

  if (!email || !password) {
    res.status(400);
    res.setHeader("Content-Type", "application/json");
    res.send({ error: "email and password are required" });
    res.end();
    return;
  }

  // only @example.com can be used here
  if (!email.endsWith("@example.com")) {
    res.status(400);
    res.setHeader("Content-Type", "application/json");
    res.send({ error: "bad email address" });
    res.end();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    res.status(400);
    res.setHeader("Content-Type", "application/json");
    res.send({ error: "bad email" });
    res.end();
    return;
  }

  const validPassword = await compare(password, user.password);

  if (!validPassword) {
    res.status(400);
    res.setHeader("Content-Type", "application/json");
    res.send({ error: "password" });
    res.end();
    return;
  }

  const roles = await prisma.role.findMany({
    where: {
      userId: user.id,
      status: RoleStatus.ACCEPTED,
      organization: {
        status: OrganizationStatus.ACTIVE,
      },
    },
    include: { organization: true },
  });

  req.session.userId = user.id;
  req.session.isStaff = user.isStaff;
  req.session.roles = roles;

  if (roles) {
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.send({
      role: roles[0],
      user,
      organization: roles[0].organization,
    });
  } else {
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    res.send({
      role: null,
      user,
      organization: null,
    });
  }

  res.end();
}
