import React from "react";
import cn from "classnames";
import { XIcon } from "@heroicons/react/solid";

export interface TagProps extends React.HTMLProps<HTMLSpanElement> {
  className?: string;
  round?: boolean;
  large?: boolean;
  actionBgColor?: string;
  onDelete?: () => void;
}

export const Tag: React.FC<TagProps> = (props) => {
  const {
    className,
    round,
    large,
    actionBgColor,
    onDelete,
    children,
    ...otherProps
  } = props;

  const tagClassName = cn(
    "group overflow-hidden inline-flex items-center py-0.5 font-medium truncate",
    {
      "rounded-md tracking-wide": !round,
      "rounded-full": round,
      "text-gray-800 bg-gray-100": !className,
      "px-3 text-sm leading-5": large,
      "px-3 text-xs leading-4": !large,
      relative: onDelete,
    },
    className
  );

  const actionClassName = cn(
    "cursor-pointer absolute opacity-0 group-hover:opacity-100 duration-200 translate-x-4 group-hover:translate-x-0 transform active:bg-white active:text-gray-600",
    actionBgColor,
    {
      "w-6 h-6 p-1 top-0 right-0": large,
      "w-5 h-5 p-1 top-0 right-0": !large,
      "rounded-full": round,
      "rounded-r-md": !round,
    }
  );

  if (onDelete) {
    const subClassName = cn("transition duration-200 transform truncate", {
      "group-hover:-translate-x-3": large,
      "group-hover:-translate-x-2.5": !large,
    });
    return (
      <span className={tagClassName} {...otherProps}>
        <span className={subClassName}>{children}</span>
        <button type="button" onClick={onDelete}>
          <XIcon className={actionClassName} />
        </button>
      </span>
    );
  } else {
    return (
      <span className={tagClassName} {...otherProps}>
        {children}
      </span>
    );
  }
};
