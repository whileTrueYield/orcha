import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
  Mutation,
} from "type-graphql";
import {
  Product,
  RoleType,
  Feature,
  FeatureGroup,
  FeatureGroupStatus,
  Ticket,
  Workflow,
  Organization,
  ModelStage,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { map, trim } from "lodash";
import { PaginatedTickets } from "../../ticket/entity";
import { PaginatedWorkflows } from "../../workflow/entity";
import { PaginatedFeatureGroups, PaginatedFeatures } from "../../entities";
import {
  getPaginatedFeatureGroups,
  getPaginatedFeatures,
} from "../../feature/helper";
import { getPaginatedWorkflows } from "../../workflow/helper";
import { getPaginatedTickets } from "../../ticket/helper";

@Resolver(Product)
export class ProductResolver {
  @Query(() => Product)
  @UseMiddleware(hasRole())
  async product(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: {
        featureGroups: true,
      },
    });

    if (!product) {
      throw new UserInputError(
        "This product does not exist or has been deleted"
      );
    }

    return product;
  }

  @Mutation((_returns) => Product)
  @UseMiddleware(hasRole([RoleType.OWNER, RoleType.ADMIN]))
  async addFeatureGroup(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int) productId: number,
    @Arg("name", () => String) name: string
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirst({
      where: {
        id: productId,
        organizationId: ctx.me.organizationId,
      },
    });

    if (!product) {
      throw new UserInputError(
        "This product does not exist or has been deleted"
      );
    }

    const existingFeatureGroup = await ctx.prisma.featureGroup.findFirst({
      where: {
        name: {
          equals: trim(name.toLowerCase()),
          mode: "insensitive",
        },
        organizationId: ctx.me.organizationId,
        productId: productId,
      },
    });

    if (existingFeatureGroup) {
      throw new UserInputError("This feature already exists");
    }

    await ctx.prisma.featureGroup.create({
      data: {
        name: name,
        organizationId: ctx.me.organizationId,
        productId: productId,
        status: FeatureGroupStatus.ACTIVE,
      },
    });

    return product;
  }

  @Mutation(() => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async addWorkflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int) productId: number,
    @Arg("workflowIds", () => [Int]) workflowIds: number[]
  ): Promise<Product> {
    // ensure the product belongs to the role's organization
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        id: productId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        workflows: {
          connect: workflowIds.map((id) => ({ id })),
        },
      },
    });
  }

  @Mutation(() => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async removeWorkflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int) productId: number,
    @Arg("workflowIds", () => [Int]) workflowIds: number[]
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        id: productId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.product.update({
      where: { id: product.id },
      data: {
        workflows: {
          disconnect: workflowIds.map((id) => ({ id })),
        },
      },
    });
  }

  @FieldResolver((_returns) => PaginatedTickets)
  @UseMiddleware(hasRole())
  async tickets(
    @Root() product: Product,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Ticket,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedTickets> {
    return getPaginatedTickets({
      first,
      last,
      offset,
      sort,
      organizationId: ctx.me.organizationId,
      productId: product.id,
      search,
    });
  }

  @FieldResolver((_returns) => PaginatedFeatureGroups)
  @UseMiddleware(hasRole())
  async featureGroups(
    @Root() product: Product,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof FeatureGroup,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedFeatureGroups> {
    return getPaginatedFeatureGroups({
      productId: product.id,
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }

  /**
   * Return the complete workfow IDs set for a given product and only
   * their IDs.
   * @param product
   */
  @FieldResolver((_returns) => [Int])
  async workflowIds(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() product: Product
  ): Promise<number[]> {
    const rawResults = await ctx.prisma.workflow.findMany({
      where: {
        products: { some: { id: product.id } },
        stage: { not: ModelStage.DELETED },
      },
      select: { id: true },
    });

    return map(rawResults, (row) => row.id);
  }

  @FieldResolver((_returns) => PaginatedFeatures)
  @UseMiddleware(hasRole())
  async features(
    @Root() product: Product,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Feature,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedFeatures> {
    return getPaginatedFeatures({
      productId: product.id,
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() product: Product
  ): Promise<Organization> {
    if (product.organization) {
      return product.organization;
    }
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: product.organizationId },
    });
  }

  @FieldResolver((_returns) => PaginatedWorkflows)
  async workflows(
    @Root() product: Product,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Workflow,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("stages", () => [ModelStage], { nullable: true }) stages: ModelStage[],
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedWorkflows> {
    return getPaginatedWorkflows({
      productId: product.id,
      organizationId: ctx.me.organizationId,
      activeOnly: true,
      first,
      last,
      offset,
      sort,
      search,
      stages,
    });
  }
}
