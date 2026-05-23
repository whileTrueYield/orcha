import { Request, Response } from "express";
import prisma from "../../prisma";
import { getWorkEmailForRole } from "./jobs/getWorkEmailForRole";

/**
 * Test an email endpoint and return the html email
 *
 * available only during dev at
 * - http://localhost:4000/__tests/email?type=html
 * - http://localhost:4000/__tests/email?type=text
 */
export async function testEmail(req: Request, res: Response) {
  const roleId = req.session?.roleId;
  const organizationId = req.session?.organizationId;

  const emailFormat: "html" | "text" =
    req.query.type === "text" ? "text" : "html";

  if (!roleId || !organizationId) {
    res.status(400);
    res.send({ status: "failure" });
    res.end();
    return;
  }

  const role = await prisma.role.findFirstOrThrow({
    where: { id: roleId },
    include: { organization: true, user: true },
  });

  const { html, text } = await getWorkEmailForRole(role);

  res.status(200);
  if (emailFormat === "text") {
    res.set("content-type", "text/plain");
    res.send(text);
  } else {
    res.set("content-type", "text/html");
    res.send(html);
  }
  res.end();
}
