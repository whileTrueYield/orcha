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
  InputType,
  Field,
} from "type-graphql";
import {
  Documentation,
  DocumentationPage,
  Organization,
  RoleType,
} from "@generated/type-graphql";
import { Length, MaxLength } from "class-validator";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { MiniDocumentationPage } from "../entity";
import { ModelStage } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@InputType()
class CreateDocumentationPageInput {
  @Field()
  @Length(1, 256)
  title: string;

  @Field()
  @MaxLength(1024 * 32)
  body: string;
}

@Resolver(Documentation)
export class DocumentationResolver {
  @Query(() => Documentation)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.DOCUMENTATION))
  async documentation(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Documentation> {
    const documentation = await ctx.prisma.documentation.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
    });

    if (!documentation) {
      throw new UserInputError(
        "This documentation does not exist or has been deleted"
      );
    }

    return documentation;
  }

  @FieldResolver((_returns) => [MiniDocumentationPage])
  @UseMiddleware(hasRole())
  async titles(
    @Root() documentation: Documentation,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<MiniDocumentationPage[]> {
    return await ctx.prisma.documentationPage.findMany({
      where: {
        documentationId: documentation.id,
      },
      select: {
        title: true,
        position: true,
        id: true,
        parentId: true,
      },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() documentation: Documentation
  ): Promise<Organization> {
    if (documentation.organization) {
      return documentation.organization;
    }
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: documentation.organizationId },
    });
  }

  @Mutation(() => DocumentationPage)
  @UseMiddleware(hasRole())
  async createDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationId", () => Int)
    documentationId: number,
    @Arg("input")
    input: CreateDocumentationPageInput
  ): Promise<DocumentationPage> {
    const documentation = await ctx.prisma.documentation.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
        id: documentationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    if (!documentation) {
      throw new UserInputError(
        "This documentation does not exist or has been deleted"
      );
    }

    return ctx.prisma.documentationPage.create({
      data: {
        documentationId: documentation.id,
        organizationId: ctx.me.organizationId,
        title: input.title,
        body: input.body,
      },
      include: {
        documentation: true,
      },
    });
  }

  @Mutation((_returns) => Documentation)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationPageId", () => Int!) documentationPageId: number
  ): Promise<Documentation> {
    const documentationPage =
      await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: documentationPageId,
          organizationId: ctx.me.organizationId,
        },
      });

    const documentationId = documentationPage.documentationId;

    await ctx.prisma.documentationPage.delete({
      where: { id: documentationPage.id },
    });

    return ctx.prisma.documentation.findFirstOrThrow({
      where: { id: documentationId },
      include: {
        documentationPages: {
          include: {
            children: true,
          },
        },
      },
    });
  }
}
