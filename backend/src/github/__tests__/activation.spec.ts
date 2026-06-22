import expect from "expect";
import { randomUUID } from "crypto";
import prisma from "../../prisma";
import {
  createRandomOrganization,
  createRandomRepositoryLink,
} from "../../utils/testing";
import { activateRepositoryLink } from "../activation";

describe("activateRepositoryLink", () => {
  it("promotes a pending link to active and stamps the repo", async () => {
    const org = await createRandomOrganization();
    const { link } = await createRandomRepositoryLink(org);
    const repo = `octo/${randomUUID()}`;

    const result = await activateRepositoryLink(prisma, link, repo);

    expect(result.outcome).toBe("activated");
    const reloaded = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: link.id },
    });
    expect(reloaded.status).toBe("ACTIVE");
    expect(reloaded.repoFullName).toBe(repo);
    expect(reloaded.activatedAt).not.toBeNull();
  });

  it("is idempotent for an already-active link", async () => {
    const org = await createRandomOrganization();
    const { link } = await createRandomRepositoryLink(org);
    const repo = `octo/${randomUUID()}`;
    await activateRepositoryLink(prisma, link, repo);
    const active = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: link.id },
    });

    const second = await activateRepositoryLink(prisma, active, repo);

    expect(second.outcome).toBe("already_active");
  });

  it("refuses to activate when another active link already holds the repo", async () => {
    const owner = await createRandomOrganization();
    const squatter = await createRandomOrganization();
    const repo = `famous/${randomUUID()}`;

    const { link: ownerLink } = await createRandomRepositoryLink(owner);
    await activateRepositoryLink(prisma, ownerLink, repo);

    const { link: squatterLink } = await createRandomRepositoryLink(squatter);
    const result = await activateRepositoryLink(prisma, squatterLink, repo);

    expect(result.outcome).toBe("repo_taken");
    const reloaded = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: squatterLink.id },
    });
    expect(reloaded.status).toBe("PENDING");
    expect(reloaded.repoFullName).toBeNull();
  });
});
