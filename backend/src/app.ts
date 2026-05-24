import express from "express";
import { config } from "./config";
import { router } from "./routes";

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

  for (const middleware of middlewares) {
    app.use(middleware);
  }

  // Mount REST endpoints under the API path prefix. Empty for self-hosted
  // (Traefik strips /api), "/api" for DO App Platform (preserves the prefix).
  app.use(config.apiPathPrefix, router);

  if (config.isDev) {
    app.use("/doc/", express.static("out/doc/"));
    app.use("/css/", express.static("templates/css/"));
    app.use("/script/", express.static("templates/script/"));
    app.use("/search.js", express.static("templates/search.js"));
  }

  return app;
}
