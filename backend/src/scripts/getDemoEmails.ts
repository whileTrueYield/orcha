/**
 * Return a list of emails used to create demo account
 * this is useful to marketing for follow up emails
 */

import { format } from "date-fns";
import prisma from "../prisma";

async function run() {
  const requests = await prisma.demoRequest.findMany({
    orderBy: { createdAt: "asc" },
  });

  console.table(
    requests.map((req) => ({
      email: req.email,
      status: req.status,
      createdAt: format(new Date(req.createdAt), "EEE PP p"),
      ip: req.ip_address,
    }))
  );
}

run();
