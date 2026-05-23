interface TipTapDoc extends Record<string, any> {
  type: string;
  content: any[];
}

/**
 * Convert a markdown string into a proseMirror/TipTap JSON document
 * @param md
 */
export function markdownToTipTapDoc(md: string): TipTapDoc {
  return {
    type: "doc",
    content: md
      .split("\n")
      .map(parseMdBlock)
      .filter((x) => x), // remove null blocks
  };
}

let bulletList: null | { content: any[]; type: "bulletList" } = null;
let orderedList: null | {
  content: any[];
  type: "orderedList";
  attrs: { start: 1 };
} = null;

function parseMdBlock(block: string): any {
  if (block.startsWith("- ")) {
    if (bulletList) {
      bulletList.content.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [{ type: "text", text: block.slice(2) || "_" }],
          },
        ],
      });
      return null;
    } else {
      bulletList = {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                attrs: { textAlign: "left" },
                content: [{ type: "text", text: block.slice(2) || "_" }],
              },
            ],
          },
        ],
      };
      return bulletList;
    }
  } else {
    bulletList = null;
  }

  if (block.startsWith("1. ")) {
    if (orderedList) {
      orderedList.content.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "left" },
            content: [{ type: "text", text: block.slice(3) || "_" }],
          },
        ],
      });
      return null;
    } else {
      orderedList = {
        type: "orderedList",
        attrs: {
          start: 1,
        },
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                attrs: { textAlign: "left" },
                content: [{ type: "text", text: block.slice(3) || "_" }],
              },
            ],
          },
        ],
      };
      return orderedList;
    }
  } else {
    orderedList = null;
  }

  if (block.startsWith("### ")) {
    return {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: block.slice(4) || "_" }],
    };
  }

  if (block.startsWith("## ")) {
    return {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: block.slice(3) || "_" }],
    };
  }

  if (block.startsWith("# ")) {
    return {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: block.slice(2) || "_" }],
    };
  }

  if (block.trim().length > 0) {
    return {
      type: "paragraph",
      attrs: { textAlign: "left" },
      content: [{ type: "text", text: block }],
    };
  }
}
