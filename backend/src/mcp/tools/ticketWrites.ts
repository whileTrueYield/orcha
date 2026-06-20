/**
 * The ticket write tools: `create_ticket` and `update_ticket`.
 *
 * These are how an agent captures and refines work without leaving the editor:
 * spin up a new ticket from a title and a project, or patch an existing one's
 * fields. Each reuses the exact GraphQL document its `/v1` twin uses
 * (rest/operations.ts), run through the shared `writeAs` core — which refuses a
 * read-only token before the mutation runs — so the MCP and REST faces can never
 * drift in what they accept or return.
 *
 * Exports:
 *  - registerTicketWriteTools(server, resolved): bind both tools to an McpServer,
 *    closed over the connection's resolved role. Writes are tenant-scoped for
 *    free — every mutation runs as `resolved.role`, which the resolvers scope.
 *
 * Validation lives at the tool boundary, matching how `/v1` validates before
 * executing: required fields are required in the input schema (so a missing one
 * is refused by the schema, never reaching the mutation as an opaque GraphQL
 * variable error), and an empty `update_ticket` patch is rejected with a clear
 * code rather than letting updateTicket's own guard throw without one.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  CREATE_TICKET_OPERATION,
  UPDATE_TICKET_OPERATION,
} from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { writeAs, toolResult, toolError, pickPresent } from "./shared";

// The ModelStage (publication) enum values, surfaced in create_ticket's input
// schema so an agent sees the valid stages up front. Kept in sync with
// prisma/schema.prisma by hand — a closed, slow-moving set, and importing the
// Prisma enum here would couple the wire schema an agent reads to a generated
// artifact (same choice as the read tools in tickets.ts).
const MODEL_STAGES = ["DRAFT", "PUBLISHED", "ARCHIVED", "DELETED"] as const;

// The fields create_ticket forwards into CreateTicketInput. title/projectId are
// always present (required by the schema below); the rest are picked only when
// supplied, so an omitted optional is left to the mutation's own default.
const CREATE_TICKET_FIELDS = [
  "title",
  "projectId",
  "productId",
  "workflowId",
  "stage",
] as const;

// The patchable fields update_ticket accepts, matching UpdateTicketInput (and
// the `/v1` PATCH whitelist). Listed here so the tool reads as "these are the
// patchable fields" and an unrecognised arg never leaks into the mutation.
const UPDATE_TICKET_FIELDS = [
  "title",
  "ownerId",
  "projectId",
  "difficulty",
  "estimating",
  "milestone",
  "productId",
  "workflowId",
] as const;

export function registerTicketWriteTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "create_ticket",
    {
      title: "Create a ticket",
      description:
        "Call this to capture a new unit of work; `title` and `projectId` are " +
        "required. Strongly prefer also setting `productId` and `workflowId` " +
        "(discover them with `list_products` and `list_workflows`) — a ticket " +
        "with no workflow has no lifecycle.",
      inputSchema: {
        title: z
          .string()
          .min(1)
          .describe("The ticket's title. Required and non-empty."),
        projectId: z
          .number()
          .int()
          .describe("Id of the project this ticket belongs to. Required."),
        productId: z
          .number()
          .int()
          .optional()
          .describe("Optional product id to associate the ticket with."),
        workflowId: z
          .number()
          .int()
          .optional()
          .describe("Optional workflow id to drive the ticket's stages."),
        stage: z
          .enum(MODEL_STAGES)
          .optional()
          .describe("Optional publication stage; defaults to the project's."),
      },
    },
    async (args) => {
      const input = pickPresent(args, CREATE_TICKET_FIELDS);
      const { data, error } = await writeAs(resolved, CREATE_TICKET_OPERATION, {
        input,
      });
      if (error) return error;
      return toolResult(data!.createTicket);
    },
  );

  server.registerTool(
    "update_ticket",
    {
      title: "Update a ticket",
      description:
        "Call this to change an existing ticket, passing `id` and only the " +
        "fields you want to change (omitted fields are left untouched). To set " +
        "`productId` or `workflowId`, discover valid values with `list_products` " +
        "and `list_workflows` first.",
      inputSchema: {
        id: z.number().int().describe("Id of the ticket to update."),
        title: z.string().optional().describe("New title."),
        ownerId: z.number().int().optional().describe("New owner role id."),
        projectId: z
          .number()
          .int()
          .optional()
          .describe("Move the ticket to this project."),
        difficulty: z
          .number()
          .int()
          .optional()
          .describe("New difficulty estimate."),
        estimating: z
          .boolean()
          .optional()
          .describe("Whether the ticket is being estimated."),
        milestone: z
          .boolean()
          .optional()
          .describe("Whether the ticket is a milestone."),
        productId: z
          .number()
          .int()
          .optional()
          .describe("Associate the ticket with this product."),
        workflowId: z
          .number()
          .int()
          .optional()
          .describe("Drive the ticket with this workflow."),
      },
    },
    async (args) => {
      const input = pickPresent(args, UPDATE_TICKET_FIELDS);
      // Reject an empty patch at the boundary: updateTicket's own empty-input
      // guard throws without a mapped code, so we turn "nothing to update" into
      // a clear BAD_USER_INPUT before executing (mirrors the `/v1` PATCH route).
      if (Object.keys(input).length === 0) {
        return toolError(
          "BAD_USER_INPUT",
          "Provide at least one field to update.",
        );
      }
      const { data, error } = await writeAs(resolved, UPDATE_TICKET_OPERATION, {
        ticketId: args.id,
        input,
      });
      if (error) return error;
      return toolResult(data!.updateTicket);
    },
  );
}
