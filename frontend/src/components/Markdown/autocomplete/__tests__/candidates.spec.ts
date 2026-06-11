/**
 * The pure halves of candidate building: turning a ticket search result into an
 * insertable node, and ranking emoji shortcodes. The GraphQL fetchers around
 * them are the I/O boundary and are not covered here.
 */
import {
  parseTicketSearchResult,
  searchEmojiCandidates,
} from "../candidates";

describe("parseTicketSearchResult", () => {
  // searchTicket encodes its id as `<dbId>:<productCode>:<localId>`; the block
  // ticket node stores only the numeric db id (the card renders the rest), while
  // the popup row shows the human `PROD-7 title` form.
  it("splits the composite id into node attrs and a display label", () => {
    const candidate = parseTicketSearchResult({
      id: "42:PROD:7",
      name: "Fix the thing",
    });

    expect(candidate).toEqual({
      key: "ticket:42",
      display: "PROD-7 Fix the thing",
      nodeName: "ticket",
      attrs: { id: 42 },
    });
  });
});

describe("searchEmojiCandidates", () => {
  it("returns default smileys for an empty query", () => {
    const results = searchEmojiCandidates("");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nodeName).toBe("emoji");
  });

  it("ranks a matching shortcode first", () => {
    const results = searchEmojiCandidates("tada");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].attrs).toEqual({ name: "tada" });
    expect(results[0].nodeName).toBe("emoji");
  });

  it("returns nothing for gibberish", () => {
    expect(searchEmojiCandidates("zzzzznotanemoji")).toEqual([]);
  });
});
