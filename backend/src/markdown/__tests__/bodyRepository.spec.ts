/**
 * Integration tests for the Markdown body repository (PRD #36, issue #39).
 *
 * `getBody`/`saveBody` are the single read/write interface every layer uses for
 * ticket, project, and documentation bodies. They own optimistic concurrency and
 * delegate reconciliation to the 3-way merge module. These tests drive the
 * repository purely through that public interface against the real test
 * database, so they describe the storage contract — not how the rows are laid
 * out — and survive a schema refactor.
 *
 * `merge` (and therefore node-diff3) is reached only through this `src` module,
 * never imported into the spec directly, per the ESM-in-specs rule.
 */

import expect from "expect";
import { RoleType } from "@prisma/client";

import { getBody, saveBody } from "../bodyRepository";
import prisma from "../../prisma";
import {
  createRandomOrgAndUser,
  createRandomDocumentation,
  createRandomProject,
  createRandomTicket,
} from "../../utils/testing";

describe("body repository", () => {
  it("reports an empty body at version 0 before anything is saved", async () => {
    const { organization, role } = await createRandomOrgAndUser(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(organization, role);

    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });

  it("creates the body on a save from the empty base and reads it back", async () => {
    const { organization, role } = await createRandomOrgAndUser(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(organization, role);

    const result = await saveBody("ticket", ticket.id, "# Hello\n", 0);

    expect(result).toEqual({ ok: true, body: { markdown: "# Hello\n", version: 1 } });
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "# Hello\n",
      version: 1,
    });
  });

  it("bumps the version on each matching-base save", async () => {
    const { organization, role } = await createRandomOrgAndUser(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(organization, role);

    const first = await saveBody("ticket", ticket.id, "one\n", 0);
    expect(first).toEqual({ ok: true, body: { markdown: "one\n", version: 1 } });

    const second = await saveBody("ticket", ticket.id, "two\n", 1);
    expect(second).toEqual({ ok: true, body: { markdown: "two\n", version: 2 } });

    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "two\n",
      version: 2,
    });
  });

  it("auto-merges a stale save whose edits do not overlap", async () => {
    const { organization, role } = await createRandomOrgAndUser(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(organization, role);

    // Establish v1 — the common base both writers started from.
    await saveBody("ticket", ticket.id, "line1\nline2\nline3\n", 0);

    // Writer B saves first against v1, editing the last line -> v2.
    const b = await saveBody("ticket", ticket.id, "line1\nline2\nLINE3-B\n", 1);
    expect(b).toEqual({
      ok: true,
      body: { markdown: "line1\nline2\nLINE3-B\n", version: 2 },
    });

    // Writer A is now stale (still on v1) and edits a different line. The save
    // recovers base@1 and 3-way merges against B's v2 — no overlap, so clean.
    const a = await saveBody("ticket", ticket.id, "LINE1-A\nline2\nline3\n", 1);
    expect(a).toEqual({
      ok: true,
      body: { markdown: "LINE1-A\nline2\nLINE3-B\n", version: 3 },
    });

    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "LINE1-A\nline2\nLINE3-B\n",
      version: 3,
    });
  });

  it("returns a conflict and writes nothing when stale edits overlap", async () => {
    const { organization, role } = await createRandomOrgAndUser(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(organization, role);

    await saveBody("ticket", ticket.id, "shared line\n", 0); // v1, the base
    await saveBody("ticket", ticket.id, "B edited\n", 1); // v2

    // Writer A is stale on v1 and edits the very same line B changed.
    const a = await saveBody("ticket", ticket.id, "A edited\n", 1);

    expect(a.ok).toBe(false);
    if (a.ok) throw new Error("expected a conflict");
    expect(a.conflicts).toEqual([
      { base: ["shared line"], ours: ["A edited"], theirs: ["B edited"] },
    ]);
    // The conflict also carries the git-markered body and the current stored
    // version the writer must rebase onto.
    expect(a.version).toBe(2);
    expect(a.markered).toBe(
      "<<<<<<< ours\nA edited\n=======\nB edited\n>>>>>>> theirs\n",
    );

    // The conflicting save must not have touched the stored body or version.
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "B edited\n",
      version: 2,
    });
  });

  it("stores and reads project bodies through the same interface", async () => {
    const { organization } = await createRandomOrgAndUser(RoleType.MEMBER);
    const project = await createRandomProject(organization);

    const saved = await saveBody("project", project.id, "project body\n", 0);
    expect(saved).toEqual({
      ok: true,
      body: { markdown: "project body\n", version: 1 },
    });
    expect(await getBody("project", project.id)).toEqual({
      markdown: "project body\n",
      version: 1,
    });
  });

  it("stores and reads documentation bodies through the same interface", async () => {
    const { organization } = await createRandomOrgAndUser(RoleType.MEMBER);
    const documentation = await createRandomDocumentation(organization);
    const page = await prisma.documentationPage.create({
      data: {
        title: "Page",
        body: "",
        organizationId: organization.id,
        documentationId: documentation.id,
      },
    });

    const saved = await saveBody("documentation", page.id, "doc body\n", 0);
    expect(saved).toEqual({
      ok: true,
      body: { markdown: "doc body\n", version: 1 },
    });
    expect(await getBody("documentation", page.id)).toEqual({
      markdown: "doc body\n",
      version: 1,
    });
  });

  it("crashes when the base version is ahead of what is stored", async () => {
    const { organization, role } = await createRandomOrgAndUser(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(organization, role);

    // Nothing saved yet (version 0); a writer claiming base 3 read a body that
    // never existed — corrupt state, not a conflict.
    await expect(saveBody("ticket", ticket.id, "x\n", 3)).rejects.toThrow(
      /ahead of stored version/,
    );
  });
});
