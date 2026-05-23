import {
  Arg,
  Query,
  Resolver,
  Int,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
} from "type-graphql";
import {
  ModelStage,
  Organization,
  Role,
  Tag,
  Ticket,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedTickets } from "../../entities";
import { getPaginatedTickets } from "../../ticket/helper";

@Resolver(Tag)
export class TagResolver {
  @Query(() => Tag)
  @UseMiddleware(hasRole())
  async tag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Tag> {
    return await ctx.prisma.tag.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() tag: Tag
  ): Promise<Organization> {
    if (tag.organization) {
      return tag.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: tag.organizationId },
    });
  }

  @FieldResolver((_returns) => PaginatedTickets)
  async tickets(
    @Root() tag: Tag,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Ticket,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      first,
      last,
      sort,
      offset,
      search,
      tagId: tag.id,
      organizationId: tag.organizationId,
    });
  }

  @FieldResolver((_returns) => Int)
  async ticketCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() tag: Tag
  ): Promise<number> {
    return ctx.prisma.ticket.count({
      where: {
        stage: ModelStage.PUBLISHED,
        project: {
          stage: ModelStage.PUBLISHED,
          ancestorIsArchived: false,
        },
        tags: { some: { id: tag.id } },
      },
    });
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() tag: Tag
  ): Promise<Role | null> {
    if (tag.authorId) {
      if (tag.author) {
        return tag.author;
      }

      return ctx.prisma.role.findUniqueOrThrow({
        where: { id: tag.authorId },
      });
    }

    return null;
  }
}
