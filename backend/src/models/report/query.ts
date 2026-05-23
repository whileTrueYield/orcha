import { ReportAggregateField, ReportGroupBy } from "@prisma/client";
import prisma from "../../prisma";
import { QueryAggregate } from "./entity";

interface ReportQueryArg {
  organizationId: number;

  // for now the current viewer's timezone but it could very likely
  // become the organization default's timezone to unify views accross the globe
  timeZone: string;

  // chart by and group by and the output field (aggregateField)
  aggregateField: ReportAggregateField;
  chartBy?: ReportGroupBy | null;
  groupBy?: ReportGroupBy | null;

  // relations list for filters
  workflowStateAssigneeIds?: number[];
  assigneeIds?: number[];
  authorIds?: number[];
  productIds?: number[];
  workflowIds?: number[];
  workflowStateIds?: number[];
  tagIds?: number[];

  // date filtering (optional)
  fromDate?: string | null;
  untilDate?: string | null;
}

// we
type SelectTable = "ticket" | "scheduleItem";

export async function processQuery(
  query: ReportQueryArg
): Promise<QueryAggregate[]> {
  let selectBlock: string[];
  let selectTable: SelectTable = "ticket";
  let groupByMainBlock: string[] = [];

  const fromDate = query.fromDate ? escapeDate(query.fromDate) : null;
  const untilDate = query.untilDate ? escapeDate(query.untilDate) : null;

  const { timeZone } = query;

  // The aggregate needs to be a known option, it could
  // be a count(*) of item (often ticket or people)
  // but also avg or sum for the time spent on task
  switch (query.aggregateField) {
    case ReportAggregateField.TICKET_COUNT:
      selectBlock = ["COUNT(DISTINCT(ticket.id))::int AS value"];
      break;
    case ReportAggregateField.SUM_HOURS_WORKED:
      selectTable = "scheduleItem";
      selectBlock = [
        `EXTRACT ('epoch' FROM SUM(schedule_item."stoppedAt" - schedule_item."startedAt"))/3600 AS value`,
      ];

      break;

    default:
      throw new Error(`Unknow query aggregate ${query.aggregateField}`);
  }

  const sqlWhere = new SqlWhere();

  // selectTable represent the type of data we're going to display: a count of
  // ticket or sum of hours worked. We'll have to also make sure all the data
  // is scoped to the viewer's organization
  if (selectTable === "ticket") {
    // if we're interested in ticket counts, we'll make sure we only retrieve the ones
    // from our organization AND we also want to cap the result to only published
    // tickets, DRAFT, ARCHIVED and DELETED aren't relevant here
    sqlWhere.andComp("ticket", "organizationId", "=", query.organizationId);
    sqlWhere.andComp("ticket", "stage", "=", "PUBLISHED", '"ModelStage"');
  } else {
    // When it comes to time work, the ticket status is irrelevant (worked hours are
    // still worked hours when you delete a ticket) we'll also make sure all the
    // retrieve hours spent are limited to our organization only
    sqlWhere.andComp(
      "schedule_item",
      "organizationId",
      "=",
      query.organizationId
    );
  }

  // if provided, we'll limit the result to specific tags, product
  // and workflows.
  // Note that these are filters, as opposed to grouping fields
  sqlWhere.andIn("tag", "id", query.tagIds);
  sqlWhere.andIn("product", "id", query.productIds);
  sqlWhere.andIn("workflow", "id", query.workflowIds);

  // This is the main grouping, without this we would just get
  // a count (which in some way could make sense ¯\_(ツ)_/¯).
  // chart by will always be provided
  switch (query.chartBy) {
    case ReportGroupBy.PRODUCT:
      groupByMainBlock.push(`ticket."productId"`);
      groupByMainBlock.push(`product."name"`);
      selectBlock.push(`product."name" AS "main"`);

      // given that this grouping field isn't a date, we will only
      // date bound the results if the sum of hours worked is provided
      if (
        fromDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (
        untilDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    case ReportGroupBy.WORKFLOW:
      groupByMainBlock.push(`ticket."workflowId"`);
      groupByMainBlock.push(`workflow."name"`);
      selectBlock.push(`workflow."name" AS "main"`);

      // given that this grouping field isn't a date, we will only
      // date bound the results if the sum of hours worked is provided
      if (
        fromDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (
        untilDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    case ReportGroupBy.WORKFLOW_STATE:
      groupByMainBlock.push(`ticket_workflow_state."name"`);
      selectBlock.push(`ticket_workflow_state."name" AS "main"`);

      // given that this grouping field isn't a date, we will only
      // date bound the results if the sum of hours worked is provided
      if (
        fromDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (
        untilDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    case ReportGroupBy.TAG:
      groupByMainBlock.push(`tag."id"`);
      groupByMainBlock.push(`tag."name"`);
      selectBlock.push(`tag."name" AS "main"`);

      // given that this grouping field isn't a date, we will only
      // date bound the results if the sum of hours worked is provided
      if (
        fromDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (
        untilDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    case ReportGroupBy.ASSIGNEE:
      groupByMainBlock.push(`schedule_item."roleId"`);
      groupByMainBlock.push(`assignee."name"`);
      selectBlock.push(`assignee."name" AS "main"`);

      // given that this grouping field isn't a date, we will only
      // date bound the results if the sum of hours worked is provided
      if (
        fromDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (
        untilDate &&
        query.aggregateField === ReportAggregateField.SUM_HOURS_WORKED
      ) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    // we are entering the realm of date fields, this means we'll apply
    // the time limits if it was provided
    case ReportGroupBy.ETA:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."eta" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."eta" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );

      if (fromDate) {
        sqlWhere.andComp(
          "ticket",
          "eta",
          ">=",
          fromDate + "T00:00:00.000",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (untilDate) {
        sqlWhere.andComp(
          "ticket",
          "eta",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    case ReportGroupBy.CREATED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."createdAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."createdAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );

      if (fromDate) {
        sqlWhere.andComp(
          "ticket",
          "createdAt",
          ">=",
          fromDate + "T00:00:00.000",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (untilDate) {
        sqlWhere.andComp(
          "ticket",
          "createdAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    case ReportGroupBy.CLOSED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."closedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."closedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );

      if (fromDate) {
        sqlWhere.andComp(
          "ticket",
          "closedAt",
          ">=",
          fromDate + "T00:00:00.000",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (untilDate) {
        sqlWhere.andComp(
          "ticket",
          "closedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }
      break;

    case ReportGroupBy.SCHEDULED_AT:
      groupByMainBlock.push(
        `DATE_TRUNC('day', ticket."scheduledAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', ticket."scheduledAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );

      if (fromDate) {
        sqlWhere.andComp(
          "ticket",
          "scheduledAt",
          ">=",
          fromDate + "T00:00:00.000",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (untilDate) {
        sqlWhere.andComp(
          "ticket",
          "scheduledAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }
      break;

    case ReportGroupBy.WORK_DAY:
      groupByMainBlock.push(
        `DATE_TRUNC('day', schedule_item."startedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}'`
      );
      selectBlock.push(
        `DATE_TRUNC('day', schedule_item."startedAt" AT TIME ZONE '${timeZone}') AT TIME ZONE '${timeZone}' AS "main"`
      );

      if (fromDate) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          ">=",
          fromDate + "T00:00:00.000",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      if (untilDate) {
        sqlWhere.andComp(
          "schedule_item",
          "startedAt",
          "<=",
          untilDate + "T23:59:59.999",
          `timestamp with time zone at time zone '${timeZone}'`
        );
      }

      break;

    default:
      throw new Error(`Unhandled query grouping ${query.chartBy}`);
  }

  // this is the optional secondary breakdown. Notice how we do not
  // bound the dates here but only on the first grouping layer
  switch (query.groupBy) {
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

    case ReportGroupBy.WORKFLOW_STATE:
      groupByMainBlock.push(`ticket_workflow_state."name"`);
      selectBlock.push(`ticket_workflow_state."name" AS "secondary"`);

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

    default:
    // nothing to do here, if the second grouping is undefined, null or not a match
    // we'll just ignore it
  }

  let select = "";

  // we can now build the query based on the select table
  switch (selectTable) {
    case "scheduleItem":
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
      break;
    case "ticket":
      select = `
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
      break;
    default:
      throw new Error(`Unrecognized table ${selectTable}`);
  }

  try {
    const results = await prisma.$queryRawUnsafe<QueryAggregate[]>(
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

// a way to prevent SQL injection by only allowing
// numbers and dashes (ISO date format)
export const escapeDate = (date: string): string =>
  date.replace(/[^\d-]/g, "").slice(0, 10);
