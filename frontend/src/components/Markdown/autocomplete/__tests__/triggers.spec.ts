/**
 * Trigger detection drives the editor autocomplete: given the text from the
 * start of the current block up to the cursor, it decides whether an `@`/`#`/`:`
 * mention is being typed and what has been typed so far. It is the one piece of
 * the autocomplete that is pure (no editor, no DOM), so it is the piece we test.
 */
import { findActiveTrigger } from "../triggers";

describe("findActiveTrigger", () => {
  it("detects a trigger at the start of the block", () => {
    expect(findActiveTrigger("@ali")).toEqual({
      char: "@",
      query: "ali",
      triggerOffset: 0,
    });
  });

  it("detects a trigger after whitespace", () => {
    expect(findActiveTrigger("ping @ali")).toEqual({
      char: "@",
      query: "ali",
      triggerOffset: 5,
    });
  });

  it("returns an empty query right after the trigger char", () => {
    expect(findActiveTrigger("see #")).toEqual({
      char: "#",
      query: "",
      triggerOffset: 4,
    });
  });

  it("supports the emoji trigger", () => {
    expect(findActiveTrigger("nice :tad")).toEqual({
      char: ":",
      query: "tad",
      triggerOffset: 5,
    });
  });

  it("supports the block-insert trigger", () => {
    expect(findActiveTrigger("/dra")).toEqual({
      char: "/",
      query: "dra",
      triggerOffset: 0,
    });
  });

  it("does not trigger mid-word (no leading boundary)", () => {
    expect(findActiveTrigger("email@host")).toBeNull();
    expect(findActiveTrigger("12:30")).toBeNull();
    expect(findActiveTrigger("either/or")).toBeNull();
  });

  it("closes once a space is typed after the query", () => {
    expect(findActiveTrigger("@alice ")).toBeNull();
  });

  it("returns null when there is no trigger", () => {
    expect(findActiveTrigger("just text")).toBeNull();
    expect(findActiveTrigger("")).toBeNull();
  });

  it("tracks only the trigger nearest the cursor", () => {
    expect(findActiveTrigger("@bob and #12")).toEqual({
      char: "#",
      query: "12",
      triggerOffset: 9,
    });
  });
});
