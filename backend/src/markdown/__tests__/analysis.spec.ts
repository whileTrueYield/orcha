/**
 * Behaviour tests for Markdown body analysis (PRD #36, issue #38).
 *
 * `analyze(markdown)` is the read side that replaces the Tiptap-JSON content
 * utilities: it extracts the role mentions (for notifications), the plain text
 * (for search indexing), and the headings (for documentation TOCs) from a
 * Markdown body. It is pure and headless, so these tests drive it purely through
 * the `analyze` interface.
 */

import expect from "expect";
import fc from "fast-check";
import { analyze } from "../analysis";

describe("analyze", () => {
  describe("mentions", () => {
    it("extracts role ids from :mention directives", () => {
      const body =
        'Ping :mention[Alice]{type="user" id="5"} and ' +
        ':mention[Bob]{type="user" id="8"}.\n';

      expect(analyze(body).mentions).toEqual([5, 8]);
    });
  });

  describe("plainText", () => {
    it("renders blocks as whitespace-separated text for search indexing", () => {
      const body =
        "# Title\n\nFirst paragraph.\n\n" +
        'Second with :mention[Alice]{type="user" id="5"}.\n';

      // Block boundaries become whitespace so adjacent words stay separated;
      // the :mention contributes its label text ("Alice"), not its attributes.
      expect(analyze(body).plainText).toEqual(
        "Title\nFirst paragraph.\nSecond with Alice.",
      );
    });
  });

  describe("headings", () => {
    it("extracts each heading's level, text, and slug anchor", () => {
      const body = "# Getting Started\n\nintro\n\n## API Reference\n";

      expect(analyze(body).headings).toEqual([
        { level: 1, text: "Getting Started", anchor: "getting-started" },
        { level: 2, text: "API Reference", anchor: "api-reference" },
      ]);
    });
  });

  // analyze runs on whatever a human or an AI agent writes, so it must be total:
  // any string parses and yields the result shape, never a throw. This also
  // exercises the headless (no-DOM) path over a wide range of inputs.
  it("is total over arbitrary input and always returns the result shape", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = analyze(text);
        expect(Array.isArray(result.mentions)).toBe(true);
        expect(typeof result.plainText).toBe("string");
        expect(Array.isArray(result.headings)).toBe(true);
      }),
    );
  });
});
