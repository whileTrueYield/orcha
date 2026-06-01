/**
 * Integration test for the documentation publish pipeline (PRD #36, issue #44).
 *
 * Drives the real `publishDocumentationTask` against the test database and the
 * dev filesystem sink (in dev/test it writes the static site under `out/`
 * instead of S3). It proves the end-to-end Markdown path: a page's stored
 * Markdown body becomes published HTML with slug heading ids, the page TOC, and
 * a populated client-side search index — none of which depended on Markdown
 * before #44 (the old path read Tiptap-JSON from a since-removed `bytes` column).
 *
 * The heavy I/O (S3, CloudFront) is skipped in dev mode by the task itself, so
 * this reads the `out/` artifacts the task writes locally.
 */
import expect from "expect";
import { promises as fs } from "fs";
import path from "path";
import prisma from "../../../prisma";
import { saveBody } from "../../../markdown/bodyRepository";
import { publishDocumentationTask } from "../jobs/publishDocumentationTask";
import {
  createRandomOrgAndUser,
  createRandomDocumentation,
} from "../../../utils/testing";

describe("publishDocumentationTask", () => {
  it("publishes a Markdown page to HTML, a TOC, and a search index", async () => {
    const { organization } = await createRandomOrgAndUser();
    const documentation = await createRandomDocumentation(organization);
    const page = await prisma.documentationPage.create({
      data: {
        title: "Welcome",
        organizationId: organization.id,
        documentationId: documentation.id,
        body: "",
      },
      select: { id: true },
    });
    await saveBody(
      "documentation",
      page.id,
      "# Welcome\n\nIntro prose.\n\n## Details\n\nMore with :mention[Alice]{type=\"user\" id=\"1\"}.\n",
      0,
    );

    await publishDocumentationTask(documentation.id);

    const base = path.join(process.cwd(), "out", "doc", String(documentation.id));
    const html = await fs.readFile(path.join(base, "index.html"), "utf8");

    // HTML rendered from Markdown, with slug heading ids the TOC links target.
    expect(html).toMatch(/id="welcome"/);
    expect(html).toMatch(/id="details"/);
    // A directive renders as its label text, never the raw source.
    expect(html).toContain("Alice");
    expect(html).not.toContain(":mention");
    // The page TOC links to the heading anchors.
    expect(html).toContain("#details");

    // The client-side search index is built from the Markdown content.
    const searchJs = await fs.readFile(path.join(base, "search.js"), "utf8");
    expect(searchJs).toContain("Welcome");

    await fs.rm(base, { recursive: true, force: true });
  });
});
