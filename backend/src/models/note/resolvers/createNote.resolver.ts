import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length } from "class-validator";
import { Note } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@InputType()
class CreateNoteInput {
  @Field({ nullable: true })
  @Length(1, 2048)
  body: string;
}

@Resolver(Note)
export class CreateNoteResolver {
  @Mutation(() => Note)
  @UseMiddleware(hasRole())
  async createNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateNoteInput
  ): Promise<Note> {
    return ctx.prisma.note.create({
      data: {
        ...input,
        ownerId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
      },
    });
  }
}
