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
import {
  Organization,
  DocumentationPage,
  Documentation,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { logger } from "../../../logger";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";
import { ModelStage } from "@prisma/client";
import { DocumentToken } from "../../../hocuspocus/documentToken";
import jwt from "jsonwebtoken";
import { config } from "../../../config";

@Resolver(DocumentationPage)
export class DocumentationPageResolver {
  @Query(() => DocumentationPage)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.DOCUMENTATION))
  async documentationPage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<DocumentationPage> {
    const documentationPage = await ctx.prisma.documentationPage.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: {
        documentation: true,
      },
    });

    if (!documentationPage) {
      throw new UserInputError(
        "This documentationPage does not exist or has been deleted"
      );
    }

    return documentationPage;
  }

  @FieldResolver(() => [String])
  async urls(@Root() documentationPage: DocumentationPage): Promise<string[]> {
    try {
      if (documentationPage.urls) {
        return JSON.parse(documentationPage.urls);
      }
    } catch (error) {
      logger.error(
        `Could not parse URLs JSON string for documentation page ${documentationPage.id}`
      );
    }

    return [];
  }

  @FieldResolver(() => [String])
  async keywords(
    @Root() documentationPage: DocumentationPage
  ): Promise<string[]> {
    try {
      if (documentationPage.keywords) {
        return JSON.parse(documentationPage.keywords);
      }
    } catch (error) {
      logger.error(
        `Could not parse keywords JSON string for documentation page ${documentationPage.id}`
      );
    }

    return [];
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() documentationPage: DocumentationPage
  ): Promise<Organization> {
    if (documentationPage.organization) {
      return documentationPage.organization;
    }
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: documentationPage.organizationId },
    });
  }

  @FieldResolver((_returns) => Documentation)
  async documentation(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() documentationPage: DocumentationPage
  ): Promise<Documentation> {
    if (documentationPage.documentation) {
      return documentationPage.documentation;
    }
    return ctx.prisma.documentation.findUniqueOrThrow({
      where: { id: documentationPage.documentationId },
    });
  }

  /**
   * This token is used by the text Slate Yjs editor using web socket.
   * It is valid for 15 minutes
   */
  @Query(() => String, { nullable: true })
  @UseMiddleware(hasRole())
  async documentationPageAccessToken(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<string> {
    const page = await ctx.prisma.documentationPage.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        documentation: {
          stage: { not: ModelStage.DELETED },
        },
      },
      include: {
        documentation: true,
      },
    });

    const readOnly = page.documentation.stage === "ARCHIVED";

    const accessToken: DocumentToken = {
      roleId: ctx.me.roleId,
      orgId: ctx.me.organizationId,
      documentId: page.id,
      documentType: "documentationText",
      mode: readOnly ? "read" : "write",
    };

    logger.info(
      `creating access token for documentation page ${
        page.title
      },\n${JSON.stringify(accessToken, null, 2)}`
    );

    return jwt.sign(
      accessToken,
      config.sessionSecret,
      { expiresIn: 900 } // Expire the token after 15 minutes.
    );
  }
}
