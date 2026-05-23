type Document = {
  default: {
    content: Content[];
  };
};

type Content = TextContent | BlockContent;

interface TextContent {
  type: "text";
  text: string;
}

const BlockTypes = ["paragraph", "heading", "blockquote", "codeBlock"] as const;

interface BlockContent {
  type: (typeof BlockTypes)[number];
  content: Content[];
}

/**
 * Extract text from a Y.doc TipTap document. Note that this
 * function expects the content to be stored under the `default`
 * key of the JSON object.
 *
 * A typical TipTap document will require
 * you to add the default key:
 *
 *     getTextFromTipTapJson({default: content})
 *
 * @param json
 * @returns
 */
export function getTextFromTipTapJson(json: Document): string {
  if ("default" in json === false) {
    throw new Error(`"default" key not found in the JSON object`);
  }

  const str: string[] = [];
  for (const content of json.default.content) {
    if ("content" in content) {
      str.push("\n");
      str.push(...exploreNode(content));
    }
  }

  return str.join("");
}

export function exploreNode(node: Content): string {
  if (node.type === "text") {
    return node.text;
  } else if ("content" in node) {
    return node.content.map(exploreNode).join("");
  }

  return "";
}
