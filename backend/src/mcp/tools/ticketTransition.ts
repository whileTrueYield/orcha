/**
 * The ticket lifecycle tool: `transition_ticket`.
 *
 * One tool drives a ticket through its whole lifecycle. An agent passes an
 * `action` and the tool dispatches to the matching mutation — so the model
 * learns one verb ("transition") and a small vocabulary of actions, not five
 * separate tools. This is the MCP twin of `POST /v1/tickets/:id/transition`
 * (rest/router.ts): same actions, same per-action contract, each reusing the
 * exact GraphQL document its REST twin uses (rest/operations.ts), run through
 * the shared `writeAs` core — which refuses a read-only token before any
 * mutation runs — so the two faces can never drift.
 *
 * Exports:
 *  - registerTicketTransitionTool(server, resolved): bind the tool to an
 *    McpServer, closed over the connection's resolved role. Every mutation runs
 *    as `resolved.role`, which the resolvers tenant-scope, so an agent can only
 *    transition its own organization's tickets.
 *
 * The lifecycle is the dispatcher's contract, spelled out in the tool
 * description so it IS the agent's mental model:
 *   schedule          — UNSCHEDULED → SCHEDULED (the only path to SCHEDULED).
 *   start  { stageId } — open work on a stage; returns the new schedule item.
 *   advance { toStageId?, note? } — next (or explicit) stage; past the last
 *                        stage completes the ticket (DONE).
 *   close  { note }    — → DONE.      note REQUIRED (records the reason).
 *   cancel { note }    — → CANCELLED. note REQUIRED.
 *
 * Per-action required fields are validated at the tool boundary (matching the
 * REST route's per-branch checks): a missing `stageId` on `start` or an empty
 * `note` on close/cancel is refused with a clear BAD_USER_INPUT before the
 * mutation runs, never reaching it as an opaque GraphQL error.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  SCHEDULE_TICKET_OPERATION,
  START_TICKET_STAGE_OPERATION,
  ADVANCE_TICKET_STATE_OPERATION,
  UPDATE_TICKET_STATUS_OPERATION,
} from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { writeAs, toolResult, toolError } from "./shared";

// The lifecycle actions, surfaced as an enum so an agent sees the whole
// vocabulary up front — the closed set of moves it can make on a ticket.
const ACTIONS = ["schedule", "start", "advance", "close", "cancel"] as const;

export function registerTicketTransitionTool(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "transition_ticket",
    {
      title: "Transition a ticket through its lifecycle",
      description:
        "Call this to move a ticket through its lifecycle, passing its `id` " +
        "and one `action`. Each action has its own required fields and effect " +
        "— see the `action` parameter.",
      inputSchema: {
        id: z.number().int().describe("Id of the ticket to transition."),
        action: z
          .enum(ACTIONS)
          .describe(
            "The lifecycle move:\n" +
              "- `schedule`: UNSCHEDULED → SCHEDULED (the only way to schedule).\n" +
              "- `start`: open work on a stage; requires `stageId`, returns the " +
              "schedule item (not the ticket).\n" +
              "- `advance`: close the current stage and move to the next (or " +
              "`toStageId`); past the last stage completes the ticket (DONE).\n" +
              "- `close`: finish the ticket (DONE); requires a non-empty `note`.\n" +
              "- `cancel`: drop the ticket (CANCELLED); requires a non-empty `note`.",
          ),
        stageId: z
          .number()
          .int()
          .optional()
          .describe(
            "Ticket workflow state id to open work on. Required for `start`.",
          ),
        toStageId: z
          .number()
          .int()
          .optional()
          .describe(
            "For `advance`: the stage to move to. Omit to take the next stage " +
              "by position.",
          ),
        note: z
          .string()
          .optional()
          .describe(
            "Reason for the move. Required (non-empty) for `close` and " +
              "`cancel`; optional for `advance`.",
          ),
      },
    },
    async (args) => {
      const ticketId = args.id;

      switch (args.action) {
        case "schedule": {
          const { data, error } = await writeAs(
            resolved,
            SCHEDULE_TICKET_OPERATION,
            { ticketId },
          );
          if (error) return error;
          return toolResult(data!.scheduleTicket);
        }

        case "start": {
          // `start` opens work on a named stage — the stage is the whole point
          // of the action, so refuse a missing one before the mutation runs.
          if (typeof args.stageId !== "number") {
            return toolError(
              "BAD_USER_INPUT",
              "`stageId` is required for action `start`.",
            );
          }
          const { data, error } = await writeAs(
            resolved,
            START_TICKET_STAGE_OPERATION,
            { input: { ticketId, ticketWorkflowStateId: args.stageId } },
          );
          if (error) return error;
          return toolResult(data!.createScheduleItem);
        }

        case "advance": {
          // toStageId/note are optional: an absent toStageId lets the resolver
          // pick the next stage by position (passing undefined, as the REST
          // twin does).
          const { data, error } = await writeAs(
            resolved,
            ADVANCE_TICKET_STATE_OPERATION,
            {
              ticketId,
              toTicketWorkflowStateId: args.toStageId,
              note: args.note,
            },
          );
          if (error) return error;
          return toolResult(data!.advanceTicketWorkflowState);
        }

        case "close":
        case "cancel": {
          // A lifecycle-ending decision must record its reason: require a
          // non-empty note for both, mirroring the REST contract (the GraphQL
          // arg itself is optional).
          if (typeof args.note !== "string" || args.note.trim().length === 0) {
            return toolError(
              "BAD_USER_INPUT",
              `A non-empty \`note\` is required for action \`${args.action}\`.`,
            );
          }
          const status = args.action === "close" ? "DONE" : "CANCELLED";
          const { data, error } = await writeAs(
            resolved,
            UPDATE_TICKET_STATUS_OPERATION,
            { ticketId, status, note: args.note },
          );
          if (error) return error;
          return toolResult(data!.updateTicketStatus);
        }

        // The enum makes this unreachable; kept so the dispatch is total and a
        // future action added to ACTIONS without a branch fails loudly.
        default:
          return toolError(
            "BAD_USER_INPUT",
            `Unknown action \`${args.action}\`. Valid: ${ACTIONS.join(", ")}.`,
          );
      }
    },
  );
}
