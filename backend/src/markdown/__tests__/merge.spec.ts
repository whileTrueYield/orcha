/**
 * Behavior tests for the 3-way Markdown merge core (PRD #36, issue #37).
 *
 * `merge(base, ours, theirs)` is the correctness core of the optimistic-
 * concurrency model: a writer sends the base version it started from, and the
 * server either returns a clean merged Markdown body (the two sides touched
 * different regions) or a conflict result naming the regions that overlap. The
 * module is pure and synchronous — no storage, HTTP, or editor — so these tests
 * exercise it purely through the `merge` interface. They are the primary
 * deliverable proving correctness, combining worked examples with property-
 * based invariants.
 */

import expect from "expect";
import fc from "fast-check";
import { merge } from "../merge";

describe("3-way markdown merge", () => {
  it("auto-merges edits to different regions into one clean body", () => {
    const base = "# Title\n\nintro paragraph\n\nclosing paragraph\n";
    const ours = "# Title\n\nintro paragraph, expanded\n\nclosing paragraph\n";
    const theirs = "# Title\n\nintro paragraph\n\nclosing paragraph, revised\n";

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(true);
    if (!result.clean) throw new Error("expected a clean merge");
    expect(result.merged).toBe(
      "# Title\n\nintro paragraph, expanded\n\nclosing paragraph, revised\n",
    );
  });

  it("is idempotent when both sides make the identical edit", () => {
    const base = "# Title\n\nold body\n";
    const edit = "# Title\n\nnew body\n";

    const result = merge(base, edit, edit);

    expect(result.clean).toBe(true);
    if (!result.clean) throw new Error("expected a clean merge");
    // The shared change applies once — never doubled into "new body\nnew body".
    expect(result.merged).toBe(edit);
  });

  it("takes theirs when only theirs changed (base == ours)", () => {
    const base = "# Title\n\nbody\n";
    const theirs = "# Title\n\nbody, edited by them\n";

    const result = merge(base, base, theirs);

    expect(result).toEqual({ clean: true, merged: theirs });
  });

  it("takes ours when only ours changed (base == theirs)", () => {
    const base = "# Title\n\nbody\n";
    const ours = "# Title\n\nbody, edited by us\n";

    const result = merge(base, ours, base);

    expect(result).toEqual({ clean: true, merged: ours });
  });

  it("returns the unchanged body when nothing changed (all equal)", () => {
    const base = "# Title\n\nbody\n";

    const result = merge(base, base, base);

    expect(result).toEqual({ clean: true, merged: base });
  });

  it("reports a conflict identifying the region both sides changed", () => {
    const base = "line one\nline two\nline three\n";
    const ours = "line one, ours\nline two\nline three\n";
    const theirs = "line one, theirs\nline two\nline three\n";

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.conflicts).toEqual([
      {
        base: ["line one"],
        ours: ["line one, ours"],
        theirs: ["line one, theirs"],
      },
    ]);
  });

  // Reassemble a region list by picking one side per conflict — the inverse of
  // how merge() split the body. Mirrors the frontend resolver's reassembly.
  const assemble = (
    regions: { kind: string; lines?: string[]; ours?: string[]; theirs?: string[] }[],
    pick: "ours" | "theirs",
  ) =>
    regions
      .flatMap((r) => (r.kind === "stable" ? r.lines! : r[pick]!))
      .join("\n");

  it("exposes ordered regions that reassemble to each side", () => {
    const base = "line one\nline two\nline three\n";
    const ours = "line one, ours\nline two\nline three\n";
    const theirs = "line one, theirs\nline two\nline three\n";

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.regions).toEqual([
      { kind: "conflict", ours: ["line one, ours"], theirs: ["line one, theirs"] },
      { kind: "stable", lines: ["line two", "line three", ""] },
    ]);
    expect(assemble(result.regions, "ours")).toBe(ours);
    expect(assemble(result.regions, "theirs")).toBe(theirs);
  });

  it("represents a one-sided deletion as a conflict region with an empty side", () => {
    const base = "x\nb\ny\n";
    const ours = "x\ny\n"; // we deleted b
    const theirs = "x\nb edited\ny\n"; // they edited b

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.regions).toEqual([
      { kind: "stable", lines: ["x"] },
      { kind: "conflict", ours: [], theirs: ["b edited"] },
      { kind: "stable", lines: ["y", ""] },
    ]);
  });

  it("renders the conflict as git-style markered Markdown", () => {
    const base = "line one\nline two\nline three\n";
    const ours = "line one, ours\nline two\nline three\n";
    const theirs = "line one, theirs\nline two\nline three\n";

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    // The conflicting region is wrapped in git merge-file markers; the unchanged
    // tail (and the body's trailing newline) is preserved verbatim.
    expect(result.markered).toBe(
      "<<<<<<< ours\n" +
        "line one, ours\n" +
        "=======\n" +
        "line one, theirs\n" +
        ">>>>>>> theirs\n" +
        "line two\nline three\n",
    );
  });

  it("reports a conflict when both sides write different bodies from empty", () => {
    const result = merge("", "first author wins\n", "second author wins\n");

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.conflicts).toEqual([
      {
        base: [],
        ours: ["first author wins"],
        theirs: ["second author wins"],
      },
    ]);
  });

  it("conflicts on adjacent edits with no unchanged line between them", () => {
    // No common line separates the two changed lines, so there is no anchor to
    // split on — a genuine conflict. This is exactly what `git merge-file`
    // produces for the same inputs; we pin it so the behaviour can't silently
    // drift into a guess.
    const base = "alpha\nbeta\n";
    const ours = "alpha edited\nbeta\n";
    const theirs = "alpha\nbeta edited\n";

    const result = merge(base, ours, theirs);

    expect(result.clean).toBe(false);
    if (result.clean) throw new Error("expected a conflict");
    expect(result.conflicts).toEqual([
      {
        base: ["alpha", "beta"],
        ours: ["alpha edited", "beta"],
        theirs: ["alpha", "beta edited"],
      },
    ]);
  });

  // Property: edits that touch different body lines auto-merge AS LONG AS an
  // unchanged anchor line separates them — the real guarantee of 3-way merge
  // (adjacent anchor-less edits legitimately conflict; see the example above).
  // We interleave a never-edited `anchor-i` line before every editable body
  // line, so any two opposing edits always have a stable line between them. All
  // lines are index-tagged to keep diff alignment unambiguous.
  it("auto-merges edits to body lines separated by anchors (property)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("none", "ours", "theirs"), {
          minLength: 1,
          maxLength: 10,
        }),
        (sides) => {
          const body = (lines: string[]) => lines.join("\n") + "\n";
          // Each slot is an unchanged `anchor-i` line followed by a body line
          // that only the named side may have edited.
          const slots = (editedBy: "ours" | "theirs" | "expected") =>
            sides.flatMap((side, i) => {
              const applies =
                editedBy === "expected" ? side !== "none" : side === editedBy;
              const body = applies ? `body-${i}-${side}` : `body-${i}-base`;
              return [`anchor-${i}`, body];
            });

          const result = merge(
            body(sides.flatMap((_, i) => [`anchor-${i}`, `body-${i}-base`])),
            body(slots("ours")),
            body(slots("theirs")),
          );

          expect(result).toEqual({ clean: true, merged: body(slots("expected")) });
        },
      ),
    );
  });

  // Property: merging any body against itself is the identity — no phantom
  // conflicts, no rewriting. This pins the no-op case across arbitrary content.
  it("merges a body with itself to the unchanged body (property)", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        expect(merge(text, text, text)).toEqual({ clean: true, merged: text });
      }),
    );
  });
});
