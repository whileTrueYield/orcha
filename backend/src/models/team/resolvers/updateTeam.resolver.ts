import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { Length, MaxLength, IsUrl } from "class-validator";
import { Team, RoleType } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { findTeamByCode } from "../helper";

@InputType()
class UpdateTeamInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;

  @Field({ nullable: true })
  @Length(1, 10)
  code: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  description: string;

  @Field({ nullable: true })
  @MaxLength(2048)
  @IsUrl()
  coverUrl?: string;
}

@Resolver(Team)
export class UpdateTeamResolver {
  @Mutation(() => Team)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateTeam(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("teamId", () => Int) teamId: number,
    @Arg("input", () => UpdateTeamInput) input: UpdateTeamInput
  ): Promise<Team> {
    const team = await ctx.prisma.team.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: teamId,
      },
    });

    // When the code is changed we don't want to take an
    // existing one
    if (input.code && input.code !== team.code) {
      const existingTeam = await findTeamByCode(
        input.code,
        ctx.me.organizationId
      );

      if (existingTeam && existingTeam.id !== team.id) {
        throw new UserInputError("A team with the same code already exists");
      }
    }

    return ctx.prisma.team.update({ where: { id: team.id }, data: input });
  }
}
