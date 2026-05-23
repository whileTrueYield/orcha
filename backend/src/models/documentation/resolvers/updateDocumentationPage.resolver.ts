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

import { DocumentationPage, RoleType } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { Length, MaxLength } from "class-validator";
import { ModelStage } from "@prisma/client";
import { logger } from "../../../logger";

@InputType()
class UpdateDocumentationPageInput {
  @Field()
  @MaxLength(1024 * 64)
  body: string;
}

@InputType()
class UpdateDocumentationPageConfigInput {
  @Field()
  @Length(1, 256)
  title: string;

  @Field(() => [String])
  urls: string[];

  @Field(() => [String])
  keywords: string[];

  @Field(() => String, { nullable: true })
  @MaxLength(256)
  customId: string | null;
}

@Resolver(DocumentationPage)
export class UpdateDocumentationPageResolver {
  @Mutation(() => DocumentationPage)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateDocumentationPageConfig(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationPageId", () => Int) documentationPageId: number,
    @Arg("input", () => UpdateDocumentationPageConfigInput)
    input: UpdateDocumentationPageConfigInput
  ): Promise<DocumentationPage> {
    const documentationPage =
      await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: documentationPageId,
          documentation: {
            stage: { not: ModelStage.DELETED },
            organization: {
              id: ctx.me.organizationId,
            },
          },
        },
      });

    // if provided, find any other documentation Page with the same custom ID
    if (input.customId) {
      const pageWithSameId = await ctx.prisma.documentationPage.findFirst({
        where: {
          id: { not: documentationPageId },
          documentationId: documentationPage.documentationId,
          customId: input.customId,
        },
      });

      if (pageWithSameId) {
        throw new UserInputError(
          `The custom ID ${input.customId} is already used in this documentation`
        );
      }
    }

    return ctx.prisma.documentationPage.update({
      where: { id: documentationPage.id },
      data: {
        urls: JSON.stringify(input.urls),
        keywords: JSON.stringify(input.keywords),
        customId: input.customId || null,
        title: input.title,
      },
    });
  }

  @Mutation(() => DocumentationPage)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("documentationPageId", () => Int) documentationPageId: number,
    @Arg("input", () => UpdateDocumentationPageInput)
    input: UpdateDocumentationPageInput
  ): Promise<DocumentationPage> {
    const documentationPage =
      await ctx.prisma.documentationPage.findFirstOrThrow({
        where: {
          id: documentationPageId,
          documentation: {
            stage: { not: ModelStage.DELETED },
            organization: {
              id: ctx.me.organizationId,
            },
          },
        },
      });

    return ctx.prisma.documentationPage.update({
      where: { id: documentationPage.id },
      data: {
        body: input.body,
      },
    });
  }

  @Mutation(() => DocumentationPage)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async addChildToDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("parentDocumentationPageId", () => Int)
    parentDocumentationPageId: number,
    @Arg("childDocumentationPageId", () => Int) childDocumentationPageId: number
  ): Promise<DocumentationPage> {
    if (parentDocumentationPageId === childDocumentationPageId) {
      throw new UserInputError("Cannot move a page under itself");
    }

    const parentPage = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id: parentDocumentationPageId,

        documentation: {
          stage: { not: ModelStage.DELETED },
          organization: {
            id: ctx.me.organizationId,
          },
        },
      },
      include: {
        parent: true,
      },
    });

    const childPage = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id: childDocumentationPageId,
        documentationId: parentPage.documentationId,
      },
    });

    let nextParent = parentPage.parent;

    // we can't break the space-time continum by moving the page under a page
    // this is also one of it's children
    while (nextParent !== null) {
      if (nextParent.id === childPage.id) {
        throw new UserInputError(
          "Cannot move a page under one of its children or itself"
        );
      }

      // grab the next parent
      if (nextParent.parentId) {
        nextParent = await ctx.prisma.documentationPage.findFirst({
          where: { id: nextParent.parentId },
        });
      } else {
        nextParent = null;
      }
    }

    // find the last position of the future siblings
    const lastSibling = await ctx.prisma.documentationPage.findFirst({
      where: {
        parentId: parentPage.id,
      },
      orderBy: {
        position: "desc",
      },
    });

    return ctx.prisma.documentationPage.update({
      where: { id: childPage.id },
      data: {
        parentId: parentPage.id,
        position: lastSibling ? lastSibling.position + 1 : 0,
      },
    });
  }

  @Mutation(() => DocumentationPage)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async moveBeforeDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("beforeDocumentationPageId", () => Int)
    beforeDocumentationPageId: number,
    @Arg("documentationPageId", () => Int) documentationPageId: number
  ): Promise<DocumentationPage> {
    if (beforeDocumentationPageId === documentationPageId) {
      throw new UserInputError("Cannot move a page before itself");
    }

    const beforePage = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id: beforeDocumentationPageId,
        documentation: {
          stage: { not: ModelStage.DELETED },
          organization: {
            id: ctx.me.organizationId,
          },
        },
      },
      include: {
        parent: true,
      },
    });

    let movedPage = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id: documentationPageId,
        documentationId: beforePage.documentationId,
      },
    });

    let nextParent = beforePage.parent;
    // we can't break the space-time continum by moving the page under a page
    // this is also one of it's children
    while (nextParent !== null) {
      if (nextParent.id === movedPage.id) {
        throw new UserInputError(
          "Cannot move a page under one of its children or itself"
        );
      }

      // grab the next parent
      if (nextParent.parentId) {
        nextParent = await ctx.prisma.documentationPage.findFirst({
          where: { id: nextParent.parentId },
        });
      } else {
        nextParent = null;
      }
    }

    // grab all the pages at the same level of the provided page
    const allPages = await ctx.prisma.documentationPage.findMany({
      where: {
        documentationId: beforePage.documentationId,
        parentId: beforePage.parentId,
        id: { not: documentationPageId },
      },
      orderBy: { position: "asc" },
    });

    // we'll set the offset at +1 when we reach the record to insert before
    let offset = 0;
    let position = 0;
    for (const page of allPages) {
      if (page.id === beforeDocumentationPageId) {
        movedPage = await ctx.prisma.documentationPage.update({
          where: {
            id: movedPage.id,
          },
          data: {
            position: position,
            parentId: beforePage.parentId,
          },
        });

        logger.info(`page: ${page.id}: ${position}`);

        offset = 1;
      }

      // only update if necessary
      if (page.position !== position + offset) {
        await ctx.prisma.documentationPage.update({
          where: {
            id: page.id,
          },
          data: {
            position: position + offset,
          },
        });

        logger.info(`page: ${page.id}: ${position + offset}`);
      }

      position = position + 1;
    }

    return movedPage;
  }

  @Mutation(() => DocumentationPage)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async moveAfterDocumentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("afterDocumentationPageId", () => Int)
    afterDocumentationPageId: number,
    @Arg("documentationPageId", () => Int) documentationPageId: number
  ): Promise<DocumentationPage> {
    if (afterDocumentationPageId === documentationPageId) {
      throw new UserInputError("Cannot move a page after itself");
    }

    const afterPage = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id: afterDocumentationPageId,
        documentation: {
          stage: { not: ModelStage.DELETED },
          organization: {
            id: ctx.me.organizationId,
          },
        },
      },
      include: {
        parent: true,
      },
    });

    let movedPage = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id: documentationPageId,
        documentationId: afterPage.documentationId,
      },
    });

    let nextParent = afterPage.parent;
    // we can't break the space-time continum by moving the page under a page
    // this is also one of it's children
    while (nextParent !== null) {
      if (nextParent.id === movedPage.id) {
        throw new UserInputError(
          "Cannot move a page under one of its children or itself"
        );
      }

      // grab the next parent
      if (nextParent.parentId) {
        nextParent = await ctx.prisma.documentationPage.findFirst({
          where: { id: nextParent.parentId },
        });
      } else {
        nextParent = null;
      }
    }

    // grab all the pages at the same level of the provided page
    const allPages = await ctx.prisma.documentationPage.findMany({
      where: {
        documentationId: afterPage.documentationId,
        parentId: afterPage.parentId,
        id: { not: documentationPageId },
      },
      orderBy: { position: "asc" },
    });

    // we'll set the offset at +1 when we reach the record to insert after
    let offset = 0;
    let position = 0;
    for (const page of allPages) {
      // only update if necessary
      if (page.position !== position + offset) {
        await ctx.prisma.documentationPage.update({
          where: {
            id: page.id,
          },
          data: {
            position: position + offset,
          },
        });
      }

      if (page.id === afterDocumentationPageId) {
        offset = 1;

        movedPage = await ctx.prisma.documentationPage.update({
          where: {
            id: movedPage.id,
          },
          data: {
            position: position + offset,
            parentId: afterPage.parentId,
          },
        });
      }

      position = position + 1;
    }

    return movedPage;
  }
}
