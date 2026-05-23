import keyBy from "lodash/keyBy";
import map from "lodash/map";
import orderBy from "lodash/orderBy";
import { MiniDocumentationPage } from "types/graphql";

export interface DocumentationTocTitle {
  id: number;
  title: string;
  position: number;
  parentId?: number | null;
  children: DocumentationTocTitle[];
}

export const buildToc = (
  pages: MiniDocumentationPage[]
): DocumentationTocTitle[] => {
  const indexedPages = keyBy(
    map(
      pages,
      ({ id, position, parentId, title }): DocumentationTocTitle => ({
        id,
        position,
        parentId,
        title,
        children: [],
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
    } else {
      result = orderBy([...result, page], "position");
    }
  }

  return result;
};
