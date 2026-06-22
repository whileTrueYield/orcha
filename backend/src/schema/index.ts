/**
 * Schema entry point — assembles the Pothos GraphQL schema.
 *
 * Responsibilities:
 *  1. Import the builder (which configures all plugins)
 *  2. Import enum registrations (side-effect: registers every Prisma enum)
 *  3. Register the root queryType and mutationType on the builder
 *  4. Import every model's entity and resolver modules (side-effect registrations)
 *  5. Export `getSchema()` which calls `builder.toSchema()`
 *
 * IMPORTANT: queryType and mutationType must be registered BEFORE any
 * queryField / mutationField calls. That is why they appear here, before
 * the model side-effect imports.
 *
 * Exports: getSchema.
 */

import { GraphQLSchema } from "graphql";
import builder from "./builder";

// Side-effect import: registers all Prisma enums on the builder
import "./enums";

// Side-effect import: registers pagination types on the builder
import "./pagination";

// ---------------------------------------------------------------------------
// Root types — must precede any queryField / mutationField calls
// ---------------------------------------------------------------------------

builder.queryType({
  fields: (t) => ({
    version: t.string({
      resolve: () => "0.0.1",
    }),
  }),
});

builder.mutationType({});

// ---------------------------------------------------------------------------
// Side-effect imports: each model registers its types and resolvers on the
// builder. Entity files define prismaObject types; resolver barrel files
// register queryField / mutationField calls.
//
// Models whose resolvers/index.ts already imports their own entity are listed
// with just the resolver import. All others import entity first.
// ---------------------------------------------------------------------------

// apiToken
import "../models/apiToken/entity";
import "../models/apiToken/resolvers";

// oauthGrant — connected clients (a grant is a familyId; see mcp/oauth/grants)
import "../models/oauthGrant/entity";
import "../models/oauthGrant/resolvers";

// auth — resolvers/index.ts imports ../entity internally
import "../models/auth/resolvers";

// blackoutTime
import "../models/blackoutTime/entity";
import "../models/blackoutTime/resolvers";

// comment
import "../models/comment/entity";
import "../models/comment/resolvers";

// demo — resolvers/index.ts imports ../entity internally
import "../models/demo/resolvers";

// documentBody — shared body type + saveDocumentBody mutation (#40)
import "../models/documentBody/entity";
import "../models/documentBody/resolvers";

// documentation
import "../models/documentation/entity";
import "../models/documentation/resolvers";

// drawing — no entity.ts, resolver barrel imports its own prismaObject
import "../models/drawing/resolvers";

// feature
import "../models/feature/entity";
import "../models/feature/resolvers";

// featureFlag — resolvers/index.ts imports ../entity internally
import "../models/featureFlag/resolvers";

// github
import "../models/github/entity";
import "../models/github/resolvers";

// issue
import "../models/issue/entity";
import "../models/issue/resolvers";

// note
import "../models/note/entity";
import "../models/note/resolvers";

// notification
import "../models/notification/entity";
import "../models/notification/resolvers";

// organization
import "../models/organization/entity";
import "../models/organization/resolvers";

// product
import "../models/product/entity";
import "../models/product/resolvers";

// project
import "../models/project/entity";
import "../models/project/resolvers";

// report
import "../models/report/entity";
import "../models/report/resolvers";

// role
import "../models/role/entity";
import "../models/role/resolvers";

// schedule
import "../models/schedule/entity";
import "../models/schedule/resolvers";

// search — resolvers/index.ts imports ../entity internally
import "../models/search/resolvers";

// skill — resolvers/index.ts imports ../entity internally
import "../models/skill/resolvers";

// tag
import "../models/tag/entity";
import "../models/tag/resolvers";

// team
import "../models/team/entity";
import "../models/team/resolvers";

// ticket
import "../models/ticket/entity";
import "../models/ticket/resolvers";

// todo
import "../models/todo/entity";
import "../models/todo/resolvers";

// user
import "../models/user/entity";
import "../models/user/resolvers";

// workflow
import "../models/workflow/entity";
import "../models/workflow/resolvers";

// ---------------------------------------------------------------------------
// Schema export
// ---------------------------------------------------------------------------

export function getSchema(): GraphQLSchema {
  return builder.toSchema();
}
