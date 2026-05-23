import { FolderIcon } from "@heroicons/react/outline";
import React from "react";
import cn from "classnames";

interface Props extends React.ComponentProps<"button"> {
  isActive: boolean;
}

export const ExplorerProjectButton: React.FC<Props> = (props) => {
  const { isActive, ...buttonProps } = props;

  const className = cn(
    "flex h-9 w-9 items-center justify-center rounded transition hover:bg-gray-200 hover:text-brand-600",
    props.className,
    {
      "bg-brand-100 text-brand-600": props.isActive,
      "text-gray-400": !props.isActive,
    }
  );

  return (
    <button
      type="button"
      {...buttonProps}
      className={className}
      sr-only="display projects tree"
      title="Display projects"
    >
      <FolderIcon className="h-6 w-6" />
    </button>
  );
};
