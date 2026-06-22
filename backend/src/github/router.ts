// Express router for inbound GitHub webhooks. Like /v1 and /mcp, it is a
// session-free machine-to-machine surface mounted ahead of the global
// session/JSON middleware (see app.ts). It carries its own raw() body parser so
// the handler receives the exact bytes GitHub signed, for HMAC verification.

import { Router, raw } from "express";
import { handleWebhook } from "./webhookHandler";

export const githubRouter = Router();

// raw({ type: "*/*" }) makes req.body a Buffer regardless of content-type, so
// the signature is checked against the unmodified payload.
githubRouter.post("/webhook/:token", raw({ type: "*/*" }), handleWebhook);
