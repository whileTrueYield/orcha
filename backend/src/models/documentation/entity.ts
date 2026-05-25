/**
 * Pothos type definitions for the Documentation and DocumentationPage models.
 *
 * Exports:
 *  - DocumentationRef:         prismaObject for Documentation
 *  - DocumentationPageRef:     prismaObject for DocumentationPage
 *  - MiniDocumentationPageRef: lightweight page shape (id, position, parentId, title)
 *  - PaginatedDocumentations:  paginated wrapper for Documentation
 *
 * DocumentationPage exposes indexableContent, urls, and keywords as raw
 * strings. These were previously hidden behind @TypeGraphQL.omit(output: true),
 * which only suppressed codegen — the fields were always queryable via GraphQL
 * and the frontend depends on them.
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import { ModelStageEnum } from "../../schema/enums";

// ---------------------------------------------------------------------------
// Documentation — prismaObject
// ---------------------------------------------------------------------------

export const DocumentationRef = builder.prismaObject("Documentation", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description", { nullable: true }),
    stage: t.expose("stage", { type: ModelStageEnum }),
    logoUrl: t.exposeString("logoUrl", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    lastPublishedAt: t.expose("lastPublishedAt", {
      type: "DateTime",
      nullable: true,
    }),
    lastPublishRequestAt: t.expose("lastPublishRequestAt", {
      type: "DateTime",
      nullable: true,
    }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    documentationPages: t.relation("documentationPages"),

    titles: t.field({
      type: [MiniDocumentationPageRef],
      resolve: async (documentation, _args, ctx) =>
        ctx.prisma.documentationPage.findMany({
          where: { documentationId: documentation.id },
          select: { id: true, title: true, position: true, parentId: true },
        }),
    }),
  }),
});

// ---------------------------------------------------------------------------
// DocumentationPage — prismaObject
// ---------------------------------------------------------------------------

export const DocumentationPageRef = builder.prismaObject("DocumentationPage", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    body: t.exposeString("body"),
    position: t.exposeInt("position"),
    customId: t.exposeString("customId", { nullable: true }),
    indexableContent: t.exposeString("indexableContent"),
    urls: t.exposeString("urls"),
    keywords: t.exposeString("keywords"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    documentationId: t.exposeInt("documentationId"),
    documentation: t.relation("documentation"),
    parentId: t.exposeInt("parentId", { nullable: true }),
    parent: t.relation("parent", { nullable: true }),
    children: t.relation("children"),
  }),
});

// ---------------------------------------------------------------------------
// MiniDocumentationPage — lightweight shape for table-of-contents
// ---------------------------------------------------------------------------

interface MiniDocumentationPageShape {
  id: number;
  position: number;
  parentId: number | null;
  title: string;
}

export const MiniDocumentationPageRef =
  builder.objectRef<MiniDocumentationPageShape>("MiniDocumentationPage");

builder.objectType(MiniDocumentationPageRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    position: t.exposeInt("position"),
    parentId: t.int({ nullable: true, resolve: (p) => p.parentId }),
    title: t.exposeString("title"),
  }),
});

// ---------------------------------------------------------------------------
// Paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedDocumentations = createPaginatedType(
  "Documentations",
  DocumentationRef,
);
