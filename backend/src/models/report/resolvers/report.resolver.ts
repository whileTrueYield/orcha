/**
 * Report queries and mutations:
 *  - report (query by ID)
 *  - deleteReportQuery (mutation)
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: report
// ---------------------------------------------------------------------------

builder.queryField("report", (t) =>
  t.prismaField({
    type: "Report",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const report = await ctx.prisma.report.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
        include: {
          ...query.include,
          reportQueries: {
            include: {
              byAssignees: true,
              byAuthors: true,
              byFeatures: true,
              byOwners: true,
              byProducts: true,
              byTags: true,
              byTickets: true,
              byWorkflows: true,
              byWorkflowStateAssignees: true,
              byWorkflowStates: true,
              secondaryByAssignees: true,
              secondaryByAuthors: true,
              secondaryByFeatures: true,
              secondaryByOwners: true,
              secondaryByProducts: true,
              secondaryByTags: true,
              secondaryByTickets: true,
              secondaryByWorkflows: true,
              secondaryByWorkflowStateAssignees: true,
              secondaryByWorkflowStates: true,
            },
            orderBy: { position: "asc" },
          },
        },
      });

      if (!report) {
        throw new GraphQLError("This report does not exist or has been deleted", { extensions: { code: "BAD_USER_INPUT" } });
      }

      return report;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: deleteReportQuery
// ---------------------------------------------------------------------------

builder.mutationField("deleteReportQuery", (t) =>
  t.prismaField({
    type: "Report",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      reportQueryId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
        where: {
          id: args.reportQueryId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const reportId = reportQuery.reportId;

      await ctx.prisma.reportQuery.delete({
        where: { id: reportQuery.id },
      });

      return ctx.prisma.report.findFirstOrThrow({
        ...query,
        where: { id: reportId },
      });
    },
  }),
);
