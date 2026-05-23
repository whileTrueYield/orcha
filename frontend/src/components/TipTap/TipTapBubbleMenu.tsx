import { BubbleMenu, useCurrentEditor } from "@tiptap/react";
import { BoldIcon, ItalicIcon, StrikedThroughIcon } from "./icons";
import React from "react";
import cn from "classnames";
import { CodeIcon } from "@heroicons/react/solid";
import { Editor } from "@tiptap/core";

export const TipTapBubbleMenu: React.FC = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const buttonClassName = (isActive: boolean) =>
    cn("rounded px-1 py-0.5 ", {
      "hover:bg-gray-800 text-gray-100 hover:text-white": !isActive,
      "bg-gray-800 hover:bg-gray-950 text-white": isActive,
    });

  const shouldShow = (editor: Editor): boolean => {
    if (editor.isActive("taskList")) {
      return false;
    }

    if (editor.isActive("paragraph")) {
      return true;
    }

    if (editor.isActive("heading")) {
      return true;
    }

    return false;
  };

  return (
    <BubbleMenu
      shouldShow={({ editor, from, to }) => from !== to && shouldShow(editor)}
    >
      <div className="flex flex-row space-x-0.5 rounded bg-gray-700 p-1">
        <button
          type="button"
          className={buttonClassName(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={buttonClassName(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={buttonClassName(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        >
          <StrikedThroughIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={buttonClassName(editor.isActive("code"))}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
        >
          <CodeIcon className="h-4 w-4" />
        </button>
      </div>
    </BubbleMenu>
  );
};
