/**
 * PAT bearer authentication middleware for the `/mcp` endpoint.
 *
 * The MCP twin of rest/bearerAuth.ts: it turns an
 * `Authorization: Bearer orcha_pat_...` header into a resolved role on the
 * request, or refuses the connection with a 401. The difference is only the
 * seam it calls — `resolveRole` (the point OAuth/PRD B will swap) — and where
 * it stows the result: `req.mcpRole` for the tools, `req.tokenId` for the
 * shared rate limiter.
 *
 * Exports:
 *  - mcpBearerAuth: the Express middleware.
 *
 * Design notes:
 *  - Refusing here (before the MCP transport runs) is what makes an invalid or
 *    missing token fail at connection time, exactly as the spec requires.
 *  - As in `/v1`, we do NOT distinguish UNKNOWN / REVOKED / EXPIRED — every
 *    invalid token collapses to one opaque 401 so a probe learns nothing.
 *  - resolveRole is async and Express 4 won't catch a rejected promise, so an
 *    unexpected (non-InvalidToken) failure is forwarded to next(err).
 */

import { Request, Response, NextFunction } from "express";
import { resolveRole, ResolvedRole } from "./resolveRole";
import { InvalidTokenError } from "../models/apiToken/token";
import { errorEnvelope } from "../rest/errorEnvelope";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      // The resolved role the MCP tools run as (set by mcpBearerAuth).
      mcpRole?: ResolvedRole;
    }
  }
}

const BEARER_PREFIX = "Bearer ";

function unauthorized(res: Response, message: string): void {
  // RFC 6750: advertise the scheme on a 401 to a bearer-protected resource.
  res.set("WWW-Authenticate", "Bearer");
  res.status(401).json(errorEnvelope("UNAUTHENTICATED", message));
}

export async function mcpBearerAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return unauthorized(res, "Missing or malformed bearer token");
  }

  const plaintext = header.slice(BEARER_PREFIX.length).trim();
  if (!plaintext) {
    return unauthorized(res, "Missing or malformed bearer token");
  }

  try {
    const resolved = await resolveRole(plaintext);
    req.mcpRole = resolved;
    // Reuse the per-token rate-limit key the shared limiter reads.
    req.tokenId = resolved.tokenId;
    next();
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      return unauthorized(res, "Invalid bearer token");
    }
    next(error);
  }
}
