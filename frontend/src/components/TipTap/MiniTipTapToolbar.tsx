import { CodeIcon } from "@heroicons/react/outline";
import { useCurrentEditor } from "@tiptap/react";
import cn from "classnames";
import {
  BlockQuoteIcon,
  BoldIcon,
  BulletedListIcon,
  CodeBlockIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  ItalicIcon,
  NumberedListIcon,
  StrikedThroughIcon,
} from "./icons";
import { TextColorButton } from "./TextColorButton";
import { HoverTooltip } from "components/help/Tooltip";

interface Props {
  className?: string;
}

export const MiniTipTapToolbar: React.FC<Props> = (props) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const className = cn(
    "my-1 flex min-w-0 flex-row items-center justify-start divide-x overflow-x-auto overscroll-x-contain",
    props.className
  );

  const buttonClassName = (isActive?: boolean) =>
    cn("p-1 rounded border", {
      "bg-transparent border-transparent hover:bg-white hover:border-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-800":
        !isActive,
      "bg-brand-100 border-brand-300 text-brand-700 hover:bg-brand-300 hover:text-brand-700":
        isActive,
    });

  return (
    <div className={className}>
      <div className="flex flex-row space-x-1 pr-2">
        <HoverTooltip className="inline-flex" tooltip="Bold">
          <button
            type="button"
            className={buttonClassName(editor.isActive("bold"))}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            <BoldIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Italic">
          <button
            type="button"
            className={buttonClassName(editor.isActive("italic"))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Strikethrough">
          <button
            type="button"
            className={buttonClassName(editor.isActive("strike"))}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
          >
            <StrikedThroughIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Inline Code">
          <button
            type="button"
            className={buttonClassName(editor.isActive("code"))}
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
          >
            <CodeIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <TextColorButton />
      </div>

      <div className="flex flex-row space-x-1 px-2">
        <HoverTooltip className="inline-flex" tooltip="Text Color">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClassName(editor.isActive("bulletList"))}
          >
            <BulletedListIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Text Color">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClassName(editor.isActive("orderedList"))}
          >
            <NumberedListIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
      </div>
      <div className="flex flex-row space-x-1 px-2">
        <HoverTooltip className="inline-flex" tooltip="Heading 1">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={buttonClassName(
              editor.isActive("heading", { level: 1 })
            )}
          >
            <H1Icon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Heading 2">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={buttonClassName(
              editor.isActive("heading", { level: 2 })
            )}
          >
            <H2Icon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Heading 3">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={buttonClassName(
              editor.isActive("heading", { level: 3 })
            )}
          >
            <H3Icon className="h-5 w-5" />
          </button>
        </HoverTooltip>
      </div>
      <div className="flex flex-row space-x-1 px-2">
        <HoverTooltip className="inline-flex" tooltip="Code Block">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={buttonClassName(editor.isActive("codeBlock"))}
          >
            <CodeBlockIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
        <HoverTooltip className="inline-flex" tooltip="Quote">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={buttonClassName(editor.isActive("blockquote"))}
          >
            <BlockQuoteIcon className="h-5 w-5" />
          </button>
        </HoverTooltip>
      </div>
    </div>
  );
};
