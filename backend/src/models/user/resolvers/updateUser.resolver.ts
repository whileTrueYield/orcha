/**
 * Mutation resolvers for updating User account details.
 *
 * Provides:
 *  - changeEmail(input):    change the user's email (requires current password)
 *  - changePassword(input): change the user's password (requires current password)
 *
 * Both require isAuthenticated auth scope and validate the current password
 * before making changes.
 *
 * Assumes ctx.me has userId set (guaranteed by isAuthenticated scope).
 */

import { GraphQLError } from "graphql";
import { UserStatus } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { trim } from "lodash";
import builder from "../../../schema/builder";
import { AuthUserContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const ChangeEmailInput = builder.inputType("ChangeEmailInput", {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

const ChangePasswordInput = builder.inputType("ChangePasswordInput", {
  fields: (t) => ({
    password: t.string({ required: true }),
    newPassword: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// changeEmail mutation
// ---------------------------------------------------------------------------

builder.mutationField("changeEmail", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: ChangeEmailInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // isAuthenticated scope guarantees ctx.me has userId
      const me = ctx.me as AuthUserContext;

      const user = await ctx.prisma.user.findFirst({
        where: { id: me.userId },
      });

      if (!user) {
        throw new GraphQLError(
          "This user does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new GraphQLError(
          "You cannot update your email at this point",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const email = trim(args.input.email.toLowerCase());

      if (user.email === email) {
        throw new GraphQLError(
          "Please provide a different email than the current one.",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const userWithSameEmail = await ctx.prisma.user.findFirst({
        where: { email },
      });

      if (userWithSameEmail) {
        throw new GraphQLError("This email is used on another account", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // require a password to change email address
      const validPassword = await compare(args.input.password, user.password);

      if (!validPassword) {
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // keep an audit trail of email changes for security review
      await ctx.prisma.userEmailChange.create({
        data: {
          newEmail: email,
          previousEmail: user.email,
          ipAddress: ctx.req.ip || "unknown",
        },
      });

      return ctx.prisma.user.update({
        ...query,
        where: { id: user.id },
        data: { email },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// changePassword mutation
// ---------------------------------------------------------------------------

builder.mutationField("changePassword", (t) =>
  t.prismaField({
    type: "User",
    authScopes: { isAuthenticated: true },
    args: {
      input: t.arg({ type: ChangePasswordInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthUserContext;

      const user = await ctx.prisma.user.findFirst({
        where: { id: me.userId },
      });

      if (!user) {
        throw new GraphQLError(
          "This user does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new GraphQLError(
          "You cannot update your password at this point",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const validPassword = await compare(args.input.password, user.password);

      if (!validPassword) {
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return ctx.prisma.user.update({
        ...query,
        where: { id: user.id },
        data: {
          password: await hash(args.input.newPassword, 12),
        },
      });
    },
  }),
);
