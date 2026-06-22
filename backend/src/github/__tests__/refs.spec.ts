/**
 * Unit tests for the Ticket-ref parser. A PR's head branch and title are free
 * text; the parser pulls out every `PRODUCT-localId` candidate so the mirror can
 * resolve each within the bound org. Parsing is deliberately loose (resolution
 * is what decides a ref is real); these tests pin the extraction + dedupe shape.
 */

import expect from "expect";
import { parseTicketRefs } from "../refs";

describe("parseTicketRefs", () => {
  it("extracts a single ref from a branch name", () => {
    expect(parseTicketRefs("feature/BUGS-1-fix-the-thing")).toEqual([
      { productCode: "BUGS", localId: 1 },
    ]);
  });

  it("extracts a ref from a PR title", () => {
    expect(parseTicketRefs("Fix the login crash (WEB-42)")).toEqual([
      { productCode: "WEB", localId: 42 },
    ]);
  });

  it("extracts several distinct refs", () => {
    expect(parseTicketRefs("BUGS-1 and WEB-2 together")).toEqual([
      { productCode: "BUGS", localId: 1 },
      { productCode: "WEB", localId: 2 },
    ]);
  });

  it("dedupes the same ref regardless of letter case", () => {
    expect(parseTicketRefs("bugs-1 fixes BUGS-1")).toEqual([
      { productCode: "bugs", localId: 1 },
    ]);
  });

  it("returns an empty array when there is no ref", () => {
    expect(parseTicketRefs("just a normal branch name")).toEqual([]);
  });

  it("ignores a hyphenated word with no trailing number", () => {
    expect(parseTicketRefs("ready-for-review")).toEqual([]);
  });

  it("tolerates null/empty input", () => {
    expect(parseTicketRefs(null)).toEqual([]);
    expect(parseTicketRefs("")).toEqual([]);
  });
});
