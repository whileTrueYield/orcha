/**
 * The pure candidate model for the editor autocomplete (PRD #36, issue #42).
 *
 * Each trigger resolves to a uniform list of `DirectiveCandidate`s — a row to
 * show and the node to insert when chosen. This module holds the parts that need
 * no I/O: the shape itself, ticket-id parsing, and the local emoji fuzzy match.
 * The GraphQL-backed role/ticket fetchers live in `fetchCandidates.ts` so this
 * stays importable from jest (the GraphQL client pulls in Vite-only config).
 *
 * Public API:
 *   - DirectiveCandidate / DirectiveNodeName
 *   - roleCandidate(hit)          — map a searchRole hit to a mention candidate
 *   - parseTicketSearchResult(hit) — map a searchTicket hit to a ticket candidate
 *   - searchEmojiCandidates(query) — local fuzzy emoji match
 */
import fuzzysort from "fuzzysort";

import {
  type EmojiAttrs,
  type ExcalidrawAttrs,
  type MentionAttrs,
  type TicketAttrs,
} from "../directiveNodes";
import { emoji, findEmojiChar } from "../emoji";

export type DirectiveNodeName = "mention" | "ticket" | "emoji" | "excalidraw";

export type DirectiveAttrs =
  | MentionAttrs
  | TicketAttrs
  | EmojiAttrs
  | ExcalidrawAttrs;

export interface DirectiveCandidate {
  // Stable identity for the list (React key / selection) — never shown.
  key: string;
  // The text rendered in the popup row.
  display: string;
  // The custom node inserted when this candidate is chosen.
  nodeName: DirectiveNodeName;
  attrs: DirectiveAttrs;
  // Some inserts only know their attrs at commit time — picking "Drawing"
  // creates the Drawing record first so the node carries a real id (a body is
  // never saved holding a dangling reference). When present, commit awaits this
  // instead of using `attrs`.
  resolveAttrs?: () => Promise<DirectiveAttrs>;
}

export interface RoleHit {
  id: number;
  name: string;
}
export interface TicketHit {
  id: string;
  name: string;
}

// A role mention carries `type="user"` with the role id: Orcha mentions resolve
// to roles, the backend's own resolver tags them `user`, and `analyze()` reads
// the id — so a save fires the notification.
export function roleCandidate(hit: RoleHit): DirectiveCandidate {
  return {
    key: `mention:${hit.id}`,
    display: `@${hit.name}`,
    nodeName: "mention",
    attrs: { mentionType: "user", id: hit.id, label: hit.name },
  };
}

// searchTicket encodes its id as `<dbId>:<productCode>:<localId>`. The ticket is
// a block embed that renders the live card by id, so the node carries only the
// numeric db id; the popup still shows the familiar `PROD-7 title` form.
export function parseTicketSearchResult(hit: TicketHit): DirectiveCandidate {
  const [dbId, productCode, localId] = hit.id.split(":");
  return {
    key: `ticket:${dbId}`,
    display: `${productCode}-${localId} ${hit.name}`,
    nodeName: "ticket",
    attrs: { id: Number(dbId) },
  };
}

// Shown before the user types anything after `:` — the common reactions, so the
// popup is never empty on open.
const DEFAULT_EMOJI = [
  "smiley",
  "laughing",
  "thumbsup",
  "thumbsdown",
  "cry",
  "open_mouth",
  "heart",
];

function emojiCandidate(name: string): DirectiveCandidate {
  const glyph = findEmojiChar(name) ?? "";
  return {
    key: `emoji:${name}`,
    display: `${glyph} ${name.replace(/_/g, " ")}`.trim(),
    nodeName: "emoji",
    attrs: { name },
  };
}

export function searchEmojiCandidates(query: string): DirectiveCandidate[] {
  if (query.length === 0) return DEFAULT_EMOJI.map(emojiCandidate);

  return fuzzysort
    .go(query, emoji, { key: "name", limit: 10 })
    .map((result) => emojiCandidate(result.obj.name));
}

// The `/` trigger's block-insert menu — currently just the Excalidraw drawing.
// Descriptors are pure (name + node); `fetchCandidates` attaches the I/O-bound
// `resolveAttrs` that creates the backing record on commit.
export interface BlockInsertDescriptor {
  key: string;
  display: string;
  nodeName: DirectiveNodeName;
}

const BLOCK_INSERTS: BlockInsertDescriptor[] = [
  { key: "insert:excalidraw", display: "✏️ Drawing", nodeName: "excalidraw" },
];

// Matched on the display name, case-insensitive, so `/dra` finds "Drawing"; an
// empty query lists everything.
export function searchBlockInserts(query: string): BlockInsertDescriptor[] {
  const lowered = query.toLowerCase();
  return BLOCK_INSERTS.filter((insert) =>
    insert.display.toLowerCase().includes(lowered),
  );
}
