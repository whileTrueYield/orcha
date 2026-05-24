import {
  Query,
  Resolver,
  Ctx,
  Mutation,
  Arg,
  UseMiddleware,
  Int,
  InputType,
  Field,
} from "type-graphql";
import { compare, hash } from "bcrypt";
import prisma from "../../../prisma";
import { logger } from "../../../logger";
import { Me } from "../entity";
import {
  AppContext,
  AuthContext,
  AuthStatus,
  AuthUserContext,
  GuestUserContext,
} from "../../../types";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { IsEmail, MinLength } from "class-validator";
import { UserInputError, AuthenticationError } from "apollo-server-express";
import { random } from "lodash";
import { wait } from "../../../utils/time";
import { RoleStatus, User, UserStatus } from "@generated/type-graphql";

import { config } from "../../../config";
import { loadTemplate, sendEmail } from "../../../emails/email";
import {
  assertProofOfWork,
  requestConfirmation,
  requestPasswordLost,
  verifyPasswordLost,
} from "../helper";
import { OrganizationStatus, Prisma, Role } from "@prisma/client";
import { randomBytes } from "crypto";
import { redis } from "../../../redis";
import { getUserPreferences, updatePreferences } from "../../user/helper";

@InputType()
class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field()
  proof: string;

  @Field()
  hash: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field()
  proof: string;

  @Field()
  hash: string;
}

@InputType()
class PasswordLostInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  proof: string;

  @Field()
  hash: string;
}

@InputType()
class PasswordResetInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(8)
  password: string;

  @Field()
  secret: string;

  @Field()
  proof: string;

  @Field()
  hash: string;
}

