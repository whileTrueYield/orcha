import { DocumentationPage, DocumentationPageText } from "@prisma/client";
import { getDocFromBytes } from "../../../utils/yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { kebabCase } from "lodash";
import { getPlainTextFromTipTapDoc } from "../../../utils/tiptap";

export interface SearchDocument {
  id: string;
  body: string;
  title: string;
  pageTitle: string;
}

// Generate a JSON to be used by the frontend search engine
export const buildSearchDocuments = (
  page: DocumentationPage & {
    documentationPageText: DocumentationPageText | null;
  },
): SearchDocument[] => {
  const searchDocuments: SearchDocument[] = [];
  const id = page.customId ? page.customId : page.id;
  let currentBlock: SearchDocument = {
    pageTitle: page.title,
    id: `${id}`,
    title: "",
    body: "",
  };

  if (page.documentationPageText?.bytes) {
    const doc = getDocFromBytes(page.documentationPageText.bytes);
    const document = TiptapTransformer.fromYdoc(doc);
    for (const node of document.content) {
      if (node.type === "heading") {
        // add the current block to the pile of document only
        // if we added some information to it
        const title = getPlainTextFromTipTapDoc(node);
        currentBlock = {
          pageTitle: page.title,
          id: `${id}#${kebabCase(title)}`,
          title,
          body: "",
        };
        searchDocuments.push(currentBlock);
      } else {
        currentBlock.body = `${currentBlock.body} ${getPlainTextFromTipTapDoc(node)}`;
      }
    }
  }

  return searchDocuments;
};
