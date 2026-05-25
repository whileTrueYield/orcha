/**
 * Auth resolvers — login, register, password management, session handling.
 *
 * Exports: none (side-effect: registers auth queries and mutations on the builder).
 *
 * Queries:  me, pof, useRole
 * Mutations: login, logout, register, registerFromInvite,
 *            sendConfirmationEmail, passwordLost, passwordReset
 *
 * Most endpoints are public (no auth scope) because they handle guests
 * and unauthenticated users. `useRole` and `sendConfirmationEmail` require
 * isAuthenticated. Proof-of-work is enforced on all public write operations.
 */

import { compare, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { random } from "lodash";
import { GraphQLError } from "graphql";
import {
  OrganizationStatus,
  Prisma,
  Role,
  RoleStatus,
  User,
  UserStatus,
} from "@prisma/client";

import builder from "../../../schema/builder";
import prisma from "../../../prisma";
import { logger } from "../../../logger";
import { config } from "../../../config";
import { redis } from "../../../redis";
import {
  AppContext,
  AuthContext,
  AuthStatus,
  AuthUserContext,
  GuestUserContext,
} from "../../../types";
import { wait } from "../../../utils/time";
import { loadTemplate, sendEmail } from "../../../emails/email";
import {
  assertProofOfWork,
  requestConfirmation,
  requestPasswordLost,
  verifyPasswordLost,
} from "../helper";
import { getUserPreferences, updatePreferences } from "../../user/helper";
import { MeRef, MeShape } from "../entity";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const RegisterInput = builder.inputType("RegisterInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    proof: t.string({ required: true }),
    hash: t.string({ required: true }),
  }),
});

const LoginInput = builder.inputType("LoginInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    proof: t.string({ required: true }),
    hash: t.string({ required: true }),
  }),
});

const PasswordLostInput = builder.inputType("PasswordLostInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    proof: t.string({ required: true }),
    hash: t.string({ required: true }),
  }),
});

const PasswordResetInput = builder.inputType("PasswordResetInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    secret: t.string({ required: true }),
    proof: t.string({ required: true }),
    hash: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Internal helpers (previously class methods on AuthResolver)
// ---------------------------------------------------------------------------

/**
 * Builds the Me object from optional userId/roleId.
 * When a roleId is present and the role is accepted, returns LINKED status.
 * Falls back to USER when only userId exists, then GUEST.
 */
async function getMe(userId?: number, roleId?: number): Promise<MeShape> {
  if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { user: true, organization: true },
    });

    if (role && role.status === RoleStatus.ACCEPTED) {
      const user = role.user;
      const organization = role.organization;

      if (user && organization) {
        return { role, user, organization, status: AuthStatus.LINKED };
      }
    }
  }

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      return { status: AuthStatus.USER, user };
    }
  }

  return { status: AuthStatus.GUEST };
}

/**
 * Sets session data and returns the Me payload.
 *
 * Unconfirmed users get USER status without a role link.
 * Inactive users are returned as GUEST (cannot proceed).
 */
async function authUser(
  ctx: AppContext<AuthUserContext> | AppContext<GuestUserContext>,
  user: User,
  role?: Role | null,
): Promise<MeShape> {
  // Unconfirmed users may not be linked to an org.
  if (user.status === UserStatus.UNCONFIRMED) {
    ctx.req.session!.userId = user.id;
    ctx.req.session!.isStaff = user.isStaff;
    return getMe(user.id);
  }

  // Non-active users are treated as guests (cannot log in).
  if (user.status !== UserStatus.ACTIVE) {
    return getMe();
  }

  if (role) {
    await updatePreferences(user, {
      lastOrganizationId: role.organizationId,
    });
  }

  ctx.req.session!.userId = user.id;
  ctx.req.session!.isStaff = user.isStaff;

  ctx.req.session.roles = await ctx.prisma.role.findMany({
    where: {
      userId: user.id,
      status: RoleStatus.ACCEPTED,
      organization: { status: OrganizationStatus.ACTIVE },
    },
  });

  return getMe(user.id, role?.id);
}

/**
 * Sends a confirmation email to an unconfirmed user.
 * Returns false when the user is already confirmed or in another non-eligible state.
 */
