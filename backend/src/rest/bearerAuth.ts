/**
 * PAT bearer authentication middleware for the `/v1` REST API.
 *
 * Turns an `Authorization: Bearer orcha_pat_...` header into a resolved
 * AuthRoleContext on `req.me`, or stops the request with a 401 and the
 * standard error envelope. Everything downstream (the executor, the route
 * handlers) can then assume `req.me` is a fully-resolved LINKED context.
 *
 * Exports:
 *  - bearerAuth: the Express middleware.
 *
 * Design notes:
 *  - The credential logic lives in the transport-agnostic token module
 *    (verifyAndResolve); this middleware only does the HTTP translation. We
 *    deliberately do NOT distinguish UNKNOWN / REVOKED / EXPIRED in the
 *    response — telling a caller *why* a token failed only helps an attacker
 *    probe. All three collapse to one opaque 401.
 *  - verifyAndResolve is async and Express 4 will not catch a rejected
 *    promise, so unexpected (non-InvalidToken) failures are forwarded to
 *    next(err) explicitly rather than crashing the request.
 */

import { Request, Response, NextFunction } from "express";
import { AuthRoleContext } from "../types";
import { buildRoleContext } from "../middlewares/isAuthenticated";
import {
  verifyAndResolve,
  InvalidTokenError,
} from "../models/apiToken/token";
import { errorEnvelope } from "./errorEnvelope";

// The bearer middleware attaches the resolved role context here so route
// handlers and the executor can read a single, transport-agnostic identity.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      me?: AuthRoleContext;
    }
  }
}

const BEARER_PREFIX = "Bearer ";

function unauthorized(res: Response, message: string): void {
  // RFC 6750: a 401 to a bearer-protected resource advertises the scheme.
  res.set("WWW-Authenticate", "Bearer");
  res.status(401).json(errorEnvelope("UNAUTHENTICATED", message));
}

export async function bearerAuth(
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
    const role = await verifyAndResolve(plaintext);
    req.me = buildRoleContext({
      userId: role.userId,
      roleId: role.id,
      organizationId: role.organizationId,
      roleType: role.type,
    });
    next();
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      // One opaque 401 for any invalid token — see the design note above.
      return unauthorized(res, "Invalid bearer token");
    }
    next(error);
  }
}
