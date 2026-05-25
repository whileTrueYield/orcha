/**
 * Queries: projects (paginated), myProjects.
 */

import builder from "../../../schema/builder";
import { PaginatedProjects } from "../entity";
import { getPaginatedProjects } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("projects", (t) =>
  t.field({
    type: PaginatedProjects,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      parentId: t.arg.int({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedProjects({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
        parentId: args.parentId ?? undefined,
      }),
  }),
);

builder.queryField("myProjects", (t) =>
  t.prismaField({
    type: ["Project"],
    description: "The user's own projects and drafts",
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.project.findMany({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          ownerId: (ctx.me as AuthRoleContext).roleId,
        },
        include: { ...query.include, author: true, owner: true },
        orderBy: { createdAt: "desc" },
      }),
  }),
);
