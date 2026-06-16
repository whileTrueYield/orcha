/**
 * Prisma client singleton.
 *
 * Provides a configured PrismaClient instance used throughout the application.
 * In non-test environments it logs queries, warnings, AND errors via the `log`
 * option (Prisma 6 replaced the `$use` middleware API with `$extends`). The
 * `error`/`warn` levels matter: without them a rejected query surfaces only as
 * whatever the caller turns it into (e.g. a generic 500) with nothing in the
 * logs to say why — a silent failure. Errors must never be swallowed.
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
      ? [
          { emit: "stdout", level: "query" },
          { emit: "stdout", level: "warn" },
          { emit: "stdout", level: "error" },
        ]
      : [],
});

export default prisma;
