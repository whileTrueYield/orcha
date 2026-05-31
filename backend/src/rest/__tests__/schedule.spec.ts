/**
 * Integration test for GET /v1/schedule — the caller's own outstanding
 * scheduled work and the ETA of each item's ticket.
 *
 * It maps to myUnfinishedScheduleItems, which is scoped to the caller's role
 * (not an org-wide admin view), so it works for any role including a read-only
 * token. "Unfinished" means a stopped, not-done item on a workflow state
 * assigned to the caller — the fixture builds exactly that.
 */

import request from "supertest";
import expect from "expect";
import { createExpressApp } from "../../app";
import {
  getTestApiToken,
  createRandomTicket,
  createScheduleItem,
} from "../../utils/testing";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

describe("GET /v1/schedule", () => {
  it("returns the caller's unfinished scheduled work with ticket ETAs", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(
      token.organization,
      token.role,
    );
    // An unfinished item: stopped at some point, not done.
    await createScheduleItem(token.role, ticket, {
      stoppedAt: new Date(),
      done: false,
    });

    const res = await request(app())
      .get("/v1/schedule")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].ticket.id).toBe(ticket.id);
    expect(res.body.data[0].ticket).toHaveProperty("eta");
  });

  it("returns an empty list when the caller has no unfinished work", async () => {
    const token = await getTestApiToken();

    const res = await request(app())
      .get("/v1/schedule")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.data).toEqual([]);
  });
});
