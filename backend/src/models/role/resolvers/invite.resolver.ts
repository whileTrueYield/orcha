import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { MaxLength, IsEmail } from "class-validator";
import {
  RoleType,
  Role,
  RoleStatus,
  Organization,
  User,
  UserStatus,
} from "@generated/type-graphql";
import { UserInputError } from "apollo-server-express";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { loadTemplate, sendEmail } from "../../../emails/email";
import { config } from "../../../config";
import { logger } from "../../../logger";
import { DEFAULT_WORK_WEEK } from "../entity";

@InputType()
class InviteInput {
  @Field()
  @IsEmail()
  userEmail: string;

  @Field({ nullable: true })
  @MaxLength(10 * 1024)
  userName: string;

  @Field(() => RoleType, { nullable: true })
  roleType: RoleType;
}

/**
 * 1. Every invite is created with a status "invited" to be either "accepted" or "rejected"
 * 2. There is 2 uses cases for the invitee, if the user does not exist we'll create one in a pending state
 */
@Resolver(Role)
export class InviteResolver {
  /**
   * Helper method sending an invite email to the user's email
   * used at the first invite and subsequent resend requests
   * @param role
   */
  async _sendInviteEmail(
    role: Role & { user: User },
    fromRole: Role & { user: User },
    organization: Organization
  ): Promise<boolean> {
    // Encode for URL safety
    const nameQ = encodeURIComponent(role.name);
    const emailQ = encodeURIComponent(role.user.email);

    const { html, text } = await loadTemplate({
      template: "invite",
      data: {
        email: role.user.email,
        name: role.name,
        fromName: fromRole.name,
        organizationName: organization.name,
        acceptInviteUri: `${config.webAppUri}/auth/register_on_invite?name=${nameQ}&email=${emailQ}`,
      },
    });

    await sendEmail({
      ToAddresses: [role.user.email],
      html,
      text,
      subject: `Your invitation to join ${organization.name}`,
    });

    return true;
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async resendInvite(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("email") email: string
  ): Promise<Role> {
    const fromRole = await ctx.prisma.role.findFirstOrThrow({
      where: { id: ctx.me.roleId, status: RoleStatus.ACCEPTED },
      include: { user: true },
    });

    const organization = await ctx.me.getOrganization();

    // only invited users get to re-receive an invite
    const existingRole = await ctx.prisma.role.findFirstOrThrow({
      where: {
        organizationId: organization.id,
        user: { email },
        status: RoleStatus.INVITED,
      },
      include: { user: true },
    });

    await this._sendInviteEmail(existingRole, fromRole, organization);

    return existingRole;
  }

  @Mutation(() => Role)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async invite(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input") input: InviteInput
  ): Promise<Role> {
    const organization = await ctx.me.getOrganization();
    let user = await ctx.prisma.user.upsert({
      where: { email: input.userEmail.toLowerCase() },
      create: {
        email: input.userEmail.toLowerCase(),
        status: UserStatus.INVITED,
        password: "",
      },
      update: {},
    });

    const existingRole = await ctx.prisma.role.findFirst({
      where: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    if (existingRole) {
      if (existingRole.status === RoleStatus.REJECTED) {
        throw new UserInputError(
          "Sorry, this person rejected your previous invitation."
        );
      } else if (existingRole.status === RoleStatus.ACCEPTED) {
        throw new UserInputError(
          "This person already accepted your invitation"
        );
      } else {
        throw new UserInputError("An invite already exists for this person");
      }
    }

    const role = await ctx.prisma.role.create({
      data: {
        type: input.roleType,
        status: RoleStatus.INVITED,
        organizationId: organization.id,
        userId: user.id,
        name: input.userName,
        workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
      },
      include: { user: true },
    });

    const fromRole = await ctx.prisma.role.findFirstOrThrow({
      where: { id: ctx.me.roleId, status: RoleStatus.ACCEPTED },
      include: { user: true },
    });

    try {
      await this._sendInviteEmail(role, fromRole, organization);
    } catch (error) {
      logger.error(`Cannot send invite email to ${user.email}`, error);
    }

    return role;
  }
}
