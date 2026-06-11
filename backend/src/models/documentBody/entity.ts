/**
 * DocumentBody GraphQL types (#40) — the GraphQL face of a Markdown document
 * body and its write result.
 *
 * Exports: DocumentBodyRef, DocumentBodyTypeEnum, DocumentBodyConflictRef,
 * ConflictRegionRef, ConflictRegionKindEnum, MentionWarningRef,
 * SaveDocumentBodyResultRef (+ their TS shapes).
 *
 * A body is the Markdown source of truth (ADR 0007) plus its optimistic-
 * concurrency version. It is shared by every document type (ticket, project,
 * documentation page), so the types are defined once here and the per-parent
 * `body` fields plus the `saveDocumentBody` mutation resolve them through the
 * body repository.
 */

import builder from "../../schema/builder";

export type DocumentBodyShape = { markdown: string; version: number };

export const DocumentBodyRef =
  builder.objectRef<DocumentBodyShape>("DocumentBody");

builder.objectType(DocumentBodyRef, {
  fields: (t) => ({
    markdown: t.exposeString("markdown"),
    // The version doubles as the ETag for optimistic concurrency.
    version: t.exposeInt("version"),
  }),
});

// The three document kinds, mapped to the body repository's BodyType strings so
// resolvers receive the internal value directly. UPPERCASE GraphQL values keep
// the public enum idiomatic.
export const DocumentBodyTypeEnum = builder.enumType("DocumentBodyType", {
  values: {
    TICKET: { value: "ticket" },
    PROJECT: { value: "project" },
    DOCUMENTATION: { value: "documentation" },
  } as const,
});

// A conflict carries the git-markered Markdown (kept for the REST 409 body) and
// an ordered list of regions the UI renders as a side-by-side picker, plus the
// current stored version the writer must rebase onto. Returned without writing.
export type ConflictRegionShape = {
  kind: "STABLE" | "CONFLICT";
  lines: string[];
  ours: string[];
  theirs: string[];
};

export type DocumentBodyConflictShape = {
  markdown: string;
  version: number;
  regions: ConflictRegionShape[];
};

// value === name, so no reverse-mapping is needed when resolving the field.
export const ConflictRegionKindEnum = builder.enumType("ConflictRegionKind", {
  values: ["STABLE", "CONFLICT"] as const,
});

export const ConflictRegionRef =
  builder.objectRef<ConflictRegionShape>("ConflictRegion");

builder.objectType(ConflictRegionRef, {
  fields: (t) => ({
    kind: t.field({ type: ConflictRegionKindEnum, resolve: (r) => r.kind }),
    // Predictable shape: every field is always present. For a STABLE region
    // `lines` holds the text and `ours`/`theirs` are empty; for a CONFLICT it's
    // the reverse. An empty `ours`/`theirs` on a conflict means a deletion.
    lines: t.stringList({ resolve: (r) => r.lines }),
    ours: t.stringList({ resolve: (r) => r.ours }),
    theirs: t.stringList({ resolve: (r) => r.theirs }),
  }),
});

export const DocumentBodyConflictRef =
  builder.objectRef<DocumentBodyConflictShape>("DocumentBodyConflict");

builder.objectType(DocumentBodyConflictRef, {
  fields: (t) => ({
    markdown: t.exposeString("markdown"),
    version: t.exposeInt("version"),
    regions: t.field({
      type: [ConflictRegionRef],
      resolve: (r) => r.regions,
    }),
  }),
});

// An unresolved reference the writer typed: either unknown (no match) or
// ambiguous (several). `matches` is the count for the ambiguous case, null for
// unknown. Surfaced, never guessed (ADR 0007).
export type MentionWarningShape = {
  kind: string;
  reference: string;
  matches: number | null;
};

export const MentionWarningRef =
  builder.objectRef<MentionWarningShape>("MentionWarning");

builder.objectType(MentionWarningRef, {
  fields: (t) => ({
    kind: t.exposeString("kind"),
    reference: t.exposeString("reference"),
    matches: t.exposeInt("matches", { nullable: true }),
  }),
});

// Predictable discriminated result: exactly one of `body` (success) / `conflict`
// (overlap) is non-null. `warnings` lists unresolved mentions on a success.
export type SaveDocumentBodyResultShape = {
  body: DocumentBodyShape | null;
  conflict: DocumentBodyConflictShape | null;
  warnings: MentionWarningShape[];
};

export const SaveDocumentBodyResultRef =
  builder.objectRef<SaveDocumentBodyResultShape>("SaveDocumentBodyResult");

builder.objectType(SaveDocumentBodyResultRef, {
  fields: (t) => ({
    body: t.field({
      type: DocumentBodyRef,
      nullable: true,
      resolve: (r) => r.body,
    }),
    conflict: t.field({
      type: DocumentBodyConflictRef,
      nullable: true,
      resolve: (r) => r.conflict,
    }),
    warnings: t.field({
      type: [MentionWarningRef],
      resolve: (r) => r.warnings,
    }),
  }),
});
