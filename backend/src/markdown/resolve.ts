/**
 * Mention resolution (PRD #36, issue #38) — the write-side step that binds the
 * loose references an author or AI agent types into the canonical id-bearing
 * directives ADR 0007 stores.
 *
 * Public API:
 *   - resolveMentions(markdown, resolvers): Promise<ResolutionResult>
 *   - types MentionResolvers, ResolutionWarning, ResolutionResult
 *
 * `@name` resolves to `:mention[name]{type=user id=…}` and `#123` to
 * `:ticket[#123]{id=…}` — but only when the org lookup returns exactly one
 * match. Ambiguous (more than one) or unknown (none) references are left as the
 * literal text the author typed and reported in `warnings`, never guessed; this
 * is the crash-early, no-silently-wrong-state rule applied to content.
 *
 * The org lookups are injected (not imported) so the module is pure and headless:
 * tests pass fakes, the API passes prisma-backed, organization-scoped resolvers.
 * Resolution runs over the parsed mdast tree and only ever rewrites plain-text
 * nodes, so references inside code spans or already-resolved directives are left
 * alone.
 */

import { visit } from "unist-util-visit";
import type { Text, Parent, PhrasingContent } from "mdast";
import type { TextDirective } from "mdast-util-directive";
import { parseBody, serializeBody } from "./directives";

export type MentionResolvers = {
  // Ids of roles in the organization whose name matches `name`: empty (unknown),
  // one (resolves), or several (ambiguous).
  rolesByName: (name: string) => Promise<number[]>;
  // The canonical ticket id for `#n` in the organization, or null if unknown.
  ticketByNumber: (n: number) => Promise<number | null>;
};

export type ResolutionWarning =
  | { kind: "ambiguous"; reference: string; matches: number }
  | { kind: "unknown"; reference: string };

export type ResolutionResult = { markdown: string; warnings: ResolutionWarning[] };

// A loose reference is a single token: `@` + a name (word chars, dot, hyphen) or
// `#` + digits. The required leading boundary (start of text or whitespace,
// captured so it can be preserved) keeps us off email addresses (`a@b`) and
// mid-word hashes. Multi-word `@"Full Name"` references are out of scope for #38.
//
// Stored as the source string, not a shared RegExp: the matcher is stateful
// (`/g` carries `lastIndex`) and we `await` inside its match loop, so two
// concurrent resolveMentions calls sharing one instance would corrupt each
// other's position. Each call compiles its own.
const REFERENCE_SOURCE = "(^|\\s)(@[\\w.-]+|#\\d+)";

export async function resolveMentions(
  markdown: string,
  resolvers: MentionResolvers,
): Promise<ResolutionResult> {
  const tree = parseBody(markdown);
  const warnings: ResolutionWarning[] = [];

  // Collect text nodes up front; we mutate their parents' children afterwards,
  // which would otherwise disturb an in-progress traversal.
  const targets: { node: Text; parent: Parent }[] = [];
  visit(tree, "text", (node, _index, parent) => {
    if (parent) targets.push({ node, parent });
  });

  for (const { node, parent } of targets) {
    const replacement = await resolveTextValue(node.value, resolvers, warnings);
    if (!replacement) continue;
    // Look the node up by identity at apply time: earlier replacements may have
    // changed sibling counts, but never the identity of a not-yet-processed node.
    const index = parent.children.indexOf(node);
    if (index !== -1) parent.children.splice(index, 1, ...replacement);
  }

  return { markdown: serializeBody(tree), warnings };
}

/**
 * Rewrite one text value into a sequence of inline nodes, replacing resolved
 * references with directives and leaving everything else (including unresolved
 * references) as literal text. Returns null when the value holds no reference at
 * all, so the caller can leave the original node untouched.
 */
async function resolveTextValue(
  value: string,
  resolvers: MentionResolvers,
  warnings: ResolutionWarning[],
): Promise<PhrasingContent[] | null> {
  const reference = new RegExp(REFERENCE_SOURCE, "g");
  const out: PhrasingContent[] = [];
  let cursor = 0;
  let resolvedAny = false;
  let match: RegExpExecArray | null;

  while ((match = reference.exec(value)) !== null) {
    const [, lead, token] = match;
    const tokenStart = match.index + lead.length;
    const before = value.slice(cursor, tokenStart);
    cursor = tokenStart + token.length;

    const directive = await resolveToken(token, resolvers, warnings);
    if (directive) {
      resolvedAny = true;
      if (before) out.push({ type: "text", value: before });
      out.push(directive);
    } else {
      // Unresolved: keep the literal token, merged with the preceding text.
      out.push({ type: "text", value: before + token });
    }
  }

  if (!resolvedAny) return null;

  const tail = value.slice(cursor);
  if (tail) out.push({ type: "text", value: tail });
  return out;
}

async function resolveToken(
  token: string,
  resolvers: MentionResolvers,
  warnings: ResolutionWarning[],
): Promise<TextDirective | null> {
  if (token.startsWith("@")) {
    const name = token.slice(1);
    const ids = await resolvers.rolesByName(name);
    if (ids.length === 1) return mentionDirective(name, ids[0]);
    if (ids.length === 0) {
      warnings.push({ kind: "unknown", reference: token });
    } else {
      warnings.push({ kind: "ambiguous", reference: token, matches: ids.length });
    }
    return null;
  }

  const ticketNumber = Number(token.slice(1));
  const id = await resolvers.ticketByNumber(ticketNumber);
  if (id !== null) return ticketDirective(ticketNumber, id);
  warnings.push({ kind: "unknown", reference: token });
  return null;
}

function mentionDirective(name: string, id: number): TextDirective {
  return {
    type: "textDirective",
    name: "mention",
    attributes: { type: "user", id: String(id) },
    children: [{ type: "text", value: name }],
  };
}

function ticketDirective(ticketNumber: number, id: number): TextDirective {
  return {
    type: "textDirective",
    name: "ticket",
    attributes: { id: String(id) },
    children: [{ type: "text", value: `#${ticketNumber}` }],
  };
}
