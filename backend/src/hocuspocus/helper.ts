import * as Y from "yjs";

/**
 * Provides a default template for the Yjs editor. This is used for
 * any new project or documentation page.
 * @returns
 */
export const getInitialYjsDocument = () => {
  return Y.encodeStateAsUpdate(new Y.Doc());
};
