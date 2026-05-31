/**
 * Behavior tests for REST cursor pagination.
 *
 * The REST API presents a forward, opaque-cursor interface to clients, while
 * the GraphQL queries underneath page by offset. These tests pin the
 * translation: a cursor round-trips to its offset, bad cursors are rejected
 * cleanly (so the route can answer 400 rather than 500), and a GraphQL page is
 * reshaped into the `{ data, pageInfo }` envelope with a `nextCursor` that
 * exists exactly when there is a next page.
 */

import expect from "expect";
import {
  encodeCursor,
  decodeCursor,
  buildPage,
  CursorError,
} from "../pagination";

describe("rest cursor pagination", () => {
  it("round-trips an offset through an opaque cursor", () => {
    const cursor = encodeCursor(40);
    expect(typeof cursor).toBe("string");
    expect(cursor).not.toBe("40"); // opaque, not the bare number
    expect(decodeCursor(cursor)).toBe(40);
  });

  it("treats a missing cursor as offset zero", () => {
    expect(decodeCursor(undefined)).toBe(0);
  });

  it("rejects a malformed cursor with a CursorError", () => {
    expect(() => decodeCursor("not-a-cursor")).toThrow(CursorError);
    expect(() => decodeCursor(encodeCursor(-1))).toThrow(CursorError);
  });

  it("reshapes a GraphQL page and emits nextCursor only when more remain", () => {
    const page = buildPage(
      {
        nodes: [{ id: 1 }, { id: 2 }],
        totalCount: 5,
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          pageSize: 2,
        },
      },
      0,
    );

    expect(page.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(page.pageInfo.totalCount).toBe(5);
    expect(page.pageInfo.hasNextPage).toBe(true);
    // next page starts at offset 0 + pageSize 2
    expect(decodeCursor(page.pageInfo.nextCursor!)).toBe(2);
  });

  it("emits a null nextCursor on the last page", () => {
    const page = buildPage(
      {
        nodes: [{ id: 9 }],
        totalCount: 5,
        pageInfo: { hasNextPage: false, hasPreviousPage: true, pageSize: 2 },
      },
      4,
    );

    expect(page.pageInfo.nextCursor).toBeNull();
  });
});
