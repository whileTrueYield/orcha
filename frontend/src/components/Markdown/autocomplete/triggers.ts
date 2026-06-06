/**
 * Autocomplete trigger detection (PRD #36, issue #42).
 *
 * The editor autocomplete fires when a user types `@` (role mention), `#`
 * (ticket), `:` (emoji) or `/` (block inserts, e.g. a drawing) and keeps typing
 * a query. This module answers the one pure question behind that behaviour:
 * looking at the text from the start of the current block up to the cursor, is
 * a trigger active, and what is the query?
 *
 * Public API:
 *   - findActiveTrigger(textBeforeCursor): ActiveTrigger | null
 *
 * Keeping this headless (no ProseMirror, no DOM) is what makes the autocomplete
 * testable at all — the surrounding plugin is the untestable editor boundary.
 */

export type TriggerChar = "@" | "#" | ":" | "/";

export interface ActiveTrigger {
  // Which trigger is being typed.
  char: TriggerChar;
  // The text typed after the trigger, up to the cursor (may be empty).
  query: string;
  // Offset of the trigger char within `textBeforeCursor`, so the caller can map
  // it to an absolute document position for replacement.
  triggerOffset: number;
}

// A trigger is only active at a word boundary — preceded by the block start or
// whitespace — so `email@host`, `12:30` and `either/or` never open the popup.
// The query runs to the cursor and contains no whitespace, so typing a space
// closes the popup.
const TRIGGER_PATTERN = /(?:^|\s)([@#:/])(\S*)$/;

export function findActiveTrigger(
  textBeforeCursor: string,
): ActiveTrigger | null {
  const match = TRIGGER_PATTERN.exec(textBeforeCursor);
  if (!match) return null;

  const char = match[1] as TriggerChar;
  const query = match[2];
  // The query sits at the very end of the text and the trigger char is the one
  // position before it, so the offset follows from the lengths alone.
  const triggerOffset = textBeforeCursor.length - query.length - 1;

  return { char, query, triggerOffset };
}