@Resolver(Me)
export class AuthResolver {
  private async getMe(userId?: number, roleId?: number): Promise<Me> {
    // if the authenticated user is also associated
    // with an organization it would have a roleId defined
    // we can load all the info (user and org) from that role entity
    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: { user: true, organization: true },
      });
      if (role && role.status === RoleStatus.ACCEPTED) {
        const user = role.user;
        const organization = role.organization;

        if (user && organization) {
          return {
            role,
            user,
            organization,
            status: AuthStatus.LINKED,
          };
        }
      }
    }

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (user) {
        return { status: AuthStatus.USER, user };
      }
    }

    // user is a guest
    return { status: AuthStatus.GUEST };
  }

  @Query(() => Me)
  async me(@Ctx() context: AppContext<AuthContext>): Promise<Me> {
    const userId = context.req.session.userId;
    const roleId = context.req.session.roleId;

    return this.getMe(userId, roleId);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: AppContext<AuthUserContext>): Promise<boolean> {
    return new Promise((resolve) => {
      ctx.req.session.destroy((err) => {
        if (err) {
          resolve(false);
        }

        ctx.res.clearCookie("seshID", { path: "/" });
        resolve(true);
      });
    });
  }

  @Query(() => String)
  async pof(@Ctx() ctx: AppContext<GuestUserContext>): Promise<string> {
    const uuid = randomBytes(32).toString("hex") + ":" + config.pow_difficulty;
    // expires in 10 seconds
    redis.set(uuid, ctx.req.ip, "EX", 10);
    return uuid;
  }

  @Mutation(() => Me)
  async login(
    @Ctx() ctx: AppContext<GuestUserContext>,
    @Arg("input") input: LoginInput,
  ): Promise<Me> {
    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `login(...): Bad proof of work provided, email: ${input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
      );
      throw new AuthenticationError("Bad password or email does not exist");
    }

    const email = input.email.toLowerCase();
    const user = await ctx.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await wait(random(0, 100));
      logger.info("login(...): Could not find user");
      throw new AuthenticationError("Bad password or email does not exist");
    }

    const validPassword = await compare(input.password, user.password);

    if (!validPassword) {
      await wait(random(0, 100));
      logger.info("login(...): Provided password does not match");
      throw new AuthenticationError("Bad password or email does not exist");
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
      // is there an invite pending
      const roleInvite = await ctx.prisma.role.findFirst({
        where: {
          userId: user.id,
          status: RoleStatus.INVITED,
          organization: {
            status: OrganizationStatus.ACTIVE,
          },
        },
      });

      if (roleInvite) {
        return this._authUser(ctx, user);
      }

      return this._authUser(ctx, user, roles[0]);
    }

    return this._authUser(ctx, user);
  }

  @Mutation(() => Me)
  async registerFromInvite(
    @Ctx() ctx: AppContext<GuestUserContext>,
    @Arg("input") input: RegisterInput,
  ): Promise<Me> {
    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `registerFromInvite(...): Bad proof of work provided, email: ${input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
      );
      throw new AuthenticationError("Bad password or email does not exist");
    }

    if (ctx.me.status !== AuthStatus.GUEST) {
      throw new UserInputError("Logout to register a new account");
    }

    const email = input.email.toLowerCase();
    const existingUser = await ctx.prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      throw new UserInputError("This email address has not been invited");
    }

    if (existingUser.status === UserStatus.ACTIVE) {
      throw new UserInputError(
        "This user already exist, please proceed to login instead.",
      );
    }

    if (existingUser.status !== UserStatus.INVITED) {
      throw new UserInputError("This email address has not been invited");
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

    await this._sendConfirmationEmail(user);

    return this.me(ctx);
  }

  @Mutation(() => Me)
  async register(
    @Ctx() ctx: AppContext<GuestUserContext>,
    @Arg("input") input: RegisterInput,
  ): Promise<Me> {
    // if (ctx.me.status !== AuthStatus.GUEST) {
    //   throw new UserInputError("Cannot register while logged in");
    // }

    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `register(...): Bad proof of work provided, email: ${input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
      );
      throw new AuthenticationError(error);
    }

    const email = input.email.toLowerCase();

    const existingUser = await ctx.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // if the user was invited it will have been created with an
      // invited "status"
      if (existingUser.status === UserStatus.INVITED) {
        return this.registerFromInvite(ctx, input);
      }

      throw new UserInputError("This user already exists, try to login");
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
        password: await hash(input.password, 12),
      },
    });

    ctx.req.session!.userId = user.id;
    ctx.req.session!.isStaff = user.isStaff;

    if (!isFirstUser) {
      await this._sendConfirmationEmail(user);
    }

    return this.me(ctx);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async sendConfirmationEmail(
    @Ctx() ctx: AppContext<AuthUserContext>,
  ): Promise<boolean> {
    const user = await ctx.me.getUser();

    return this._sendConfirmationEmail(user);
  }

  @Mutation(() => Boolean)
  @UseMiddleware()
  async passwordLost(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("input") input: PasswordLostInput,
  ): Promise<boolean> {
    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `passwordLost(...): Bad proof of work provided, email: ${input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
      );
      throw new AuthenticationError("Something went wrong, please try again");
    }

    const { email } = input;
    const user = await ctx.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return false;
    }

    // We only reset password for active and unconfirmed to prevent
    // sending reset email to invited users or deactivated ones.
    if (
      user.status !== UserStatus.ACTIVE &&
      user.status !== UserStatus.UNCONFIRMED
    ) {
      return false;
    }

    const { secret } = await requestPasswordLost({ email });

    // Encode for URL safety
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
  }

  @Mutation(() => Me)
  async passwordReset(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("input") input: PasswordResetInput,
  ): Promise<Me> {
    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `passwordReset(...): Bad proof of work provided, email: ${input.email} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
      );
      throw new AuthenticationError("Something went wrong, please try again");
    }

    const { password, secret } = input;
    const email = input.email.toLowerCase();
    const user = await ctx.prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn("passwordReset(...): User %s was not found", email);
      throw new UserInputError("Invalid Request");
    }

    if (
      user.status !== UserStatus.ACTIVE &&
      user.status !== UserStatus.UNCONFIRMED
    ) {
      logger.warn("passwordReset(...): User %s is not active", email);
      throw new UserInputError("Invalid Request");
    }

    const isValid = await verifyPasswordLost({
      email,
      secret,
    });

    if (!isValid) {
      logger.warn("passwordReset(...): Provided secret does not match");
      throw new UserInputError("Invalid Request");
    }

    const updatedUser = await ctx.prisma.user.update({
      where: { email },
      data: { password: await hash(password, 12) },
    });

    // to keep for security reason
    await wait(random(0, 100));

    return this._authUser(ctx, updatedUser);
  }

  @Query(() => Me)
  @UseMiddleware(isAuthenticated)
  async useRole(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("organizationId", () => Int) organizationId: number,
  ): Promise<Me> {
    const user = await ctx.me.getUser();

    const role = await ctx.prisma.role.findUnique({
      where: {
        organizationId_userId: {
          organizationId: organizationId,
          userId: user.id,
        },
      },
    });

    if (!role) {
      throw new UserInputError("You do not have access to this organization");
    }

    if (role.status !== RoleStatus.ACCEPTED) {
      throw new UserInputError("You need to accept that invitation first");
    }

    return this._authUser(ctx, user, role);
  }

  /**
   * Helper method ensuring that a non-active user may not
   * go beyond login.
   * @param ctx
   * @param user
   * @param role
   */
  async _authUser(
    ctx: AppContext<AuthUserContext> | AppContext<GuestUserContext>,
    user: User,
    role?: Role | null,
  ) {
    // We don't link a user if they have not confirmed their email address
    if (user.status === UserStatus.UNCONFIRMED) {
      ctx.req.session!.userId = user.id;
      ctx.req.session!.isStaff = user.isStaff;
      return this.getMe(user.id);
    }

    // if the user is not active then we'll maintain their guest status
    // which means, you cannot login
    if (user.status !== UserStatus.ACTIVE) {
      return this.getMe(); // returns "guest"
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
        organization: {
          status: OrganizationStatus.ACTIVE,
        },
      },
    });

    return this.getMe(user.id, role?.id);
  }

  /**
   * Helper method sending a confirmation email to the user's email
   * used by registration and we user re-request a confirmation email
   * @param user
   */
  async _sendConfirmationEmail(user: User): Promise<boolean> {
    // Only send a confirmation email if the user is not
    // yet confirmed (or banned, deleted...)
    if (user.status !== UserStatus.UNCONFIRMED) {
      return false;
    }

    const { secret } = await requestConfirmation({ email: user.email });

    // Encode for URL safety
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
}
