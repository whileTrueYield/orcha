import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Documentation } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { ModelStage } from "@prisma/client";
import { cronQueue } from "../../../cron/queues";
import { subMinutes } from "date-fns";
import { config } from "../../../config";
import { publishDocumentationTask } from "../jobs/publishDocumentationTask";

@Resolver(Documentation)
export class PublishDocumentationResolver {
  @Mutation(() => Documentation)
  @UseMiddleware(hasRole())
  async unpublishDocumentation(
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
      throw new UserInputError("This documentation does not exist");
    }

    if (
      documentation.lastPublishRequestAt &&
      documentation.lastPublishRequestAt > subMinutes(new Date(), 10)
    ) {
      throw new UserInputError("This documentation is still publishing");
    }

    // asynchronously unpublish the documentation
    await cronQueue.add("unpublishDocumentation", {
      documentationId: documentation.id,
    });

    return ctx.prisma.documentation.update({
      where: { id: documentation.id },
      data: {
        lastPublishRequestAt: new Date(),
      },
    });
  }

  @Mutation(() => Documentation)
  @UseMiddleware(hasRole())
  async publishDocumentation(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Documentation> {
    const documentation = await ctx.prisma.documentation.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
    });

    if (!documentation) {
      throw new UserInputError(
        "This documentation does not exist or has not been published"
      );
    }

    if (
      documentation.lastPublishRequestAt &&
      documentation.lastPublishRequestAt > subMinutes(new Date(), 5)
    ) {
      throw new UserInputError("This documentation is still publishing");
    }

    if (config.isDev) {
      await publishDocumentationTask(documentation.id);
    }

    // asynchronously generate the documentation
    await cronQueue.add("publishDocumentation", {
      documentationId: documentation.id,
    });

    return ctx.prisma.documentation.update({
      where: {
        id: documentation.id,
      },
      data: {
        lastPublishRequestAt: new Date(),
      },
    });
  }
}
