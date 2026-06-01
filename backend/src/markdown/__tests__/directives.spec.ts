/**
 * Round-trip tests for the Markdown directive grammar (PRD #36, issue #38).
 *
 * The custom content nodes — role/user `:mention`, `:ticket`, `:emoji`, and the
 * `:excalidraw` embed (ADR 0007) — are encoded as remark-directive nodes. The
 * storage contract is that parsing a body and serializing it back is lossless
 * for these nodes: `parse(serialize(parse(md)))` is structurally equal to
 * `parse(md)`, with ids and attributes preserved. These tests pin that down so
 * the editor and the body store can normalise on write without mangling
 * custom content.
 */

import expect from "expect";
import { parseBody, serializeBody } from "../directives";

// Markdown carries source positions that legitimately shift when a body is
// re-serialised; "structurally equal" in the acceptance criterion means the
// node shape (type, name, attributes, children), not byte offsets.
function stripPositions(tree: unknown): unknown {
  return JSON.parse(
    JSON.stringify(tree, (key, value) => (key === "position" ? undefined : value)),
  );
}

// The acceptance criterion: parse(serialize(parse(md))) is structurally equal to
// parse(md). Re-parsing the serialized form (rather than diffing strings) is what
// proves the data survived, independent of cosmetic formatting choices the
// serializer makes (attribute quoting, spacing).
function assertRoundTrips(body: string) {
  const tree = parseBody(body);
  const reparsed = parseBody(serializeBody(tree));
  expect(stripPositions(reparsed)).toEqual(stripPositions(tree));
}

describe("markdown directives", () => {
  it("round-trips a :mention directive (role/user reference)", () => {
    assertRoundTrips('Hello :mention[Alice]{type="user" id="5"}.\n');
  });

  it("round-trips a :ticket directive", () => {
    assertRoundTrips('See :ticket[#123]{id="42"}.\n');
  });

  it("round-trips a :emoji directive (no attributes)", () => {
    assertRoundTrips("Nice work :emoji[tada].\n");
  });

  it("round-trips an :excalidraw embed", () => {
    assertRoundTrips('Diagram :excalidraw[Architecture]{id="d1" rev="3"}.\n');
  });
});

// The Crepe editor emits GitHub-Flavored Markdown, and every save re-serialises
// the body through this pipeline. Without GFM the serializer escapes a task
// list's bracket (`* [ ] x` → `* \[ ] x`), so it reparses as literal text and
// the checkbox is lost on reload. These pin the GFM constructs that must survive.
describe("markdown GFM", () => {
  it("round-trips an unchecked task list item", () => {
    assertRoundTrips("* [ ] buy milk\n");
  });

  it("round-trips a checked task list item", () => {
    assertRoundTrips("* [x] done\n");
  });

  it("round-trips a table", () => {
    assertRoundTrips("| a | b |\n| - | - |\n| 1 | 2 |\n");
  });

  it("round-trips strikethrough", () => {
    assertRoundTrips("~~struck~~\n");
  });

  it("round-trips a task list alongside a :mention directive", () => {
    // GFM and remark-directive must coexist without interfering.
    assertRoundTrips('* [ ] ping :mention[Alice]{type="user" id="5"}\n');
  });
});
