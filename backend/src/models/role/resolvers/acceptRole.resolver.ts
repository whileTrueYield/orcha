import {
  Arg,
  Resolver,
  Mutation,
  Int,
  UseMiddleware,
  Ctx,
  InputType,
  Field,
} from "type-graphql";
import { Role, RoleStatus } from "@generated/type-graphql";
import { isAuthenticated } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthUserContext } from "../../../types";
import { IsTimeZone } from "class-validator";

@InputType()
class AcceptRoleInput {
  @Field(() => Int)
  roleId: number;

  @Field()
  @IsTimeZone()
  timeZone: string;
}

@Resolver(Role)
export class AcceptRoleResolver {
  @Mutation((_returns) => Role)
  @UseMiddleware(isAuthenticated)
  async acceptRole(
    @Ctx() ctx: AppContext<AuthUserContext>,
    @Arg("input") input: AcceptRoleInput
  ): Promise<Role> {
    const role = await ctx.prisma.role.findFirstOrThrow({
      where: {
        id: input.roleId,
        userId: ctx.me.userId,
        status: RoleStatus.INVITED,
      },
    });

    return ctx.prisma.role.update({
      where: { id: role.id },
      data: { status: RoleStatus.ACCEPTED, timeZone: input.timeZone },
    });
  }
}
