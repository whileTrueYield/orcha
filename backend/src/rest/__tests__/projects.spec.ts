/**
 * Integration tests for the project read endpoints — list (searchable,
 * cursor-paginated) and detail, both tenant-scoped, with 404 on cross-org.
 */

import request from "supertest";
import expect from "expect";
import { createExpressApp } from "../../app";
import { getTestApiToken, createRandomProject } from "../../utils/testing";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

describe("GET /v1/projects", () => {
  it("returns only the caller's organization's projects", async () => {
    const token = await getTestApiToken();
    await createRandomProject(token.organization);
    await createRandomProject(token.organization);

    const other = await getTestApiToken();
    await createRandomProject(other.organization);

    const res = await request(app())
      .get("/v1/projects")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.pageInfo.totalCount).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  it("matches a project by text search", async () => {
    const token = await getTestApiToken();
    await createRandomProject(token.organization, {
      name: "ZZ-FINDABLE-PROJECT",
    });
    await createRandomProject(token.organization);

    const res = await request(app())
      .get("/v1/projects?search=FINDABLE")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe("ZZ-FINDABLE-PROJECT");
  });
});

describe("GET /v1/projects/:id", () => {
  it("returns a project's detail", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization, {
      name: "Detail Project",
    });

    const res = await request(app())
      .get(`/v1/projects/${project.id}`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.id).toBe(project.id);
    expect(res.body.name).toBe("Detail Project");
    expect(Array.isArray(res.body.children)).toBe(true);
  });

  it("returns 404 for a project in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const project = await createRandomProject(other.organization);

    const res = await request(app())
      .get(`/v1/projects/${project.id}`)
      .set("Authorization", auth(token.plaintext))
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
