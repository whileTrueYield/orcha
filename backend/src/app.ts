import express from "express";
import { config } from "./config";
import { router } from "./routes";
import { v1Router } from "./rest/router";
import { mcpRouter } from "./mcp/router";

/**
 * Automate the creation of the express application and
 * adds the middlewares to it.
 *
 * It also setup the static sources for documentation
 * to be served locally instead of using S3 when in DEV
 *
 * Finally, we also setup all the custom REST endpoints.
 */
export function createExpressApp(middlewares: any[] = []) {
  const app = express();

  // our reverse proxy isn't encrypted (AWS load balancer is encrypting for us)
  // this will make sure we read the client's IP address properly amongst other values.
  app.set("trust proxy", true);

  // Mount the public REST API ahead of the session/cookie-CORS middleware so a
  // `/v1` request is handled entirely by its own bearer-only stack and never
  // acquires a session cookie or the credentialed GraphQL CORS headers.
  app.use(`${config.apiPathPrefix}/v1`, v1Router);

  // The MCP endpoint rides the same bearer-only, session-free stack, for the
  // same reason: it is a PAT-authenticated, machine-to-machine surface.
  app.use(`${config.apiPathPrefix}/mcp`, mcpRouter);

  for (const middleware of middlewares) {
    app.use(middleware);
  }

  // Mount REST endpoints under the API path prefix. Reverse proxies (DO App
  // Platform, Traefik) strip the /api prefix before forwarding, so the default
  // mount point is root. Set API_PATH_PREFIX="/api" only if the proxy preserves it.
  app.use(config.apiPathPrefix || "/", router);

  if (config.isDev) {
    app.use("/doc/", express.static("out/doc/"));
    app.use("/css/", express.static("templates/css/"));
    app.use("/script/", express.static("templates/script/"));
    app.use("/search.js", express.static("templates/search.js"));
  }

  return app;
}
