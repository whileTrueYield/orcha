import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length, IsEmail, MinLength } from "class-validator";
import { User, UserStatus } from "@generated/type-graphql";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthUserContext } from "../../../types";
import { compare, hash } from "bcrypt";
import { trim } from "lodash";

@InputType()
class ChangeEmailInput {
  @Field()
  @Length(5, 256)
  @IsEmail()
  email: string;

  @Field()
  password: string;
}

@InputType()
class ChangePasswordInput {
  @Field()
  password: string;

  @Field()
  @MinLength(12)
  newPassword: string;
}

@Resolver(User)
export class UpdateUserResolver {
  @Mutation(() => User)
  @UseMiddleware(isAuthenticated)
  async changeEmail(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("input", () => ChangeEmailInput) input: ChangeEmailInput,
  ): Promise<User> {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.me.userId },
    });

    if (!user) {
      throw new UserInputError("This user does not exist or has been deleted");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UserInputError("You cannot update your email at this point");
    }

    const email = trim(input.email.toLowerCase());

    if (user.email === email) {
      throw new UserInputError(
        "Please provide a different email than the current one.",
      );
    }

    const userWithSameEmail = await ctx.prisma.user.findFirst({
      where: { email },
    });

    if (userWithSameEmail) {
      throw new AuthenticationError("This email is used on another account");
    }

    // require a password change to change email address
    const validPassword = await compare(input.password, user.password);

    if (!validPassword) {
      throw new AuthenticationError("Bad password or email does not exist");
    }

    // for safety measure, we keep an historic of all changed email addresses
    // to allow us to revert a change that was not authorized
    await ctx.prisma.userEmailChange.create({
      data: {
        newEmail: email,
        previousEmail: user.email,
        ipAddress: ctx.req.ip || "unknown",
      },
    });

    return ctx.prisma.user.update({
      where: { id: user.id },
      data: { email },
    });
  }

  @Mutation(() => User)
  @UseMiddleware(isAuthenticated)
  async changePassword(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("input", () => ChangePasswordInput) input: ChangePasswordInput,
  ): Promise<User> {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.me.userId },
    });

    if (!user) {
      throw new UserInputError("This user does not exist or has been deleted");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UserInputError("You cannot update your email at this point");
    }

    const validPassword = await compare(input.password, user.password);

    if (!validPassword) {
      throw new AuthenticationError("Bad password or email does not exist");
    }

    return ctx.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(input.password, 12),
      },
    });
  }
}
