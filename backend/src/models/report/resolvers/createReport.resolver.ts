/**
 * Mutations: createReport, duplicateReport.
 */

import builder from "../../../schema/builder";
import { ModelStage } from "@prisma/client";
import { map, omit } from "lodash";
import { AuthRoleContext } from "../../../types";

const CreateReportInput = builder.inputType("CreateReportInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
});

const DuplicateReportInput = builder.inputType("DuplicateReportInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: createReport
// ---------------------------------------------------------------------------

builder.mutationField("createReport", (t) =>
  t.prismaField({
    type: "Report",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateReportInput, required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.report.create({
        ...query,
        data: {
          name: args.input.name,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.DRAFT,
        },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Mutation: duplicateReport
// ---------------------------------------------------------------------------

builder.mutationField("duplicateReport", (t) =>
  t.prismaField({
    type: "Report",
    authScopes: { hasRole: true },
    args: {
      reportId: t.arg.int({ required: true }),
      input: t.arg({ type: DuplicateReportInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const report = await ctx.prisma.report.findFirstOrThrow({
        where: {
          id: args.reportId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const reportQueries = await ctx.prisma.reportQuery.findMany({
        where: {
          id: args.reportId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const duplicatedReport = await ctx.prisma.report.create({
        ...query,
        data: {
          ...omit(report, ["id", "stage", "createdAt", "updatedAt"]),
          ...{ name: args.input.name },
          stage: ModelStage.DRAFT,
        },
      });

      await ctx.prisma.reportQuery.createMany({
        data: map(reportQueries, (reportQuery) => ({
          ...omit(reportQuery, ["id", "reportId", "createdAt", "updatedAt"]),
          reportId: duplicatedReport.id,
        })),
      });

      return duplicatedReport;
    },
  }),
);
