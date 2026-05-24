require("reflect-metadata");

import { ApolloServer } from "apollo-server-express";
import { getSchema } from "./models";
import session from "express-session";
import { redis } from "./redis";
import { AppContext, AuthContext } from "./types";
import { config } from "./config";
import cors from "cors";
import prisma from "./prisma";
import { createExpressApp } from "./app";
import { logger } from "./logger";
import { find } from "lodash";
import { RoleType } from "@generated/type-graphql";
import { initCron } from "./cron/queues";
import { json as jsonBodyParser } from "express";
import { corsCheckOrigin } from "./utils";
import RedisStore from "connect-redis";

async function start() {
  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  //
  // Apollo <--> TypeGrapqhl <--> Prisma
  //
  // TypeGrapqhl is handling permission and "endpoints" for apollo, while
  // Prisma is our ORM, handling relations, retrieval and other CRUD operations.
  //
  // You'll also notice that the context is modified to include the prisma
  // instance to every typegraphql handler
  const server = new ApolloServer({
    // bounded cache to protect against DOS attacks
    // see https://www.apollographql.com/docs/apollo-server/v3/performance/cache-backends#ensuring-a-bounded-cache
    cache: "bounded",
    schema: await getSchema(),
    context: ({ req, res }: AppContext<AuthContext>) => {
      const orgIdStr = req.headers.organization as string;

      // you may have more than one role (working for more than one organization)
      // so we read the orgIdStr from your request header and find which role
      // should we use for the request at hand
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

      return { req, res, prisma };
    },
  });

  // Initialize store.
  let redisStore = new RedisStore({
    client: redis,
  });

  // The session parser relies on redis for storage. This only
  // takes care of the storage and encryption.
  // The session definition can be find as a combined type AuthContext
  // it can be: (you should check their definition in the types.ts file)
  // - GuestUserContext (not authenticated)
  // - AuthRoleContext (authenticated and using an organization)
  // - AuthUserContext (authenticated but not within an organization)
  const sessionParser = session({
    store: redisStore,
    name: "sessionId",
    proxy: config.isProd, // only prod mode is behind nginx
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.isProd, // we only have SSL on prod and staging
      maxAge: 1000 * 60 * 60 * 24 * 5 * 365, // 5 years
      sameSite: config.isProd ? "none" : "lax",
    },
  });

  // create the Express app and associate the middleware to it
  // including CORS handling since our backend is stored on a different
  // sub-domain than our frontend (served from a CDN)
  const app = createExpressApp([
    cors({
      credentials: true,
      origin: corsCheckOrigin(config.allowOrigin),
    }),
    sessionParser,
    jsonBodyParser(),
  ]);

  // Starting the apollo service and couple it with the express app (it also
  // requires a CORS handler).
  await server.start();
  server.applyMiddleware({
    app,
    path: `${config.apiPathPrefix}/graphql`,
    cors: {
      credentials: true,
      origin: corsCheckOrigin(config.allowOrigin),
    },
  });

  // Launches the backend express application
  app.listen({ port: config.port }, () => {
    logger.info(
      `🚀 Server ready at http://${config.hostname}:${config.port}${server.graphqlPath}`
    );
  });

  // create the CRON jobs, they run check like reminder to start a task,
  // auto stop a task, send scheduled emails...
  // the CRON service uses `bullmq` and runs on REDIS
  await initCron();

  return app;
}

start();
