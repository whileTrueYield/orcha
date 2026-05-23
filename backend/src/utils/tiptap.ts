import { TiptapTransformer } from "@hocuspocus/transformer";
import Y from "yjs";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Mention from "@tiptap/extension-mention";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Extensions } from "@tiptap/core";
import { get, kebabCase } from "lodash";
import { generateHTML } from "@tiptap/html";
import { logger } from "../logger";

const extensions: Extensions = [
  Link,
  Image,
  Color,
  StarterKit,
  TaskItem,
  TaskList,
  TextAlign,
  TextStyle,
  Mention.extend({ name: "mentionEmoji" }).configure({
    renderHTML({ node }) {
      return [
        "span",
        {
          class: "emoji",
        },
        node.attrs.id.id,
      ];
    },
  }),
  Mention.extend({ name: "mentionTicket" }),
  Mention.extend({ name: "mentionRole" }),
];

/**
 * When creating a Yjs document from a tiptap document outside of
 * collaborative interface, we need to convert the tiptap document
 * into a Yjs document using the transformer. The transformer needs
 * to know the extensions used in the tiptap editor in the frontend.
 *
 * This sucks a bit because we have some frontend logic/dependencies
 * in the backend but it's the only solution I've found so far aside
 * from removing the content from the create ticket modal.
 *
 * This also means that when the frontend incorporates new extensions
 * we need to update the backend here as well!
 */
export function tiptapToYdoc(doc: any): Y.Doc {
  return TiptapTransformer.toYdoc(doc, "default", extensions as any);
}

/**
 * Finds all the role mentioned in a tiptap document
 * @param doc a tiptap document as a JSON object or a stringified JSON
 * @returns an array of role IDs
 */
export function getMentions(doc: any): number[] {
  const mentions = new Set<number>();

  // since we sometimes capture the tiptap document as a JSON string
  // we'll attempt the parse it here. If it cannot be parsed,
  // we'll return an empty array (no mentions found)
  if (typeof doc === "string") {
    try {
      doc = JSON.parse(doc);
    } catch (e) {
      logger.error("Failed to parse tiptap document");
      return [];
    }
  }

  // YJS stores the document in a default key, case the document
  // comes from a YJS binary, the content is located under the default key
  if (doc.default) {
    doc = doc.default;
  }

  exploreNode(doc);

  function exploreNode(node: any) {
    if (node.type === "mentionRole") {
      const id = parseInt(get(node, "attrs.id.id", ""));
      if (!isNaN(id)) {
        mentions.add(id);
      }
    }

    if (node.content) {
      for (const child of node.content) {
        exploreNode(child);
      }
    }
  }

  return Array.from(mentions);
}

export const htmlSerializer = (node: any) => {
  return generateHTML(node, extensions);
};

type tiptapHeader = { level: number; text: string; hash: string };
export const getHeadersFromTipTapDoc = (doc: any): tiptapHeader[] => {
  const headers: tiptapHeader[] = [];

  if (typeof doc === "string") {
    try {
      doc = JSON.parse(doc);
    } catch (e) {
      logger.error("Failed to parse headers from tiptap document");
      return [];
    }
  }

  exploreNode(doc);

  function exploreNode(node: any) {
    if (node.type === "heading") {
      const level = get(node, "attrs.level", 1);
      const text = getPlainTextFromTipTapDoc(node);
      headers.push({ level, text, hash: kebabCase(text) });
    }

    if (node.content) {
      for (const child of node.content) {
        exploreNode(child);
      }
    }
  }

  return headers;
};

export const getPlainTextFromTipTapDoc = (doc: any): string => {
  if (typeof doc === "string") {
    try {
      doc = JSON.parse(doc);
    } catch (e) {
      logger.error("Failed to parse text from tiptap document");
      return "";
    }
  }

  return exploreNode(doc);

  function exploreNode(node: any): string {
    if (node.type === "text") {
      return node.text.trim();
    }

    if (node.content) {
      return node.content.map(exploreNode).join(" ");
    }

    return "";
  }
};
