/**
 * The ticket read tools: `next_tickets`, `list_tickets`, `get_ticket`, and
 * `get_ticket_body`.
 *
 * These are how an agent finds and understands tickets before acting: the
 * scheduler-ordered work queue, an ad-hoc filtered search, a single ticket's
 * full detail, and the editable Markdown body. Each reuses the exact GraphQL
 * document its `/v1` twin uses (rest/operations.ts), run through the shared
 * `readAs` core, so the MCP and REST faces can never drift in what they return.
 *
 * Exports:
 *  - registerTicketTools(server, resolved): bind all four tools to an McpServer,
 *    closed over the connection's resolved role. The tools are tenant-scoped for
 *    free — every operation runs as `resolved.role`, which the resolvers scope.
 *
 * Output is FLAT: list nodes are returned as a plain array under a named key
 * with pagination meta beside it; `get_ticket` hoists the ticket's fields and
 * groups its edges (workflow states, dependencies) under stable keys, so a
 * model reasons over a predictable shape rather than the GraphQL nesting.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  NEXT_TICKETS_OPERATION,
  TICKETS_OPERATION,
  TICKET_OPERATION,
  TICKET_BODY_OPERATION,
} from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { readAs, toolResult, pageMeta } from "./shared";

// The TicketStatus (work lifecycle) and ModelStage (publication) enum values,
// surfaced in the tool's input schema so an agent sees the valid filters
// up front. Kept in sync with prisma/schema.prisma by hand — the values are a
// closed, slow-moving set, and importing the Prisma enum here would couple the
// wire schema an agent reads to a generated artifact.
const TICKET_STATUSES = ["UNSCHEDULED", "SCHEDULED", "DONE", "CANCELLED"] as const;
const MODEL_STAGES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"] as const;

export function registerTicketTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "next_tickets",
    {
      title: "What should I work on next?",
      description:
        "Call this to decide what to work on next. Returns your work queue in " +
        "scheduler (MCTS) priority order: the tickets assigned to your role, " +
        "each with the next workflow state to advance it into (`nextState`). " +
        "The order is authoritative — start at the top. Takes no arguments.",
    },
    async () => {
      const { data, error } = await readAs(resolved, NEXT_TICKETS_OPERATION);
      if (error) return error;
      // Flatten each entry: hoist the ticket's fields and keep nextState beside
      // them, so the model gets a flat list of actionable items.
      const tickets = data!.myNextTickets.map(
        (entry: { ticket: Record<string, unknown>; nextState: unknown }) => ({
          ...entry.ticket,
          nextState: entry.nextState,
        }),
      );
      return toolResult(tickets);
    },
  );

  server.registerTool(
    "list_tickets",
    {
      title: "Find tickets",
      description:
        "Call this to find tickets by criteria — NOT to decide what to work " +
        "on next (use `next_tickets` for that). Filter by project, status, " +
        "stage, assignee role, and/or a search string; any omitted filter is " +
        "unconstrained. Results are tenant-scoped and paginated: pass `limit` " +
        "and `offset`, and walk pages with the `nextOffset` from the response " +
        "(null once there are no more).",
      inputSchema: {
        project: z
          .number()
          .int()
          .optional()
          .describe("Only tickets in this project id."),
        status: z
          .array(z.enum(TICKET_STATUSES))
          .optional()
          .describe(
            "Only tickets in these work-lifecycle states. Omit for any.",
          ),
        stage: z
          .array(z.enum(MODEL_STAGES))
          .optional()
          .describe("Only tickets in these publication stages. Omit for any."),
        assignee: z
          .array(z.number().int())
          .optional()
          .describe("Only tickets assigned to these role ids."),
        search: z
          .string()
          .optional()
          .describe("Free-text search over the ticket title and body."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Page size (max 100). Omit for the server default."),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("How many to skip; pass `nextOffset` to read the next page."),
      },
    },
    async ({ project, status, stage, assignee, search, limit, offset }) => {
      const skip = offset ?? 0;
      const { data, error } = await readAs(resolved, TICKETS_OPERATION, {
        first: limit,
        offset: skip,
        projectId: project,
        search,
        statuses: status,
        assigneeIds: assignee,
        stages: stage,
      });
      if (error) return error;
      const page = data!.tickets;
      return toolResult({ tickets: page.nodes, ...pageMeta(page, skip) });
    },
  );

  server.registerTool(
    "get_ticket",
    {
      title: "Get a ticket's full detail",
      description:
        "Call this to understand a single ticket before acting on it. Returns " +
        "its status/stage, estimate and ETA, its workflow states (each with a " +
        "three-point estimate), its dependency edges (`ancestors` it waits on, " +
        "`successors` waiting on it), and the Markdown body with its version. " +
        "Use the returned body `version` when writing the body back.",
      inputSchema: {
        id: z.number().int().describe("The ticket id."),
      },
    },
    async ({ id }) => {
      const { data, error } = await readAs(resolved, TICKET_OPERATION, { id });
      if (error) return error;
      const ticket = data!.ticket;
      // Hoist the ticket's own fields; group its edges under stable keys so the
      // model gets the same shape every call regardless of how many edges exist.
      return toolResult({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        stage: ticket.stage,
        estimate: ticket.estimate,
        eta: ticket.eta,
        progress: ticket.progress,
        project: ticket.project,
        workflowStates: ticket.ticketWorkflowStates,
        ancestors: ticket.ancestors,
        successors: ticket.successors,
        body: ticket.body,
      });
    },
  );

  server.registerTool(
    "get_ticket_body",
    {
      title: "Get a ticket's Markdown body",
      description:
        "Call this when you only need a ticket's Markdown body and its " +
        "version, not the surrounding detail. Returns `{ markdown, version }`; " +
        "the `version` is the value a later body write must condition on, so " +
        "read it immediately before editing.",
      inputSchema: {
        id: z.number().int().describe("The ticket id."),
      },
    },
    async ({ id }) => {
      const { data, error } = await readAs(resolved, TICKET_BODY_OPERATION, {
        id,
      });
      if (error) return error;
      return toolResult(data!.ticket.body);
    },
  );
}
