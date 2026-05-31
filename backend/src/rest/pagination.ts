/**
 * Cursor pagination for the REST API.
 *
 * The `/v1` list endpoints expose a forward, opaque-cursor interface —
 * `?first=N&after=<cursor>` — to clients. The GraphQL queries underneath page
 * by offset, so a cursor is simply an offset wrapped in an opaque token.
 *
 * Why opaque-cursor over offset (and not bare `?offset=`): keeping the cursor
 * opaque means clients treat it as "the handle for the next page" and never
 * build their own offsets. That lets us migrate the underlying mechanism to
 * true keyset pagination later WITHOUT a breaking change to the wire contract.
 * The honest caveat: today it is offset-backed, so it shares offset's cost and
 * its drift if rows are inserted mid-scan — acceptable for the read surface,
 * and invisible to clients when we improve it.
 *
 * Exports:
 *  - encodeCursor(offset) / decodeCursor(cursor)
 *  - CursorError — thrown on a malformed cursor (routes map it to 400)
 *  - parsePageParams(query) — { first, offset } from an Express query
 *  - buildPage(graphqlPage, offset) — reshape a Paginated* result into the
 *    REST `{ data, pageInfo }` envelope with a forward nextCursor.
 */

import { ParsedQs } from "qs";

// A bad cursor is client error, not server error — distinct type so the route
// can answer 400 BAD_USER_INPUT instead of a 500.
export class CursorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CursorError";
  }
}

// Default page size when the client doesn't ask. The underlying GraphQL
// resolvers clamp their own maximum, so we don't second-guess it here.
const DEFAULT_PAGE_SIZE = 20;

export function encodeCursor(offset: number): string {
  return Buffer.from(`offset:${offset}`, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string | undefined): number {
  if (cursor === undefined) {
    return 0;
  }

  const decoded = Buffer.from(cursor, "base64url").toString("utf8");
  const match = decoded.match(/^offset:(\d+)$/);
  if (!match) {
    throw new CursorError("Malformed pagination cursor");
  }

  return parseInt(match[1], 10);
}

export interface PageParams {
  first: number;
  offset: number;
}

export function parsePageParams(query: ParsedQs): PageParams {
  const raw = query.first ? parseInt(String(query.first), 10) : NaN;
  const offset = decodeCursor(
    query.after ? String(query.after) : undefined,
  );

  return {
    // Absent or unparseable `first` falls back to a predictable default rather
    // than leaning on whatever each resolver happens to default to.
    first: Number.isNaN(raw) ? DEFAULT_PAGE_SIZE : raw,
    offset,
  };
}

// The minimal shape we rely on from a GraphQL Paginated* result.
interface GraphQLPage<Node> {
  nodes: Node[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageSize: number;
  };
}

export interface RestPage<Node> {
  data: Node[];
  pageInfo: {
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
  };
}

export function buildPage<Node>(
  page: GraphQLPage<Node>,
  offset: number,
): RestPage<Node> {
  const { hasNextPage, hasPreviousPage, pageSize } = page.pageInfo;

  return {
    data: page.nodes,
    pageInfo: {
      totalCount: page.totalCount,
      hasNextPage,
      hasPreviousPage,
      nextCursor: hasNextPage ? encodeCursor(offset + pageSize) : null,
    },
  };
}
