/**
 * Behaviour tests for mention resolution (PRD #36, issue #38).
 *
 * `resolveMentions(markdown, resolvers)` is the write-side step that turns the
 * loose references an author (or an AI agent) types — `@name`, `#123` — into the
 * canonical id-bearing directives ADR 0007 stores. The org lookups are injected
 * so the module stays pure: tests pass fakes, the API passes prisma-backed,
 * org-scoped resolvers. The rule (crash-early, never silently wrong): an
 * unambiguous reference resolves; an ambiguous or unknown one is left literal and
 * surfaced as a warning, never guessed.
 *
 * Resolution is asserted through `analyze` — the actual consumer of the output —
 * so the tests pin the real write→read contract, not a serialization detail.
 */

import expect from "expect";
import { resolveMentions, type MentionResolvers } from "../resolve";
import { analyze } from "../analysis";
import { parseBody } from "../directives";

// Fake org: a single role "alice" (id 5) and a single ticket #123 (id 42).
const resolvers: MentionResolvers = {
  rolesByName: async (name) => (name === "alice" ? [5] : []),
  ticketByNumber: async (n) => (n === 123 ? 42 : null),
};

// Minimal structural view of an mdast node — enough to walk the tree without
// importing unist-util-visit, which (being ESM-only) can't be required directly
// from a spec file under the ts-node loader; the parse pipeline is reached via
// the `parseBody` source module instead.
type MdNode = {
  type: string;
  name?: string;
  attributes?: Record<string, string | null | undefined> | null;
  children?: MdNode[];
};

// Ids bound to directives of a given name in the resolved body, read back
// through the parser (robust to the serializer's attribute formatting — e.g.
// remark-directive emits the `id` attribute as the `{#id}` shorthand).
function boundIds(markdown: string, name: string): string[] {
  const ids: string[] = [];
  const walk = (node: MdNode) => {
    if (node.type === "textDirective" && node.name === name && node.attributes?.id != null) {
      ids.push(node.attributes.id);
    }
    node.children?.forEach(walk);
  };
  walk(parseBody(markdown) as unknown as MdNode);
  return ids;
}

describe("resolveMentions", () => {
  it("resolves an unambiguous @name to a role :mention directive", async () => {
    const { markdown, warnings } = await resolveMentions("ping @alice please", resolvers);

    expect(analyze(markdown).mentions).toEqual([5]);
    expect(warnings).toEqual([]);
  });

  it("resolves an unambiguous #123 to a :ticket directive", async () => {
    const { markdown, warnings } = await resolveMentions("see #123 for details", resolvers);

    expect(boundIds(markdown, "ticket")).toEqual(["42"]);
    expect(warnings).toEqual([]);
  });

  it("leaves an ambiguous @name literal and warns", async () => {
    const ambiguous: MentionResolvers = {
      rolesByName: async (name) => (name === "team" ? [5, 9] : []),
      ticketByNumber: async () => null,
    };

    const { markdown, warnings } = await resolveMentions("ping @team now", ambiguous);

    expect(analyze(markdown).mentions).toEqual([]);
    expect(markdown).toContain("@team");
    expect(warnings).toEqual([{ kind: "ambiguous", reference: "@team", matches: 2 }]);
  });

  it("leaves unknown references literal and warns", async () => {
    const { markdown, warnings } = await resolveMentions("hi @nobody and #999", resolvers);

    expect(analyze(markdown).mentions).toEqual([]);
    expect(markdown).toContain("@nobody");
    expect(markdown).toContain("#999");
    expect(warnings).toEqual([
      { kind: "unknown", reference: "@nobody" },
      { kind: "unknown", reference: "#999" },
    ]);
  });

  it("resolves multiple references in one block independently", async () => {
    const { markdown, warnings } = await resolveMentions(
      "ping @alice about #123 and @nobody",
      resolvers,
    );

    expect(analyze(markdown).mentions).toEqual([5]);
    expect(boundIds(markdown, "ticket")).toEqual(["42"]);
    expect(markdown).toContain("@nobody");
    expect(warnings).toEqual([{ kind: "unknown", reference: "@nobody" }]);
  });

  it("is idempotent on already-resolved content", async () => {
    const once = (await resolveMentions("ping @alice", resolvers)).markdown;
    const twice = (await resolveMentions(once, resolvers)).markdown;

    expect(twice).toEqual(once);
    expect(analyze(twice).mentions).toEqual([5]);
  });
});
