/**
 * Integration tests for the project body endpoints (#40).
 *
 * The write path (merge, mentions, indexableContent, archived-reject) is the
 * same service the ticket body endpoints use and is proven there; these tests
 * confirm the generic body surface is wired for the `project` type — read with
 * an ETag, a matching write, a conflict, and tenant scoping.
 */

import request from "supertest";
import expect from "expect";
import { ModelStage } from "@prisma/client";
import { createExpressApp } from "../../app";
import {
  getTestApiToken,
  createRandomProject,
} from "../../utils/testing";
import { saveBody, getBody } from "../../markdown/bodyRepository";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

describe("GET /v1/projects/:id/body", () => {
  it("returns the project body Markdown with the version as its ETag", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);
    await saveBody("project", project.id, "# Plan\n", 0);

    const res = await request(app())
      .get(`/v1/projects/${project.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.markdown).toBe("# Plan\n");
    expect(res.headers.etag).toBe('"1"');
  });

  it("returns 404 for a project body in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const project = await createRandomProject(other.organization);

    const res = await request(app())
      .get(`/v1/projects/${project.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("PUT /v1/projects/:id/body", () => {
  it("persists a matching write and 409s an overlapping stale write", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);
    const url = `/v1/projects/${project.id}/body`;
    const send = (ifMatch: string, markdown: string) =>
      request(app())
        .put(url)
        .set("Authorization", auth(token.plaintext))
        .set("If-Match", ifMatch)
        .send({ markdown });

    const ok = await send('"0"', "shared\n").expect(200);
    expect(ok.headers.etag).toBe('"1"');

    await send('"1"', "theirs\n").expect(200); // v2
    const conflict = await send('"1"', "ours\n").expect(409); // overlap on the only line
    expect(conflict.headers.etag).toBe('"2"');
    expect(conflict.body.markdown).toContain("<<<<<<<");
  });

  it("rejects a write to an archived project with 403", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization, {
      stage: ModelStage.ARCHIVED,
    });

    await request(app())
      .put(`/v1/projects/${project.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "nope" })
      .expect(403);

    expect(await getBody("project", project.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });
});
