import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
  Float,
} from "type-graphql";

import { Max, Min } from "class-validator";
import { Skill, RoleType } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@InputType()
class UpdateSkillInput {
  @Field((_type) => Float)
  @Max(5)
  @Min(0)
  value: number;
}

@Resolver(Skill)
export class UpdateSkillResolver {
  @Mutation(() => Skill)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateSkill(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("skillId", () => Int) skillId: number,
    @Arg("input", () => UpdateSkillInput) input: UpdateSkillInput
  ): Promise<Skill> {
    const skill = await ctx.prisma.skill.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: skillId,
      },
    });

    return ctx.prisma.skill.update({
      where: { id: skill.id },
      data: input,
    });
  }
}
