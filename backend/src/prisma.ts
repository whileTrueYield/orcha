/**
 * Prisma client singleton.
 *
 * Provides a configured PrismaClient instance used throughout the application.
 * Query logging is enabled in non-test environments via the `log` option
 * (Prisma 6 replaced the `$use` middleware API with `$extends`).
 *
 * Exports: default PrismaClient instance.
 */

import { PrismaClient } from "@prisma/client";

// TODO: For more granular query timing, consider using Prisma's $extends
// client extension API to add custom logging middleware.
const prisma = new PrismaClient({
  errorFormat: "pretty",
  log:
    process.env.NODE_ENV !== "test"
      ? [{ emit: "stdout", level: "query" }]
      : [],
});

export default prisma;
