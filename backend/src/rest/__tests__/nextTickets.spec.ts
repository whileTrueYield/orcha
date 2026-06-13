/**
 * Integration test for GET /v1/me/next-tickets — the MCTS-prioritized work
 * queue, the headline endpoint of the Orcha REST API.
 *
 * It executes the same `myNextTickets` query the first-party app does, with the
 * token's Role context. The defining assertion is differential: for the same
 * Role and the same data, the REST surface returns exactly what the session
 * (GraphQL) path returns, in the same scheduler order — so the public contract
 * can never silently drift from the engine that produces it.
 *
 * "Next" data is seeded with seedNextTicket, which mirrors what the scheduler
 * writes: a SCHEDULED ticket plus one latest-epoch Estimate assigned to the
 * Role. The queue is ordered by each estimate's `start`.
 */

import request from "supertest";
import expect from "expect";
import { createExpressApp } from "../../app";
import {
  getTestApiToken,
  seedNextTicket,
  graphqlRequest,
} from "../../utils/testing";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

// The session-path query selecting the same fields the REST endpoint exposes.
// Running it through graphqlRequest reproduces exactly what the first-party app
// would receive, which the differential test asserts the REST output matches.
const SESSION_NEXT_TICKETS = /* GraphQL */ `
  query SessionNextTickets {
    myNextTickets {
      ticket {
        id
        title
        status
        stage
        estimate
        eta
        projectId
      }
      nextState {
        id
        name
        position
      }
    }
  }
`;

describe("GET /v1/me/next-tickets", () => {
  it("returns the role's next tickets in scheduler (start) order", async () => {
    const token = await getTestApiToken();
    // Seeded out of order; the queue must come back ranked by `start`.
    const later = await seedNextTicket(token.organization, token.role, {
      start: 100,
    });
    const sooner = await seedNextTicket(token.organization, token.role, {
      start: 0,
    });

    const res = await request(app())
      .get("/v1/me/next-tickets")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((n: any) => n.ticket.id)).toEqual([
      sooner.ticket.id,
      later.ticket.id,
    ]);
    expect(res.body.data[0].nextState).toHaveProperty("id");
  });

  it("returns the same ordered result the session myNextTickets query produces", async () => {
    const token = await getTestApiToken();
    await seedNextTicket(token.organization, token.role, { start: 0 });
    await seedNextTicket(token.organization, token.role, { start: 50 });
    await seedNextTicket(token.organization, token.role, { start: 100 });

    const restRes = await request(app())
      .get("/v1/me/next-tickets")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    const sessionRes = await graphqlRequest({
      source: SESSION_NEXT_TICKETS,
      session: {
        userId: token.user.id,
        roleId: token.role.id,
        organizationId: token.organization.id,
        roleType: token.role.type,
      },
    });

    expect(sessionRes.errors).toBeUndefined();
    expect(restRes.body.data).toEqual((sessionRes.data as any).myNextTickets);
  });

  it("isolates tenants: a token sees only its own organization's next tickets", async () => {
    const tokenA = await getTestApiToken();
    const tokenB = await getTestApiToken();
    const onlyA = await seedNextTicket(tokenA.organization, tokenA.role, {});
    await seedNextTicket(tokenB.organization, tokenB.role, {});

    const res = await request(app())
      .get("/v1/me/next-tickets")
      .set("Authorization", auth(tokenB.plaintext))
      .expect(200);

    const ids = res.body.data.map((n: any) => n.ticket.id);
    expect(ids).not.toContain(onlyA.ticket.id);
  });

  it("is allowed for a read-only token (it is a read)", async () => {
    const token = await getTestApiToken({ readOnly: true });
    await seedNextTicket(token.organization, token.role, {});

    await request(app())
      .get("/v1/me/next-tickets")
      .set("Authorization", auth(token.plaintext))
      .expect(200);
  });

  it("returns 401 with the error envelope when no token is presented", async () => {
    const res = await request(app()).get("/v1/me/next-tickets").expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("documents GET /v1/me/next-tickets in the OpenAPI spec", async () => {
    const res = await request(app()).get("/v1/openapi.json").expect(200);
    expect(res.body.paths["/v1/me/next-tickets"].get).toBeDefined();
  });
});
