import cn from "classnames";
import { TextColorIcon } from "./icons";
import { useCurrentEditor } from "@tiptap/react";
import { ClickTooltip } from "components/help/Tooltip";

const COLORS = [
  "#1e293b", // first color is a reset to default (removes mark)
  "#dc2626",
  "#ea580c",
  "#16a34a",
  "#2563eb",
  "#9333ea",
];

export const TextColorButton: React.FC = () => {
  const { editor } = useCurrentEditor();

  const className = cn(
    "p-1 rounded bg-transparent border border-transparent text-gray-600 hover:bg-white hover:border-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
  );

  if (!editor) {
    return null;
  }

  const currentColor = editor.getAttributes("textStyle").color;

  return (
    <ClickTooltip
      tooltip={(close) => (
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map((color) => (
            <span
              key={color}
              role="button"
              style={{ backgroundColor: color }}
              className="inline-block h-6 w-6 rounded border-2 border-black border-opacity-0 opacity-90 transition-all hover:border-opacity-50 hover:opacity-100"
              onClick={() =>
                editor.chain().focus().setColor(color).run() && close()
              }
            />
          ))}
        </div>
      )}
    >
      <button
        type="button"
        className={className}
        style={{ color: String(currentColor || COLORS[0]) }}
      >
        <TextColorIcon className="h-5 w-5" />
      </button>
    </ClickTooltip>
  );
};
