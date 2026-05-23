import * as Y from "yjs";
import * as decoding from "lib0/decoding";

/**
 * Convert a "Bytes" record (like the one stored in postgres) into a Yjs Doc.
 * @param bytes the data, like DocumentationPageContent.bytes
 * @returns
 */
export const getDocFromBytes = (bytes: Buffer): Y.Doc => {
  const doc = new Y.Doc();
  const decoder = decoding.createDecoder(bytes);
  Y.applyUpdate(doc, decoder.arr);

  return doc;
};
