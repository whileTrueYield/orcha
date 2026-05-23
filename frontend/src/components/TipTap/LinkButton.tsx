import cn from "classnames";
import { HoverTooltip } from "components/help/Tooltip";
import { useCurrentEditor } from "@tiptap/react";

interface MarkButtonProps {
  icon: React.ReactNode;
  tooltip?: React.ReactNode;
}

export const LinkButton: React.FC<MarkButtonProps> = ({ icon, tooltip }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const isActive = editor.isActive("link");
  const className = cn("p-1 rounded", {
    "bg-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-700":
      !isActive,
    "bg-brand-100 text-brand-700 hover:bg-brand-200 hover:text-brand-600":
      isActive,
  });

  if (tooltip) {
    return (
      <HoverTooltip tooltip={tooltip}>
        <button
          type="button"
          className={className}
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
          }}
        >
          {icon}
        </button>
      </HoverTooltip>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }}
    >
      {icon}
    </button>
  );
};
