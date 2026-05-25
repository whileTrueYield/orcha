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

async function start() {
  const schema = await getSchema();

  // Apollo Server v4 — standalone server that produces middleware
  const server = new ApolloServer<AppContext<AuthContext>>({
    schema,
    // TODO: Apollo v4 dropped the built-in "bounded" cache option.
    // Consider adding @apollo/server-plugin-response-cache if needed.
  });

  await server.start();

  // Initialize Redis-backed session store
  const redisStore = new RedisStore({ client: redis });

  // The session parser relies on Redis for storage. This only
  // takes care of the storage and encryption.
  // The session definition can be found as a combined type AuthContext —
  // it can be:
  //   - GuestUserContext  (not authenticated)
  //   - AuthRoleContext   (authenticated and using an organization)
  //   - AuthUserContext   (authenticated but not within an organization)
  const sessionParser = session({
    store: redisStore,
    name: "sessionId",
    proxy: config.isProd, // only prod mode is behind nginx
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 24 * 5 * 365, // 5 years
      sameSite: config.isProd ? "none" : "lax",
    },
  });

  // Build the Express app with global middleware (CORS, session, body parser)
  const corsOptions = {
    credentials: true,
    origin: corsCheckOrigin(config.allowOrigin),
  };

  const app = createExpressApp([
    cors(corsOptions),
    sessionParser,
    jsonBodyParser(),
  ]);

  // Mount Apollo v4 as Express middleware at /graphql.
  // The context factory replaces the old MeContextMiddleware — it reads
  // the session and builds the `me` object before any resolver runs.
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const orgIdStr = req.headers.organization as string;

        // A user may hold multiple roles (one per organization).
        // We read the organization header and select the matching role
        // for the current request.
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

        // Build the `me` context from the session — this is the logic
        // that used to live in MeContextMiddleware.
        const { buildMeContext } = await import(
          "./middlewares/isAuthenticated"
        );
        const me = buildMeContext(req);

        return { req, res, prisma, me } as AppContext<AuthContext>;
      },
    }),
  );

  // Launch the Express server
  app.listen({ port: config.port }, () => {
    logger.info(
      `Server ready at http://${config.hostname}:${config.port}/graphql`,
    );
  });

  // Start BullMQ cron jobs (reminders, auto-stop, scheduled emails, etc.)
  await initCron();

  return app;
}

start();
