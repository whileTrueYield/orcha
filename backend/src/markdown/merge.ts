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

// node-diff3 is ESM-only and ships its types via package.json `exports.types`.
// They resolve to real types because tsconfig.json now uses
// `moduleResolution: "bundler"`; at runtime Node 22's require(esm) loads the ESM
// module from our CommonJS emit.
import { diff3Merge, type MergeRegion } from "node-diff3";

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
 * carries the merged body; a conflict carries both the structured regions that
 * overlapped (`conflicts`) and the whole body rewritten with git merge-file
 * markers (`markered`), so a caller can show either representation without
 * re-running the merge.
 */
export type MergeResult =
  | { clean: true; merged: string }
  | { clean: false; conflicts: ConflictHunk[]; markered: string };

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

  const conflicts = regions.filter(hasConflict).map((region) => ({
    base: region.conflict.o,
    ours: region.conflict.a,
    theirs: region.conflict.b,
  }));

  if (conflicts.length > 0) {
    return { clean: false, conflicts, markered: renderMarkers(regions) };
  }

  const merged = regions.flatMap((region) => region.ok ?? []).join("\n");
  return { clean: true, merged };
}

// Reconstruct the whole body with git merge-file conflict markers: unchanged
// regions pass through verbatim, each overlapping region is wrapped as
// `<<<<<<< ours / ours / ======= / theirs / >>>>>>> theirs`. Built from the same
// region list as `conflicts`, so the markered text and the hunks always agree.
function renderMarkers(regions: MergeRegion<string>[]): string {
  const lines: string[] = [];
  for (const region of regions) {
    if (hasConflict(region)) {
      lines.push("<<<<<<< ours");
      lines.push(...region.conflict.a);
      lines.push("=======");
      lines.push(...region.conflict.b);
      lines.push(">>>>>>> theirs");
    } else {
      lines.push(...(region.ok ?? []));
    }
  }
  return lines.join("\n");
}

// Narrow a diff3 region to the conflict case. node-diff3's MergeRegion carries
// both `ok` and `conflict` as optional fields on one type; the presence of
// `conflict` is what distinguishes an overlapping region from a clean one.
function hasConflict<T>(
  region: MergeRegion<T>,
): region is MergeRegion<T> & {
  conflict: NonNullable<MergeRegion<T>["conflict"]>;
} {
  return region.conflict !== undefined;
}

function toLines(text: string): string[] {
  return text.split("\n");
}
