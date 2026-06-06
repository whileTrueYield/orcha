/**
 * The I/O half of autocomplete candidates (PRD #36, issue #42): dispatch a
 * trigger char to its data source and return the uniform candidate list the
 * popup renders. Role and ticket queries hit GraphQL; emoji is local. This is
 * kept apart from `candidates.ts` because importing the GraphQL client pulls in
 * Vite-only config that jest cannot parse, so the pure mappers stay testable.
 *
 * Public API:
 *   - fetchCandidates(char, query): Promise<DirectiveCandidate[]>
 */
import { gql } from "@apollo/client";

import { GQLClient } from "utils/GQLClient";
import { type Drawing } from "types/graphql";

import { CREATE_DRAWING } from "../nodes/excalidrawGraphql";
import {
  type DirectiveCandidate,
  type RoleHit,
  type TicketHit,
  parseTicketSearchResult,
  roleCandidate,
  searchBlockInserts,
  searchEmojiCandidates,
} from "./candidates";
import type { TriggerChar } from "./triggers";

const SEARCH_ROLE = gql`
  query SearchRoleForMention($query: String!) {
    searchRole(query: $query) {
      id
      name
    }
  }
`;

const SEARCH_TICKET = gql`
  query SearchTicketForMention($query: String!) {
    searchTicket(query: $query) {
      id
      name
    }
  }
`;

async function fetchRoleCandidates(
  query: string,
): Promise<DirectiveCandidate[]> {
  const { data } = await GQLClient.query<{ searchRole: RoleHit[] }>({
    query: SEARCH_ROLE,
    variables: { query },
  });
  return data.searchRole.map(roleCandidate);
}

async function fetchTicketCandidates(
  query: string,
): Promise<DirectiveCandidate[]> {
  const { data } = await GQLClient.query<{ searchTicket: TicketHit[] }>({
    query: SEARCH_TICKET,
    variables: { query },
  });
  return data.searchTicket.map(parseTicketSearchResult);
}

// Picking "Drawing" creates the empty Drawing record up front, so the inserted
// node — and any save that follows — always references a real id. The mutation
// runs at commit time (via resolveAttrs), not while the menu is open.
async function createDrawingAttrs(): Promise<{ id: number; label: string }> {
  const { data } = await GQLClient.mutate<{ createDrawing: Drawing }>({
    mutation: CREATE_DRAWING,
    variables: { input: { data: JSON.stringify({ elements: [] }) } },
  });
  if (!data) throw new Error("createDrawing returned no data");
  return { id: data.createDrawing.id, label: "" };
}

function blockInsertCandidates(query: string): DirectiveCandidate[] {
  // The drawing is the only block insert today; a second one will need its own
  // resolveAttrs branch keyed on `insert.nodeName`.
  return searchBlockInserts(query).map((insert) => ({
    ...insert,
    attrs: { id: 0, label: "" },
    resolveAttrs: createDrawingAttrs,
  }));
}

// Emoji and block inserts are synchronous but wrapped so every caller awaits
// the same shape.
export function fetchCandidates(
  char: TriggerChar,
  query: string,
): Promise<DirectiveCandidate[]> {
  switch (char) {
    case "@":
      return fetchRoleCandidates(query);
    case "#":
      return fetchTicketCandidates(query);
    case ":":
      return Promise.resolve(searchEmojiCandidates(query));
    case "/":
      return Promise.resolve(blockInsertCandidates(query));
  }
}