async function sendConfirmationEmailToUser(user: User): Promise<boolean> {
  if (user.status !== UserStatus.UNCONFIRMED) {
    return false;
  }

  const { secret } = await requestConfirmation({ email: user.email });

  const secretQ = encodeURIComponent(secret);
  const emailQ = encodeURIComponent(user.email);

  const { html, text } = await loadTemplate({
    template: "email_confirm",
    data: {
      email: user.email,
      emailConfirmUri: `${config.apiUri}/email_confirm?secret=${secretQ}&email=${emailQ}`,
    },
  });

  await sendEmail({
    ToAddresses: [user.email],
    html,
    text,
    subject: "Email address verification",
  });

  return true;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

builder.queryField("me", (t) =>
  t.field({
    type: MeRef,
    resolve: (_root, _args, ctx) => {
      const userId = ctx.req.session.userId;
      const roleId = ctx.req.session.roleId;
      return getMe(userId, roleId);
    },
  }),
);

builder.queryField("pof", (t) =>
  t.string({
    resolve: (_root, _args, ctx) => {
      const uuid =
        randomBytes(32).toString("hex") + ":" + config.pow_difficulty;
      // Proof-of-work challenge — expires in 10 seconds.
      redis.set(uuid, ctx.req.ip ?? "", "EX", 10);
      return uuid;
    },
  }),
);

builder.queryField("useRole", (t) =>
  t.field({
    type: MeRef,
    authScopes: { isAuthenticated: true },
    args: {
      organizationId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      // Auth scope guarantees isAuthenticated, so getUser exists.
      const me = ctx.me as AuthUserContext;
      const user = await me.getUser();

      const role = await ctx.prisma.role.findUnique({
        where: {
          organizationId_userId: {
            organizationId: args.organizationId,
            userId: user.id,
          },
        },
      });

      if (!role) {
        throw new GraphQLError(
          "You do not have access to this organization",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      if (role.status !== RoleStatus.ACCEPTED) {
        throw new GraphQLError(
          "You need to accept that invitation first",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return authUser(ctx as AppContext<AuthUserContext>, user, role);
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("logout", (t) =>
  t.boolean({
    resolve: (_root, _args, ctx) =>
      new Promise<boolean>((resolve) => {
        ctx.req.session.destroy((err) => {
          if (err) {
            resolve(false);
            return;
          }
          ctx.res.clearCookie("sessionId", { path: "/" });
          resolve(true);
        });
      }),
  }),
);

builder.mutationField("login", (t) =>
  t.field({
    type: MeRef,
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      try {
        await assertProofOfWork(ctx.req.ip ?? "", args.input.hash, args.input.proof);
      } catch {
        logger.warn(
          `login(...): Bad proof of work provided, email: ${args.input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const email = args.input.email.toLowerCase();
      const user = await ctx.prisma.user.findUnique({ where: { email } });

      if (!user) {
        await wait(random(0, 100));
        logger.info("login(...): Could not find user");
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const validPassword = await compare(args.input.password, user.password);

      if (!validPassword) {
        await wait(random(0, 100));
        logger.info("login(...): Provided password does not match");
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const roleWhere: Prisma.RoleWhereInput = {
        userId: user.id,
        status: RoleStatus.ACCEPTED,
      };

      const preferences = getUserPreferences(user);
      if (preferences.lastOrganizationId) {
        roleWhere.organization = {
          status: OrganizationStatus.ACTIVE,
          id: preferences.lastOrganizationId,
        };
      } else {
        roleWhere.organization = {
          status: OrganizationStatus.ACTIVE,
        };
      }

      const roles = await ctx.prisma.role.findMany({ where: roleWhere });

      if (roles.length === 1) {
        // Check for pending invites — if one exists, drop to USER status
        // so the frontend can show the invite acceptance flow.
        const roleInvite = await ctx.prisma.role.findFirst({
          where: {
            userId: user.id,
            status: RoleStatus.INVITED,
            organization: { status: OrganizationStatus.ACTIVE },
          },
        });

        if (roleInvite) {
          return authUser(ctx as AppContext<GuestUserContext>, user);
        }

        return authUser(
          ctx as AppContext<GuestUserContext>,
          user,
          roles[0],
        );
      }

      return authUser(ctx as AppContext<GuestUserContext>, user);
    },
  }),
);

builder.mutationField("register", (t) =>
  t.field({
    type: MeRef,
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      try {
        await assertProofOfWork(ctx.req.ip ?? "", args.input.hash, args.input.proof);
      } catch (error) {
        logger.warn(
          `register(...): Bad proof of work provided, email: ${args.input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        throw new GraphQLError(String(error), {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const email = args.input.email.toLowerCase();
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Invited users go through the registerFromInvite flow.
        if (existingUser.status === UserStatus.INVITED) {
          return registerFromInviteImpl(ctx, args.input);
        }
        throw new GraphQLError("This user already exists, try to login", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Bootstrap escape hatch: the very first user on a fresh database
      // is auto-confirmed (ACTIVE) so a self-hosted instance can be set up
      // without needing a working email pipeline. Every subsequent user
      // goes through the normal UNCONFIRMED + email confirmation flow.
      const isFirstUser = (await ctx.prisma.user.count()) === 0;

      const user = await ctx.prisma.user.create({
        data: {
          email,
          status: isFirstUser ? UserStatus.ACTIVE : UserStatus.UNCONFIRMED,
          password: await hash(args.input.password, 12),
        },
      });

      ctx.req.session!.userId = user.id;
      ctx.req.session!.isStaff = user.isStaff;

      if (!isFirstUser) {
        await sendConfirmationEmailToUser(user);
      }

      return getMe(user.id);
    },
  }),
);

/**
 * Shared implementation for registerFromInvite — called both from the
 * standalone mutation and from the register mutation when the user was invited.
 */
async function registerFromInviteImpl(
  ctx: AppContext<AuthContext>,
  input: { email: string; password: string; hash: string; proof: string },
): Promise<MeShape> {
  const email = input.email.toLowerCase();
  const existingUser = await ctx.prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    throw new GraphQLError("This email address has not been invited", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (existingUser.status === UserStatus.ACTIVE) {
    throw new GraphQLError(
      "This user already exist, please proceed to login instead.",
      { extensions: { code: "BAD_USER_INPUT" } },
    );
  }

  if (existingUser.status !== UserStatus.INVITED) {
    throw new GraphQLError("This email address has not been invited", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const user = await ctx.prisma.user.update({
    where: { email },
    data: {
      email,
      status: UserStatus.UNCONFIRMED,
      password: await hash(input.password, 12),
    },
  });

  ctx.req.session!.userId = user.id;
  ctx.req.session!.isStaff = user.isStaff;

  await sendConfirmationEmailToUser(user);

  const userId = ctx.req.session.userId;
  const roleId = ctx.req.session.roleId;
  return getMe(userId, roleId);
}

builder.mutationField("registerFromInvite", (t) =>
  t.field({
    type: MeRef,
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      try {
        await assertProofOfWork(ctx.req.ip ?? "", args.input.hash, args.input.proof);
      } catch {
        logger.warn(
          `registerFromInvite(...): Bad proof of work provided, email: ${args.input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (ctx.me.status !== AuthStatus.GUEST) {
        throw new GraphQLError("Logout to register a new account", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return registerFromInviteImpl(ctx, args.input);
    },
  }),
);

builder.mutationField("sendConfirmationEmail", (t) =>
  t.boolean({
    authScopes: { isAuthenticated: true },
    resolve: async (_root, _args, ctx) => {
      // Auth scope guarantees isAuthenticated, so getUser exists.
      const me = ctx.me as AuthUserContext;
      const user = await me.getUser();
      return sendConfirmationEmailToUser(user);
    },
  }),
);

builder.mutationField("passwordLost", (t) =>
  t.boolean({
    args: {
      input: t.arg({ type: PasswordLostInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      try {
        await assertProofOfWork(ctx.req.ip ?? "", args.input.hash, args.input.proof);
      } catch {
        logger.warn(
          `passwordLost(...): Bad proof of work provided, email: ${args.input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        throw new GraphQLError("Something went wrong, please try again", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { email } = args.input;
      const user = await ctx.prisma.user.findUnique({ where: { email } });

      if (!user) {
        return false;
      }

      // Only reset password for active and unconfirmed users — prevents
      // sending reset emails to invited users or deactivated ones.
      if (
        user.status !== UserStatus.ACTIVE &&
        user.status !== UserStatus.UNCONFIRMED
      ) {
        return false;
      }

      const { secret } = await requestPasswordLost({ email });

      const secretQ = encodeURIComponent(secret);
      const emailQ = encodeURIComponent(user.email);

      const { html, text } = await loadTemplate({
        template: "password_lost",
        data: {
          email: user.email,
          passwordLostUri: `${config.webAppUri}/auth/password_reset?secret=${secretQ}&email=${emailQ}`,
        },
      });

      await sendEmail({
        ToAddresses: [user.email],
        html,
        text,
        subject: "Your password reset request",
      });

      return true;
    },
  }),
);

builder.mutationField("passwordReset", (t) =>
  t.field({
    type: MeRef,
    args: {
      input: t.arg({ type: PasswordResetInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      try {
        await assertProofOfWork(ctx.req.ip ?? "", args.input.hash, args.input.proof);
      } catch {
        logger.warn(
          `passwordReset(...): Bad proof of work provided, email: ${args.input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        throw new GraphQLError("Something went wrong, please try again", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { password, secret } = args.input;
      const email = args.input.email.toLowerCase();
      const user = await ctx.prisma.user.findUnique({ where: { email } });

      if (!user) {
        logger.warn("passwordReset(...): User %s was not found", email);
        throw new GraphQLError("Invalid Request", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (
        user.status !== UserStatus.ACTIVE &&
        user.status !== UserStatus.UNCONFIRMED
      ) {
        logger.warn("passwordReset(...): User %s is not active", email);
        throw new GraphQLError("Invalid Request", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const isValid = await verifyPasswordLost({ email, secret });

      if (!isValid) {
        logger.warn("passwordReset(...): Provided secret does not match");
        throw new GraphQLError("Invalid Request", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { email },
        data: { password: await hash(password, 12) },
      });

      // Deliberate random delay for timing-attack mitigation.
      await wait(random(0, 100));

      return authUser(ctx as AppContext<AuthUserContext>, updatedUser);
    },
  }),
);
