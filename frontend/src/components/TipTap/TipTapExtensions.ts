import StarterKit from "@tiptap/starter-kit";
import { Extensions } from "@tiptap/core";

import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { TipTapDrawing } from "./extensions/Drawing";
import Mention from "@tiptap/extension-mention";
import { ticketSuggestion } from "./extensions/suggestion/ticketSuggestion";
import { roleSuggestion } from "./extensions/suggestion/roleSuggestion";
import Placeholder from "@tiptap/extension-placeholder";
import { emojiSuggestion } from "./extensions/suggestion/emojiSuggestion";
import { PasteFileEventHandler } from "./extensions/PasteFileEventHandler";
import { Collaboration } from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { showTicketEditModal } from "actions";
import { AppDispatch } from "store";
import randomColor from "randomcolor";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Role } from "types/graphql";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlock, { lowlight } from "./extensions/CodeBlock/CodeBlock";

const color = randomColor();

interface getTipTapExtensionsArgs {
  withCollab?: { provider: HocuspocusProvider; role?: Role | null };
  withRoleMention?: boolean;
  withDrawing?: boolean;
  withTicketMention?: boolean;
  withTaskList?: boolean;
  placeholder?: string;
}

export function getTipTapExtensions(
  dispatch: AppDispatch,
  options: getTipTapExtensionsArgs = {},
): Extensions {
  const extensions: Extensions = [
    Image.configure({
      HTMLAttributes: {
        class: ["block", "max-w-full", "max-h-124"],
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),

    PasteFileEventHandler,
    Link.configure({
      autolink: true,
      linkOnPaste: true,
      openOnClick: true,
      HTMLAttributes: {
        class:
          "underline font-normal text-sky-700 hover:text-sky-500 hover:no-underline cursor-pointer break-words",
        spellcheck: "false",
      },
    }),
    TextStyle,
    Color.configure({ types: [TextStyle.name] }),
    // This is a suggestion for emoji, using the ":" as trigger
    Mention.extend({ name: "mentionEmoji" }).configure({
      // return the text value for copy-pasting
      renderText({ node }) {
        return node.attrs.label ?? node.attrs.id.label;
      },
      renderHTML({ node }) {
        return [
          "span",
          {
            class: "emoji",
          },
          node.attrs.id.id,
        ];
      },
      suggestion: emojiSuggestion,
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlock);
      },
    }).configure({ lowlight, HTMLAttributes: { class: ["not-prose"] } }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      codeBlock: false,
      history: options.withCollab ? false : undefined,
    }),
  ];

  if (options.withDrawing) {
    extensions.push(TipTapDrawing);
  }

  if (options.withTaskList) {
    extensions.push(
      TaskList.configure({ HTMLAttributes: { class: ["not-prose"] } }),
    );
    extensions.push(
      TaskItem.configure({
        nested: false,
        HTMLAttributes: {
          class: ["flex flex-row items-center"],
        },
      }),
    );
  }

  if (options.withRoleMention) {
    // This is a suggestion for role, using the "@" as trigger
    extensions.push(
      Mention.extend({ name: "mentionRole" }).configure({
        // return the text value for copy-pasting
        renderText({ options, node }) {
          return `${options.suggestion.char}${
            node.attrs.label ?? node.attrs.id.label
          }`;
        },
        renderHTML({ options, node }) {
          return [
            "span",
            {
              class:
                "inline-flex items-center rounded-md bg-sky-50 px-2 py-px text-sm font-medium text-sky-800 ring-1 ring-inset ring-sky-600/20",
            },
            `${options.suggestion.char}${
              node.attrs.label ?? node.attrs.id.label
            }`,
          ];
        },
        suggestion: roleSuggestion,
      }),
    );
  }

  if (options.withTicketMention) {
    // This is a suggestion for ticket, using the "#" as trigger
    extensions.push(
      Mention.extend({ name: "mentionTicket" }).configure({
        // return the text value for copy-pasting
        renderText({ options, node }) {
          return `${options.suggestion.char}${
            node.attrs.label ?? node.attrs.id.label
          }`;
        },
        renderHTML({ options, node }) {
          const domNode = document.createElement("button");
          domNode.type = "button";
          domNode.innerHTML = `${options.suggestion.char}${
            node.attrs.label ?? node.attrs.id.label
          }`;
          domNode.onclick = () =>
            dispatch(showTicketEditModal(parseInt(node.attrs.id.id)));
          domNode.className =
            "inline-flex items-center rounded-md hover:bg-yellow-100 bg-yellow-50 px-2 py-px text-sm font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 hover:ring-yellow-600/40";
          return domNode;
        },
        suggestion: ticketSuggestion,
      }),
    );
  }

  if (options.placeholder) {
    extensions.push(
      Placeholder.configure({ placeholder: options.placeholder }),
    );
  }

  if (options.withCollab) {
    const { provider, role } = options.withCollab;
    extensions.push(
      Collaboration.configure({
        document: provider.document,
      }),
    );
    extensions.push(
      CollaborationCursor.configure({
        provider,
        user: {
          name: role?.name || "unknown",
          color,
        },
      }),
    );
  }

  return extensions;
}
