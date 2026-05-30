/**
 * Application entry point — boots Express + Apollo Server v4.
 *
 * Wires together:
 *  - Express app with CORS, session, and REST routes
 *  - Apollo Server v4 via `expressMiddleware`
 *  - Context factory that hydrates `me` from the session (replacing
 *    the old MeContextMiddleware class)
 *  - BullMQ cron jobs
 *
 * The GraphQL schema is built by Pothos (see schema/index.ts).
 */

// TODO: remove after DO deployment is verified
process.stderr.write("[api] process started\n");

process.on("uncaughtException", (err) => {
  console.error("[uncaught]", err);
  process.exit(1);
});

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import session from "express-session";
import { redis } from "./redis";
import { AppContext, AuthContext } from "./types";
import { config } from "./config";
import cors from "cors";
import prisma from "./prisma";
import { createExpressApp } from "./app";
import { logger } from "./logger";
import { find } from "lodash";
import { RoleType } from "@prisma/client";
import { initCron } from "./cron/queues";
import { json as jsonBodyParser } from "express";
import { corsCheckOrigin } from "./utils";
import RedisStore from "connect-redis";
import { getSchema } from "./models";
import { formatApolloError } from "./utils/graphqlErrors";

// TODO: remove after DO deployment is verified
process.stderr.write("[api] imports done, calling start()\n");

async function start() {
  process.stderr.write("[api] building schema...\n");
  const schema = await getSchema();

  // Apollo Server v4 — standalone server that produces middleware
  const server = new ApolloServer<AppContext<AuthContext>>({
    schema,
    // Map Prisma "record not found" (P2025) failures to the clean
    // "No {Model} found" message instead of leaking the raw query invocation.
    formatError: formatApolloError,
    // TODO: Apollo v4 dropped the built-in "bounded" cache option.
    // Consider adding @apollo/server-plugin-response-cache if needed.
  });

  process.stderr.write("[api] schema built, starting apollo...\n");
  await server.start();
  process.stderr.write("[api] apollo started, mounting middleware...\n");

  // Initialize Redis-backed session store
  const redisStore = new RedisStore({ client: redis });

  const sessionParser = session({
    store: redisStore,
    name: "sessionId",
    proxy: config.isProd,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 24 * 5 * 365,
      sameSite: config.isProd ? "none" : "lax",
    },
  });

  const corsOptions = {
    credentials: true,
    origin: corsCheckOrigin(config.allowOrigin),
  };

  const app = createExpressApp([
    cors(corsOptions),
    sessionParser,
    jsonBodyParser(),
  ]);

  // Mount Apollo v4 as Express middleware.
  // The context factory replaces the old MeContextMiddleware — it reads
  // the session and builds the `me` object before any resolver runs.
  app.use(
    `${config.apiPathPrefix}/graphql`,
    cors<cors.CorsRequest>(corsOptions),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const orgIdStr = req.headers.organization as string;

        if (orgIdStr) {
          const role = find(req.session.roles, {
            organizationId: parseInt(orgIdStr),
          });

          if (role) {
            req.session.roleType = role.type as RoleType;
            req.session.roleId = role.id;
            req.session.organizationId = role.organizationId;
          }
        }

        const { buildMeContext } = await import(
          "./middlewares/isAuthenticated"
        );
        const me = buildMeContext(req);

        return { req, res, prisma, me } as AppContext<AuthContext>;
      },
    }),
  );

  app.listen({ port: config.port }, () => {
    process.stderr.write(`[api] listening on port ${config.port}\n`);
    logger.info(
      `Server ready at http://${config.hostname}:${config.port}/graphql`,
    );
  });

  await initCron();

  return app;
}

// TODO: remove catch wrapper after DO deployment is verified
start().catch((err) => {
  console.error("[startup] fatal:", err);
  process.exit(1);
});
