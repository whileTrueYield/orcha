import { DocumentationPage } from "@prisma/client";
import { keyBy, map, orderBy } from "lodash";

export interface DocumentationTocTitle {
  id: number;
  title: string;
  position: number;
  parentId?: number | null;
  children: DocumentationTocTitle[];
  parent: DocumentationTocTitle | null;
  filename: string;
}

export const buildToc = (
  pages: DocumentationPage[]
): DocumentationTocTitle[] => {
  const indexedPages = keyBy(
    map(
      pages,
      ({ id, position, parentId, title, customId }): DocumentationTocTitle => ({
        id,
        position,
        parentId,
        parent: null,
        title,
        children: [],
        filename: customId ? `${customId}.html` : `${id}.html`,
      })
    ),
    "id"
  );
  let result: DocumentationTocTitle[] = [];

  for (const pageId in indexedPages) {
    const page = indexedPages[pageId];
    if (page.parentId) {
      indexedPages[page.parentId].children = orderBy(
        [...indexedPages[page.parentId].children, page],
        "position"
      );
      page.parent = indexedPages[page.parentId];
    } else {
      result = orderBy([...result, page], "position");
    }
  }

  return result;
};
