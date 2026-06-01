/**
 * Build the per-heading search blocks the published documentation site indexes
 * (PRD #36, issue #44).
 *
 * Each heading in a page's Markdown body starts a new search block, anchored so
 * the static-site search can deep-link to it; the text between headings is the
 * block body. Replaces the old Tiptap-JSON + Yjs (`.bytes`) walk — search is now
 * built from the Markdown source of truth (ADR 0007).
 *
 * The input is narrowed to just what we read (page identity/title + markdown), so
 * the Prisma page the publish job loads satisfies it structurally.
 */
import { toSections } from "../../../markdown/sections";

export interface SearchDocument {
  id: string;
  body: string;
  title: string;
  pageTitle: string;
}

export interface SearchablePage {
  id: number;
  customId: string | null;
  title: string;
  documentationPageText: { markdown: string } | null;
}

export const buildSearchDocuments = (page: SearchablePage): SearchDocument[] => {
  const pageId = page.customId ? page.customId : `${page.id}`;
  const markdown = page.documentationPageText?.markdown ?? "";

  return toSections(markdown).map((section) => ({
    id: section.anchor ? `${pageId}#${section.anchor}` : `${pageId}`,
    title: section.title,
    body: section.body,
    pageTitle: page.title,
  }));
};
