import { Arg, Ctx, Query, Resolver, UseMiddleware } from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { SearchResult } from "../entity";
import { Role } from "../../entities";

interface RawSearchResult {
  id: string;
  name: string;
  description: string;
  meta: string;
}
/**
 * Search using NLP in the database, using weight and web search
 *
 * A few things worth explaining:
 * - We are scanning and concatening two record set with the same structure,
 * one for ticket, the other for project.
 * - We search in the contructed set using postgres websearch feature
 *
 * Also, for optional values, we use a boolean flag that we re-protect using !! (to ensure we interpret a boolean)
 * You'll see it in action on the ticket selection:
 *     $3 OR ticket.status IN ('UNSCHEDULED', 'SCHEDULED')
 *
 * this means, if $3 is on, the `ticket.status IN ('UNSCHEDULED', 'SCHEDULED')` WILL NOT run
 */
@Resolver()
export class SearchResolver {
  @Query(() => [SearchResult])
  @UseMiddleware(hasRole())
  async search(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("query") query: String,
    @Arg("includeClosed", { nullable: true }) includeClosed?: Boolean,
  ): Promise<SearchResult[]> {
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
      query,
      ctx.me.organizationId,
      !!includeClosed,
    );
  }

  @Query(() => [SearchResult])
  @UseMiddleware(hasRole())
  async searchTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("query") query: String,
    @Arg("includeClosed", { nullable: true }) includeClosed?: Boolean,
  ): Promise<SearchResult[]> {
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
      query,
      ctx.me.organizationId,
      !!includeClosed,
    );
  }

  @Query(() => [Role])
  @UseMiddleware(hasRole())
  async searchRole(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("query") query: string,
  ): Promise<Role[]> {
    return ctx.prisma.role.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        status: "ACCEPTED",
        OR: [
          {
            name: { contains: query, mode: "insensitive" },
          },
          {
            user: {
              email: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
    });
  }
}
