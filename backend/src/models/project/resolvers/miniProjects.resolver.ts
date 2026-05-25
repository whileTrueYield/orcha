/**
 * Queries: miniProjects, myMiniProjects.
 */

import builder from "../../../schema/builder";
import { MiniProjectRef } from "../entity";
import { ModelStage, Prisma } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

builder.queryField("miniProjects", (t) =>
  t.field({
    type: [MiniProjectRef],
    authScopes: { hasRole: true },
    resolve: (_root, _args, ctx) =>
      ctx.prisma.project.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.PUBLISHED,
          ancestorIsArchived: false,
        },
        select: { id: true, name: true, parentId: true, stage: true, ancestorIsArchived: true },
        orderBy: { name: "asc" },
      }),
  }),
);

builder.queryField("myMiniProjects", (t) =>
  t.field({
    type: [MiniProjectRef],
    authScopes: { hasRole: true },
    args: {
      includeArchived: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const where: Prisma.ProjectWhereInput = {
        organizationId: (ctx.me as AuthRoleContext).organizationId,
      };

      if (args.includeArchived) {
        where.OR = [
          { stage: { in: [ModelStage.PUBLISHED, ModelStage.ARCHIVED] } },
          { authorId: (ctx.me as AuthRoleContext).roleId, stage: ModelStage.DRAFT },
        ];
      } else {
        where.ancestorIsArchived = false;
        where.OR = [
          { stage: ModelStage.PUBLISHED },
          { authorId: (ctx.me as AuthRoleContext).roleId, stage: ModelStage.DRAFT },
        ];
      }

      return ctx.prisma.project.findMany({
        where,
        select: { id: true, name: true, parentId: true, stage: true, ancestorIsArchived: true },
        orderBy: { name: "asc" },
      });
    },
  }),
);
