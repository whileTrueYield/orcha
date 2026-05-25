/**
 * Search resolvers — full-text search across tickets, projects, and roles.
 *
 * Exports: none (side-effect: registers `search`, `searchTicket`, and
 * `searchRole` queries on the builder).
 *
 * Uses PostgreSQL's websearch_to_tsquery for weighted full-text search.
 * All queries require hasRole (org-scoped).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { SearchResultRef } from "../entity";

// ---------------------------------------------------------------------------
// Raw result shape from the SQL query
// ---------------------------------------------------------------------------

interface RawSearchResult {
  id: string;
  name: string;
  description: string;
  meta: string;
}

// ---------------------------------------------------------------------------
// search — tickets + projects
//
// Scans and unions two record sets (tickets and projects) with the same
// structure, then ranks results using PostgreSQL's websearch feature.
//
// The `includeClosed` flag uses a boolean guard in SQL:
//   $3 OR ticket.status IN ('UNSCHEDULED', 'SCHEDULED')
// When $3 is true the status filter is bypassed (all statuses included).
// ---------------------------------------------------------------------------

builder.queryField("search", (t) =>
  t.field({
    type: [SearchResultRef],
    authScopes: { hasRole: true },
    args: {
      query: t.arg.string({ required: true }),
      includeClosed: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.$queryRawUnsafe<RawSearchResult[]>(
        `SELECT id, name, description, meta
FROM (
  (SELECT
        CONCAT('ticket:', ticket.id, ':', product.code, ':', ticket."localId", ':', COALESCE(project.name, '')) as id,
        ticket.title as name,
        ticket.description,
        CONCAT(
            'ticket', ', ',
            COALESCE(workflow.name, ''), ', ',
            COALESCE(product.name, ''), ', ',
            COALESCE(product.code, ''), ticket."localId", ', ',
            COALESCE(product.code, ''), '-', ticket."localId", ', ',
            COALESCE(product.code, ''), ' ', ticket."localId", ', ',
            COALESCE(project.name, ''), ', ',
            COALESCE(string_agg(tag.name, ' '), '')) as meta
    FROM ticket
    LEFT JOIN "_TagToTicket" TTT on ticket.id = TTT."B"
    LEFT JOIN tag on TTT."A" = tag.id
    LEFT JOIN product on ticket."productId" = product.id
    LEFT JOIN workflow on ticket."workflowId" = workflow.id
    LEFT JOIN project on ticket."projectId" = project.id
    WHERE
      ticket."organizationId" = $2 AND
      ticket.stage = 'PUBLISHED' AND
      project.stage = 'PUBLISHED' AND
      project."ancestorIsArchived" IS FALSE AND (
        $3 OR ticket.status IN ('UNSCHEDULED', 'SCHEDULED')
      )
    GROUP BY ticket.id, product.name, workflow.name, project.name, product.code, ticket."localId"
    )
  UNION
  (SELECT
        CONCAT('project:', project.id, ':', project.name) as id,
        project.name AS name,
        string_agg(project."indexableContent", ' ') as description,
        CONCAT(
          'project', ' - ',
          COALESCE(project.name, '')
        )
        as meta
    FROM project
    WHERE
      project."organizationId" = $2 AND
      project.stage = 'PUBLISHED' AND
      project."ancestorIsArchived" IS FALSE
    GROUP BY project.id, project.name)
  ) c
WHERE
    SETWEIGHT(TO_TSVECTOR(COALESCE(name, '')), 'A') || SETWEIGHT(TO_TSVECTOR(COALESCE(meta, '')), 'B') || SETWEIGHT(TO_TSVECTOR(COALESCE(description, '')), 'C') @@ websearch_to_tsquery($1)
ORDER BY TS_RANK(SETWEIGHT(TO_TSVECTOR(COALESCE(name, '')), 'A') || SETWEIGHT(TO_TSVECTOR(COALESCE(meta, '')), 'B') || SETWEIGHT(TO_TSVECTOR(COALESCE(description, '')), 'C'), websearch_to_tsquery($1)) DESC
LIMIT 20`,
        args.query,
        me.organizationId,
        !!args.includeClosed,
      );
    },
  }),
);

// ---------------------------------------------------------------------------
// searchTicket — tickets only
// ---------------------------------------------------------------------------

builder.queryField("searchTicket", (t) =>
  t.field({
    type: [SearchResultRef],
    authScopes: { hasRole: true },
    args: {
      query: t.arg.string({ required: true }),
      includeClosed: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.$queryRawUnsafe<RawSearchResult[]>(
        `SELECT id, name, description, meta
FROM
  (SELECT
        CONCAT(ticket.id, ':', product.code, ':', ticket."localId", ':', COALESCE(project.name, '')) as id,
        ticket.title as name,
        ticket.description,
        CONCAT(
            'ticket', ', ',
            COALESCE(workflow.name, ''), ', ',
            COALESCE(product.name, ''), ', ',
            COALESCE(product.code, ''), ticket."localId", ', ',
            COALESCE(product.code, ''), '-', ticket."localId", ', ',
            COALESCE(product.code, ''), ' ', ticket."localId", ', ',
            COALESCE(project.name, ''), ', ',
            COALESCE(string_agg(tag.name, ' '), '')) as meta
    FROM ticket
    LEFT JOIN "_TagToTicket" TTT on ticket.id = TTT."B"
    LEFT JOIN tag on TTT."A" = tag.id
    LEFT JOIN product on ticket."productId" = product.id
    LEFT JOIN workflow on ticket."workflowId" = workflow.id
    LEFT JOIN project on ticket."projectId" = project.id
    WHERE
      ticket."organizationId" = $2 AND
      ticket.stage = 'PUBLISHED' AND
      project.stage = 'PUBLISHED' AND
      project."ancestorIsArchived" IS FALSE AND (
        $3 OR ticket.status IN ('UNSCHEDULED', 'SCHEDULED')
      )
    GROUP BY ticket.id, product.name, workflow.name, project.name, product.code, ticket."localId"
    ) c
WHERE
    SETWEIGHT(TO_TSVECTOR(COALESCE(name, '')), 'A') || SETWEIGHT(TO_TSVECTOR(COALESCE(meta, '')), 'B') || SETWEIGHT(TO_TSVECTOR(COALESCE(description, '')), 'C') @@ websearch_to_tsquery($1)
ORDER BY TS_RANK(SETWEIGHT(TO_TSVECTOR(COALESCE(name, '')), 'A') || SETWEIGHT(TO_TSVECTOR(COALESCE(meta, '')), 'B') || SETWEIGHT(TO_TSVECTOR(COALESCE(description, '')), 'C'), websearch_to_tsquery($1)) DESC
LIMIT 20`,
        args.query,
        me.organizationId,
        !!args.includeClosed,
      );
    },
  }),
);

// ---------------------------------------------------------------------------
// searchRole — find roles by name or user email
// ---------------------------------------------------------------------------

builder.queryField("searchRole", (t) =>
  t.prismaField({
    type: ["Role"],
    authScopes: { hasRole: true },
    args: {
      query: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.role.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          status: "ACCEPTED",
          OR: [
            {
              name: { contains: args.query, mode: "insensitive" },
            },
            {
              user: {
                email: { contains: args.query, mode: "insensitive" },
              },
            },
          ],
        },
      });
    },
  }),
);
