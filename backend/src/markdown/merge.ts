/**
 * 3-way merge core for Markdown document bodies (PRD #36, issue #37).
 *
 * Public API:
 *   - merge(base, ours, theirs): MergeResult
 *   - types MergeResult, ConflictHunk
 *
 * This is the correctness core of the optimistic-concurrency model described in
 * ADR 0007: a writer sends the `base` revision it started editing from, and we
 * reconcile its `ours` edit against the `theirs` edit already on the server.
 * When the two sides changed regions separated by unchanged text we return a
 * single merged body; when their changes meet with no stable line between them
 * we return the conflicting regions for a human (or the LLM) to resolve, rather
 * than silently picking a winner — exactly the behaviour `git merge-file`
 * produces, which is the semantics we are matching.
 *
 * Reconciliation is delegated to node-diff3, a dependency-free implementation of
 * the diff3 algorithm (the same model git uses). We considered jsdiff's
 * `Diff.merge`, but it is an undocumented patch-interleaver, not a true 3-way
 * merge, and mis-flags edits that are far apart as conflicts. This module is
 * pure and synchronous: it performs no I/O and knows nothing about HTTP,
 * storage, or the editor. It owns only the contract — a predictable,
 * discriminated result shape — and the line-level (de)serialisation.
 */

// node-diff3 ships official types via package.json "exports".types, but this
// project's classic `moduleResolution: "node"` predates `exports` and can't read
// them, so this import is `any` at compile time (types aren't enforced in the
// ts-node transpile-only test path either). The runtime resolver loads it fine.
// To get the real types, modernise moduleResolution — a separate, cross-cutting
// migration, not part of this slice.
import { diff3Merge } from "node-diff3";

/**
 * One region the two sides changed with no unchanged line between them. `base`
 * is the common ancestor text; `ours`/`theirs` are the competing replacements.
 * Lines carry no markers; an empty array means that side has nothing there.
 */
export type ConflictHunk = {
  base: string[];
  ours: string[];
  theirs: string[];
};

/**
 * Always the same shape regardless of outcome: branch on `clean`. A clean merge
 * carries the merged body; a conflict carries the regions that overlapped.
 */
export type MergeResult =
  | { clean: true; merged: string }
  | { clean: false; conflicts: ConflictHunk[] };

export function merge(
  base: string,
  ours: string,
  theirs: string,
): MergeResult {
  // Degenerate cases, decided purely so trivial merges never depend on the diff
  // engine and round-trip the body byte-for-byte.
  if (ours === theirs) return { clean: true, merged: ours };
  if (base === ours) return { clean: true, merged: theirs };
  if (base === theirs) return { clean: true, merged: ours };

  // Split on newlines without trimming the trailing empty element, so join is
  // the exact inverse and the merged body preserves the original line structure.
  const regions = diff3Merge(toLines(ours), toLines(base), toLines(theirs), {
    excludeFalseConflicts: true,
  });

  const conflicts = regions
    .filter(isConflict)
    .map(({ conflict }) => ({
      base: conflict.o,
      ours: conflict.a,
      theirs: conflict.b,
    }));

  if (conflicts.length > 0) {
    return { clean: false, conflicts };
  }

  const merged = regions.flatMap((region) => (region as OkRegion).ok).join("\n");
  return { clean: true, merged };
}

type OkRegion = { ok: string[] };
type ConflictRegion = { conflict: { a: string[]; o: string[]; b: string[] } };

function isConflict(region: OkRegion | ConflictRegion): region is ConflictRegion {
  return "conflict" in region;
}

function toLines(text: string): string[] {
  return text.split("\n");
}
