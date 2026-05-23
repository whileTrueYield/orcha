import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length, MaxLength } from "class-validator";
import { Team, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { findTeamByCode } from "../helper";

@InputType()
class CreateTeamInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field()
  @Length(1, 10)
  code: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  description: string;
}

@Resolver(Team)
export class CreateTeamResolver {
  @Mutation(() => Team)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createTeam(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateTeamInput
  ): Promise<Team> {
    const teamUsingSameCode = await findTeamByCode(
      input.code,
      ctx.me.organizationId
    );

    if (teamUsingSameCode) {
      throw new UserInputError("A team with the same code already exists");
    }

    return ctx.prisma.team.create({
      data: {
        ...input,
        organizationId: ctx.me.organizationId,
      },
    });
  }
}
