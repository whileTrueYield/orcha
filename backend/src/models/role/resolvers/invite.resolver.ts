/**
 * Mutations: invite, resendInvite — invite a user to the organization.
 */

import builder from "../../../schema/builder";
import { RoleType, RoleStatus, UserStatus } from "@prisma/client";
import { RoleTypeEnum } from "../../../schema/enums";
import { GraphQLError } from "graphql";
import { loadTemplate, sendEmail } from "../../../emails/email";
import { config } from "../../../config";
import { logger } from "../../../logger";
import { DEFAULT_WORK_WEEK } from "../entity";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Helper — send invite email
// ---------------------------------------------------------------------------

async function sendInviteEmail(
  role: any,
  fromRole: any,
  organization: any,
): Promise<boolean> {
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

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const InviteInput = builder.inputType("InviteInput", {
  fields: (t) => ({
    userEmail: t.string({ required: true }),
    userName: t.string({ required: false }),
    roleType: t.field({ type: RoleTypeEnum, required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: resendInvite
// ---------------------------------------------------------------------------

builder.mutationField("resendInvite", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      email: t.arg.string({ required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const fromRole = await ctx.prisma.role.findFirstOrThrow({
        where: { id: (ctx.me as AuthRoleContext).roleId, status: RoleStatus.ACCEPTED },
        include: { user: true },
      });

      const organization = await (ctx.me as AuthRoleContext).getOrganization();

      const existingRole = await ctx.prisma.role.findFirstOrThrow({
        where: {
          organizationId: organization.id,
          user: { email: args.email },
          status: RoleStatus.INVITED,
        },
        include: { user: true },
      });

      await sendInviteEmail(existingRole, fromRole, organization);

      return existingRole;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: invite
// ---------------------------------------------------------------------------

builder.mutationField("invite", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: InviteInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const organization = await (ctx.me as AuthRoleContext).getOrganization();
      const user = await ctx.prisma.user.upsert({
        where: { email: args.input.userEmail.toLowerCase() },
        create: {
          email: args.input.userEmail.toLowerCase(),
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
          throw new GraphQLError("Sorry, this person rejected your previous invitation.", { extensions: { code: "BAD_USER_INPUT" } });
        } else if (existingRole.status === RoleStatus.ACCEPTED) {
          throw new GraphQLError("This person already accepted your invitation", { extensions: { code: "BAD_USER_INPUT" } });
        } else {
          throw new GraphQLError("An invite already exists for this person", { extensions: { code: "BAD_USER_INPUT" } });
        }
      }

      const role = await ctx.prisma.role.create({
        ...query,
        data: {
          type: args.input.roleType ?? RoleType.MEMBER,
          status: RoleStatus.INVITED,
          organizationId: organization.id,
          userId: user.id,
          name: args.input.userName ?? "",
          workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
        },
        include: { user: true },
      });

      const fromRole = await ctx.prisma.role.findFirstOrThrow({
        where: { id: (ctx.me as AuthRoleContext).roleId, status: RoleStatus.ACCEPTED },
        include: { user: true },
      });

      try {
        await sendInviteEmail(role, fromRole, organization);
      } catch (error) {
        logger.error(`Cannot send invite email to ${user.email}`, error);
      }

      return role;
    },
  }),
);
