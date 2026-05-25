/**
 * Export the Pothos GraphQL schema as SDL to stdout.
 *
 * Usage:
 *   cd backend && ts-node scripts/export-schema.ts > /tmp/pothos-schema.graphql
 *
 * This script imports the assembled schema from the Pothos builder and prints
 * it as a human-readable SDL string. Useful for schema diffing, code review,
 * and CI verification.
 */

import { printSchema } from "graphql";
import { getSchema } from "../src/schema";

const schema = getSchema();
process.stdout.write(printSchema(schema) + "\n");
