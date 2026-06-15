/**
 * End-to-end tests for the MCP ticket lifecycle tool (#73) — `transition_ticket`,
 * the single action-dispatched tool that drives a ticket from unscheduled to done,
 * exercised through the real MCP client over a live HTTP listener (bearer auth →
 * stateless transport → tool → runOperation → GraphQL schema).
 *
 * The contract pinned here is what an integrating agent sees, per action: schedule
 * moves an UNSCHEDULED ticket to SCHEDULED; start requires a stageId and answers
 * with the schedule item it created; advance walks the stages and, past the last,
 * completes the ticket (DONE); close/cancel set DONE/CANCELLED and demand a
 * non-empty note; an unknown action and a read-only PAT are both refused before
 * any mutation runs; and a foreign ticket is invisible (tenant-scoped). Mirrors
 * the REST twin's tests in rest/__tests__/ticketWrites.spec.ts. The other write
 * tools live in writeTools.spec.ts; the read surface in readTools.spec.ts.
 */

import expect from "expect";
import { TicketStatus } from "@prisma/client";
import prisma from "../../prisma";
import {
  getTestApiToken,
  createRandomTicket,
} from "../../utils/testing";
import { listen, connect, parse } from "./mcpClient";

// Run `body` with a connected client for `token`, tearing both down after.
async function withClient(
  token: { plaintext: string },
  body: (
    call: (name: string, args?: Record<string, unknown>) => Promise<any>,
  ) => Promise<void>,
): Promise<void> {
  const { url, server } = listen();
  const { client, transport } = await connect(url, token.plaintext);
  try {
    await body((name, args = {}) => client.callTool({ name, arguments: args }));
  } finally {
    await transport.close();
    server.close();
  }
}

describe("MCP transition_ticket — schedule", () => {
  it("moves an UNSCHEDULED ticket to SCHEDULED", async () => {
    const token = await getTestApiToken();
    // createRandomTicket yields a SCHEDULED ticket with ordered, assigned,
    // estimated stages — the precondition scheduleTicket needs. Roll the status
    // back so there is a transition to make.
    const { ticket } = await createRandomTicket(token.organization, token.role);
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.UNSCHEDULED },
    });

    await withClient(token, async (call) => {
      const result = parse(
        await call("transition_ticket", { id: ticket.id, action: "schedule" }),
      );
      expect(result.id).toBe(ticket.id);
      expect(result.status).toBe("SCHEDULED");
    });
  });
});

describe("MCP transition_ticket — start", () => {
  it("requires a stageId, refusing without one", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = await call("transition_ticket", {
        id: ticket.id,
        action: "start",
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("BAD_USER_INPUT");
    });
  });

  it("opens work on the named stage and returns the created schedule item", async () => {
    const token = await getTestApiToken();
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      token.organization,
      token.role,
    );
    const stage = ticketWorkflowStates[0];

    await withClient(token, async (call) => {
      const item = parse(
        await call("transition_ticket", {
          id: ticket.id,
          action: "start",
          stageId: stage.id,
        }),
      );
      // The answer is the schedule item, not the ticket.
      expect(item.id).toEqual(expect.any(Number));
      expect(item.ticketId).toBe(ticket.id);
      expect(item.ticketWorkflowStateId).toBe(stage.id);

      const persisted = await prisma.scheduleItem.findUnique({
        where: { id: item.id },
      });
      expect(persisted?.ticketId).toBe(ticket.id);
    });
  });
});

describe("MCP transition_ticket — advance", () => {
  it("with no toStageId moves to the next stage and stays SCHEDULED", async () => {
    const token = await getTestApiToken();
    // Three ordered stages; advancing once leaves work to do.
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = parse(
        await call("transition_ticket", { id: ticket.id, action: "advance" }),
      );
      expect(result.id).toBe(ticket.id);
      expect(result.status).toBe("SCHEDULED");
    });
  });

  it("past the last stage completes the ticket (DONE)", async () => {
    const token = await getTestApiToken();
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      token.organization,
      token.role,
    );

    await withClient(token, async (call) => {
      let lastStatus = "SCHEDULED";
      // Drive every stage to its end; the final advance completes the ticket.
      for (let i = 0; i < ticketWorkflowStates.length; i++) {
        const result = parse(
          await call("transition_ticket", { id: ticket.id, action: "advance" }),
        );
        lastStatus = result.status;
      }
      expect(lastStatus).toBe("DONE");
    });
  });
});

describe("MCP transition_ticket — close / cancel", () => {
  it("close with a note marks the ticket DONE", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = parse(
        await call("transition_ticket", {
          id: ticket.id,
          action: "close",
          note: "Shipped it.",
        }),
      );
      expect(result.id).toBe(ticket.id);
      expect(result.status).toBe("DONE");
    });
  });

  it("cancel with a note marks the ticket CANCELLED", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = parse(
        await call("transition_ticket", {
          id: ticket.id,
          action: "cancel",
          note: "Dropped from scope.",
        }),
      );
      expect(result.status).toBe("CANCELLED");
    });
  });

  it("refuses close without a non-empty note", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      // Whitespace-only is treated as empty, just like the REST contract.
      const result = await call("transition_ticket", {
        id: ticket.id,
        action: "close",
        note: "   ",
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("BAD_USER_INPUT");
    });
  });

  it("refuses cancel without a note", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = await call("transition_ticket", {
        id: ticket.id,
        action: "cancel",
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("BAD_USER_INPUT");
    });
  });
});

describe("MCP transition_ticket — boundary & scoping", () => {
  it("refuses an unknown action at the tool boundary", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = await call("transition_ticket", {
        id: ticket.id,
        action: "teleport",
      });
      expect(result.isError).toBe(true);
    });
  });

  it("is tenant-scoped: cannot transition another org's ticket", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket: foreign } = await createRandomTicket(
      other.organization,
      other.role,
    );

    await withClient(token, async (call) => {
      const result = await call("transition_ticket", {
        id: foreign.id,
        action: "close",
        note: "Trying to close a foreign ticket.",
      });
      expect(result.isError).toBe(true);
    });
  });
});

describe("MCP transition_ticket — read-only refusal", () => {
  it("refuses a read-only PAT before any mutation runs, leaving the ticket untouched", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const originalStatus = ticket.status;

    await withClient(token, async (call) => {
      // A fully-valid close — the refusal is the read-only gate (writeAs), not
      // field validation, which is why it carries FORBIDDEN.
      const result = await call("transition_ticket", {
        id: ticket.id,
        action: "close",
        note: "Should not close.",
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("FORBIDDEN");
    });

    const persisted = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(persisted!.status).toBe(originalStatus);
  });
});
