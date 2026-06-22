/**
 * Export the Pothos GraphQL schema as SDL to stdout.
 *
 * Usage:
 *   cd backend && ts-node scripts/export-schema.ts > schema.graphql
 *
 * Stubs runtime deps so the schema builds without env vars or a database.
 */

const Module = require("module");

const deepProxy: any = new Proxy(() => deepProxy, {
  get: (_, prop) => {
    if (prop === "__esModule") return true;
    if (prop === "default") return deepProxy;
    if (prop === "then") return undefined; // prevent Promise-like behavior
    return deepProxy;
  },
  apply: () => deepProxy,
});

const stubbedFiles = [
  "/src/prisma",
  "/src/config",
  "/src/redis",
  "/src/logger",
  "/src/emails/",
  "/src/cron/",
  "/src/notifications/",
  // crypto parses ORCHA_ENCRYPTION_KEY at module load (crash-early-on-bad-key);
  // stub it like config so the schema builds without env, the same way the rest
  // of the runtime layer is stubbed here.
  "/src/utils/crypto",
];

const originalLoad = Module._load;
Module._load = function (request: string, parent: any, isMain: boolean) {
  // Resolve the actual file path to check against stubs
  try {
    const resolved = Module._resolveFilename(request, parent, isMain);
    if (stubbedFiles.some((s) => resolved.includes(s))) {
      return { ...deepProxy, config: deepProxy, default: deepProxy };
    }
  } catch {
    // If resolution fails, let it fall through to the original loader
  }
  return originalLoad.call(this, request, parent, isMain);
};

import { printSchema } from "graphql";
import { getSchema } from "../src/schema";

const schema = getSchema();
process.stdout.write(printSchema(schema) + "\n");
