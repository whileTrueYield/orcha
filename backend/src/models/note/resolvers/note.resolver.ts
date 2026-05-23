import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Note, Organization, Role } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";

@Resolver(Note)
export class NoteResolver {
  @Query(() => Note!)
  @UseMiddleware(hasRole())
  async note(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Note> {
    const note = await ctx.prisma.note.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
      include: { owner: true },
    });

    if (!note) {
      throw new UserInputError("This note does not exist or has been deleted");
    }

    return note;
  }

  @Query(() => Note, { nullable: true })
  @UseMiddleware(hasRole())
  async lastNote(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Note | null> {
    return ctx.prisma.note.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
      include: { owner: true },
      orderBy: { id: "desc" },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() note: Note
  ): Promise<Organization> {
    if (note.organization) {
      return note.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: note.organizationId },
    });
  }

  @FieldResolver((_returns) => Role)
  async owner(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() note: Note
  ): Promise<Role> {
    if (note.owner) {
      return note.owner;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: note.ownerId },
    });
  }
}
