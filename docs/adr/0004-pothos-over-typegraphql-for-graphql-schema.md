# Pothos over TypeGraphQL for GraphQL schema

The backend uses typegraphql-prisma to generate GraphQL model types from the
Prisma schema, with ~152 hand-written resolver classes using TypeGraphQL
decorators. TypeGraphQL relies on experimental TypeScript decorators and
reflect-metadata, and the typegraphql-prisma generator is effectively
unmaintained — pinned to Prisma 5, with no path to Prisma 6.

We chose Pothos with @pothos/plugin-prisma as the replacement schema framework.

## Why now

The trigger is upgrading Prisma 5 → 6 and Apollo Server 3 → 4. Both are
end-of-life. typegraphql-prisma blocks the Prisma upgrade entirely. Doing all
three in one pass means one round of testing instead of three.

## What Pothos gives us

- **Builder pattern instead of decorators.** No reflect-metadata, no
  experimental decorator flag, no class-based types. Schema is built
  programmatically with full type inference.
- **Prisma plugin.** `builder.prismaObject()` replaces the typegraphql-prisma
  generator — same "Prisma schema as source of truth" model, but with opt-in
  field exposure (fields are hidden unless explicitly listed, rather than
  hidden via `@TypeGraphQL.omit` comments).
- **Scope-auth plugin.** Replaces TypeGraphQL's `@UseMiddleware(hasRole())`
  with declarative `authScopes` on each field. Same pattern, less ceremony.
- **Native type safety.** Resolver argument types, return types, and context
  types are inferred by the builder. Eliminates the need for backend
  graphql-codegen (264KB of generated resolver types).

## Key decisions within this choice

- **Big-bang migration.** All 152 resolvers converted in one pass. No schema
  stitching or parallel runtime. Justified because typegraphql-prisma only
  generates models and enums (no auto-resolvers) — the conversion is
  mechanical, not a redesign.
- **Keep `src/models/` folder structure.** Each model folder retains its
  resolvers and entity definitions. Only the internals change: classes become
  builder calls, `entity.ts` defines `prismaObject` + custom types.
- **Central `enums.ts`.** All Prisma enums registered in one file, replacing
  the generated enum output. Avoids double-registration across model folders.
- **Pagination stays offset-based.** No switch to Relay connections. A factory
  function replaces the `PaginatedNodes` class inheritance pattern.
- **Context hydration moves to Apollo context factory.** The
  `MeContextMiddleware` (TypeGraphQL global middleware) was always doing
  request-level work — it belongs in the context factory, not the schema layer.
- **Drop backend graphql-codegen.** Pothos builder provides the same type
  safety natively. Frontend codegen (introspection → Apollo Client types)
  stays.
- **Frontend verification via type diff.** After migration, regenerate
  `frontend/src/types/graphql.ts` and diff against the pre-migration version.
  Any unintended schema change surfaces as a type diff.

## Considered alternatives

- **Stay on TypeGraphQL, fork typegraphql-prisma.** Fixes the Prisma 6 blocker
  but doesn't address the decorator/reflect-metadata tax. Maintaining a fork
  of an unmaintained generator adds long-term burden for a solo dev.
- **Nexus.** Similar builder pattern to Pothos, but Nexus is itself
  unmaintained (last release 2022). Pothos is actively maintained with a
  healthy plugin ecosystem.
- **GraphQL Yoga + graphql-tools.** Schema-first approach. Would require
  maintaining a separate `.graphql` SDL file alongside the Prisma schema —
  two sources of truth instead of one.
- **Incremental migration with schema stitching.** Rejected because it adds
  wiring complexity for a migration that doesn't need partial shipping.
  The resolver conversion is mechanical enough to do in one pass.
