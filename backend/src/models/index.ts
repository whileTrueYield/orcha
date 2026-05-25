/**
 * Models entry point — re-exports getSchema from the schema module.
 *
 * This file exists solely to preserve the import path used by server.ts
 * (`import { getSchema } from "./models"`). All type/resolver registrations
 * now happen inside `../schema/index.ts`.
 */

export { getSchema } from "../schema";
