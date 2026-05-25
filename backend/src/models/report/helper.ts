import { clamp, trim } from "lodash";
import { Report, ModelStage } from "@prisma/client";
import prisma from "../../prisma";
import { Prisma, ReportAggregateField, ReportGroupBy } from ".prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { FilterElementShape, QueryAggregateShape } from "./entity";
// TODO: DateFilterElement was a TypeGraphQL @InputType. In Pothos it will be
// defined as a builder inputType in the report resolver files. For now, keep
// it as a plain TS class since it's only consumed by helper logic below.
import { isValid } from "date-fns";

interface GetReportsArgs extends GetPageArgsFor<Report> {
  organizationId: number;
  stages?: ModelStage[];
}

/**
 * Convert a database record into a FilterElement with a unique
 * identifier that can be use with apollo graphql caching layer
 * @param name Record type name, like "product"
 * @param label where the label is stored on the object, "title" or "name"
 * @returns a callable that returns a FilterElement
 */
export function toFilterElement<T extends { id: number }>(
  name: string,
  label: Extract<keyof T, string>
): (record: T) => FilterElementShape {
  return (record: T) => ({
    id: `${name}:${record.id}`,
    label: `${record[label]}`,
    recordId: record.id,
  });
}

export async function getPaginatedReports(
  args: GetReportsArgs
) {
  const { first, last, search, organizationId, stages } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Report = args.sort ? args.sort : "name";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const reportQuery: Prisma.ReportWhereInput = {
    organizationId,
  };

  // We allow search on organizations by name
  const query = trim(search);
  if (query) {
    reportQuery.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (stages?.length) {
    reportQuery.stage = { in: stages, not: ModelStage.DELETED };
  } else {
    reportQuery.stage = { not: ModelStage.DELETED };
  }

  const reports = await prisma.report.findMany({
    where: reportQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.report.count({ where: reportQuery });

  return paginateNodes({ nodes: reports, offset, pageSize, count });
}

interface ReportAggArgs {
  organizationId: number;
  timeZone: string;
  authorIds?: number[];
  productIds?: number[];
  workflowIds?: number[];
  tagIds?: number[];
  closedAtFilter?: string;
  createdAtFilter?: string;
  etaFilter?: string;
  groupByMain: ReportGroupBy;
  groupBySecondary?: ReportGroupBy | null;
  aggregateField: ReportAggregateField;
  fromCreatedAt?: string | null;
  untilCreatedAt?: string | null;
  fromEta?: string | null;
  untilEta?: string | null;
  fromClosedAt?: string | null;
  untilClosedAt?: string | null;
  fromScheduledAt?: string | null;
  untilScheduledAt?: string | null;
  fromStartAt?: string | null;
  untilStartAt?: string | null;
  fromStoppedAt?: string | null;
  untilStoppedAt?: string | null;
}

type SelectTable = "ticket" | "scheduleItem" | "ticketWorkflowState";

export async function getTicketAggregateForReport(
  args: ReportAggArgs
): Promise<QueryAggregateShape[]> {
  let selectBlock: string[];
  let selectTable: SelectTable = "ticket";
  let groupByMainBlock: string[] = [];

  // to prevent SQL injection since the timeZone is entered by the user
  // we will remove anything that isn't Alpha or / from it
  const timeZone = args.timeZone.replace("/^[A-Z0-9/_-+]/gi", "");

  // The aggregate needs to be a known option, it could
  // be a count(*) of item (often ticket or people)
  // but also avg or sum for the time spent on task
  switch (args.aggregateField) {
    case ReportAggregateField.TICKET_COUNT:
      selectBlock = ["COUNT(DISTINCT(ticket.id))::int AS value"];
      break;
    case ReportAggregateField.SUM_HOURS_WORKED:
      selectBlock = [
        `EXTRACT ('epoch' FROM SUM(schedule_item."stoppedAt" - schedule_item."startedAt"))/3600 AS value`,
      ];
      selectTable = "scheduleItem";
      break;
    //- THIS IS A PROBLEMATIC QUERY
    //- because hours work are broken down, we would have to do a double aggregate AVG(SUM(*))
    //- which is not possible in postgres and would likely require a sub-select
    // case ReportAggregateField.AVG_HOURS_WORKED:
    //   selectBlock = [
    //     `EXTRACT ('epoch' FROM AVG(schedule_item."stoppedAt" - schedule_item."startedAt"))/3600 AS value`,
    //   ];
    //   selectTable = "scheduleItem";
    //   break;
    default:
      throw new Error(`Unknow query aggregate ${args.aggregateField}`);
  }

  // grouping by the same attribute makes no sense, lets avoid it
  if (args.groupBySecondary && args.groupBySecondary === args.groupByMain) {
    throw new Error(
      `Cannot aggregate identical grouping: ${args.groupByMain} and ${args.groupBySecondary}`
    );
  }

  // This is the main grouping, without this we would just get
  // a count (which in some way could make sense ¯\_(ツ)_/¯).
  switch (args.groupByMain) {
    case ReportGroupBy.PRODUCT:
      groupByMainBlock.push(`ticket."productId"`);
      groupByMainBlock.push(`product."name"`);
      selectBlock.push(`product."name" AS "main"`);
      break;

    case ReportGroupBy.WORKFLOW:
      groupByMainBlock.push(`ticket."workflowId"`);
      groupByMainBlock.push(`workflow."name"`);
      selectBlock.push(`workflow."name" AS "main"`);
      break;

    case ReportGroupBy.TAG:
      groupByMainBlock.push(`tag."id"`);
      groupByMainBlock.push(`tag."name"`);
      selectBlock.push(`tag."name" AS "main"`);
      break;

    case ReportGroupBy.ASSIGNEE:
      groupByMainBlock.push(`schedule_item."roleId"`);
      groupByMainBlock.push(`assignee."name"`);
      selectBlock.push(`assignee."name" AS "main"`);
      break;

    case ReportGroupBy.ETA:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."eta" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."eta" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );
      break;

    case ReportGroupBy.CREATED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."createdAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."createdAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );
      break;

    case ReportGroupBy.CLOSED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."closedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."closedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );
      break;

    case ReportGroupBy.SCHEDULED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."scheduledAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."scheduledAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );
      break;

    case ReportGroupBy.WORK_DAY:
      groupByMainBlock.push(
        `DATE_TRUNC('day', schedule_item."startedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', schedule_item."startedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );
      break;

    case ReportGroupBy.WORKFLOW_STATE:
      groupByMainBlock.push(`ticket_workflow_state."name"`);
      selectBlock.push(`ticket_workflow_state."name" AS "main"`);
      break;

    default:
      throw new Error(`Unhandled query grouping ${args.groupByMain}`);
  }

  // Add any sub grouping if provided (subGroupBy is optional)
  switch (args.groupBySecondary) {
    case undefined:
    case null:
      // handle the case where subGroupBy is ignored
      break;
    case ReportGroupBy.PRODUCT:
      groupByMainBlock.push(`ticket."productId"`);
      groupByMainBlock.push(`product."name"`);
      selectBlock.push(`product."name" AS "secondary"`);
      break;

    case ReportGroupBy.WORKFLOW:
      groupByMainBlock.push(`ticket."workflowId"`);
      groupByMainBlock.push(`workflow."name"`);
      selectBlock.push(`workflow."name" AS "secondary"`);
      break;

    case ReportGroupBy.TAG:
      groupByMainBlock.push(`tag."id"`);
      groupByMainBlock.push(`tag."name"`);
      selectBlock.push(`tag."name" AS "secondary"`);
      break;

    case ReportGroupBy.ASSIGNEE:
      groupByMainBlock.push(`schedule_item."roleId"`);
      groupByMainBlock.push(`assignee."name"`);
      selectBlock.push(`assignee."name" AS "secondary"`);
      break;

    case ReportGroupBy.ETA:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."eta" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."eta" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "secondary"`
      );
      break;

    case ReportGroupBy.CREATED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."createdAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."createdAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "secondary"`
      );
      break;

    case ReportGroupBy.CLOSED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."closedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."closedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "secondary"`
      );
      break;

    case ReportGroupBy.SCHEDULED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."scheduledAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."scheduledAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "secondary"`
      );
      break;

    case ReportGroupBy.WORK_DAY:
      groupByMainBlock.push(
        `DATE_TRUNC('day', schedule_item."startedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', schedule_item."startedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "secondary"`
      );
      break;

    case ReportGroupBy.WORKFLOW_STATE:
      groupByMainBlock.push(`ticket_workflow_state."name"`);
      selectBlock.push(`ticket_workflow_state."name" AS "secondary"`);
      break;

    default:
      throw new Error(`Unhandled query grouping ${args.groupBySecondary}`);
  }

  const sqlWhere = new SqlWhere();
  if (selectTable === "ticket") {
    sqlWhere.andComp("ticket", "organizationId", "=", args.organizationId);
    sqlWhere.andComp("ticket", "stage", "=", "PUBLISHED", '"ModelStage"');
  } else {
    sqlWhere.andComp(
      "schedule_item",
      "organizationId",
      "=",
      args.organizationId
    );
  }

  sqlWhere.andIn("tag", "id", args.tagIds);
  sqlWhere.andIn("product", "id", args.productIds);
  sqlWhere.andIn("workflow", "id", args.workflowIds);

  if (args.fromCreatedAt) {
    sqlWhere.andComp(
      "ticket",
      "createdAt",
      ">=",
      escapeDate(args.fromCreatedAt) + "T00:00:00.000",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.untilCreatedAt) {
    sqlWhere.andComp(
      "ticket",
      "createdAt",
      "<=",
      escapeDate(args.untilCreatedAt) + "T23:59:59.999",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.fromClosedAt) {
    sqlWhere.andComp(
      "ticket",
      "closedAt",
      ">=",
      escapeDate(args.fromClosedAt) + "T00:00:00.000",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.untilClosedAt) {
    sqlWhere.andComp(
      "ticket",
      "closedAt",
      "<=",
      escapeDate(args.untilClosedAt) + "T23:59:59.999",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.fromEta) {
    sqlWhere.andComp(
      "ticket",
      "eta",
      ">=",
      escapeDate(args.fromEta) + "T00:00:00.000",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.untilEta) {
    sqlWhere.andComp(
      "ticket",
      "eta",
      "<=",
      escapeDate(args.untilEta) + "T23:59:59.999",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.fromScheduledAt) {
    sqlWhere.andComp(
      "ticket",
      "scheduledAt",
      ">=",
      escapeDate(args.fromScheduledAt) + "T00:00:00.000",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.untilScheduledAt) {
    sqlWhere.andComp(
      "ticket",
      "scheduledAt",
      "<=",
      escapeDate(args.untilScheduledAt) + "T23:59:59.999",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.fromStartAt) {
    sqlWhere.andComp(
      "schedule_item",
      "startedAt",
      ">=",
      escapeDate(args.fromStartAt) + "T00:00:00.000",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  if (args.untilStartAt) {
    sqlWhere.andComp(
      "schedule_item",
      "startedAt",
      "<=",
      escapeDate(args.untilStartAt) + "T23:59:59.999",
      `timestamp with time zone at time zone '${timeZone}'`
    );
  }

  let select = `
SELECT ${selectBlock.join(" , ")}
FROM ticket
LEFT JOIN schedule_item ON ticket."id" = "schedule_item"."ticketId" 
LEFT JOIN role "assignee" ON assignee."id" = schedule_item."roleId" 
LEFT JOIN ticket_workflow_state ON ticket_workflow_state."id" = schedule_item."ticketWorkflowStateId" 
JOIN workflow ON workflow."id" = ticket."workflowId" 
JOIN product ON product."id" = ticket."productId" 
LEFT JOIN "_TagToTicket" ON ticket."id" = "_TagToTicket"."B" 
LEFT JOIN tag ON tag."id" = "_TagToTicket"."A"
WHERE ${sqlWhere.toString()}
GROUP BY ${groupByMainBlock.join(" , ")};`;

  if (selectTable === "scheduleItem") {
    select = `
SELECT ${selectBlock.join(" , ")}
FROM schedule_item 
JOIN role "assignee" ON assignee."id" = schedule_item."roleId" 
JOIN ticket_workflow_state ON ticket_workflow_state."id" = schedule_item."ticketWorkflowStateId" 
JOIN ticket ON ticket."id" = "ticket_workflow_state"."ticketId" 
JOIN workflow ON workflow."id" = ticket."workflowId" 
JOIN product ON product."id" = ticket."productId" 
JOIN "_TagToTicket" ON ticket."id" = "_TagToTicket"."B" 
JOIN tag ON tag."id" = "_TagToTicket"."A"
WHERE ${sqlWhere.toString()}
GROUP BY ${groupByMainBlock.join(" , ")};`;
  }

  console.log(sqlWhere);
  try {
    const results = await prisma.$queryRawUnsafe<QueryAggregateShape[]>(
      select,
      ...sqlWhere.values
    );
    return results;
  } catch (error) {
    console.log(select, sqlWhere.values);
    throw error;
  }
}

class SqlWhere {
  statements: string[];
  values: any[];

  constructor() {
    this.statements = [];
    this.values = [];
  }

  // return the index to be use for interpolation
  valueIdx(): number {
    return this.values.length + 1;
  }

  andIn(table: string, column: string, value?: number[]): void {
    if (value) {
      if (value.length === 1) {
        this.statements.push(`"${table}"."${column}" = $${this.valueIdx()}`);
        this.values.push(value[0]);
      } else if (value.length > 1) {
        this.statements.push(`"${table}"."${column}" IN (${value.join(",")})`);
      }
    }
  }

  andState(
    table: string,
    column: string,
    operator: "IS NULL" | "IS NOT NULL"
  ): void {
    this.statements.push(`"${table}"."${column}" ${operator}`);
  }

  andExists(operator: "NOT EXISTS" | "EXISTS", query: string): void {
    this.statements.push(`${operator} (${query})`);
  }

  andComp(
    table: string,
    column: string,
    operator: "=" | "!=" | ">	" | ">=" | "<" | "<=" | "LIKE",
    value: number | string,
    cast?: string
  ): void {
    let statement = cast
      ? `"${table}"."${column}" ${operator} $${this.valueIdx()}::${cast}`
      : `"${table}"."${column}" ${operator} $${this.valueIdx()}`;

    this.statements.push(statement);
    this.values.push(value);
  }

  and(statement?: string) {
    if (statement) {
      this.statements.push(statement);
    }
  }

  toString(): string {
    return this.statements.join(" AND ");
  }
}

export class DateFilterElement {
  beforeDate?: string;
  afterDate?: string;
}

export const escapeDate = (date: string): string =>
  date.replace(/[^\d-]/g, "").slice(0, 10);

export const extractDatesFromFilter = (
  dateFilter?: DateFilterElement
): [string | null, string | null] => {
  let before: string | null = null;
  let after: string | null = null;

  if (dateFilter) {
    const { beforeDate, afterDate } = dateFilter;

    if (beforeDate && isValid(new Date(beforeDate))) {
      before = escapeDate(beforeDate);
    }

    if (afterDate && isValid(new Date(afterDate))) {
      after = escapeDate(afterDate);
    }
  }

  // in case dates were provided in the wrong order
  if (after && before && after > before) {
    return [before, after];
  }

  return [after, before];
};
