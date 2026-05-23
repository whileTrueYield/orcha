import React from "react";
import cn from "classnames";
import { XIcon } from "@heroicons/react/solid";
import { Link } from "react-router-dom";

interface Props {
  className?: string;
  groupBgColor?: string;
  bgColor?: string;
  actionBgColor?: string;
  label?: string | React.ReactElement;
  groupLabel?: string | React.ReactElement;
  round?: boolean;
  large?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
  to?: string;
}

export const GroupTag: React.FC<Props> = (props) => {
  const {
    className,
    round,
    large,
    label,
    groupLabel,
    groupBgColor,
    bgColor,
    actionBgColor,
    onDelete,
    onClick,
    to,
    ...otherProps
  } = props;

  const groupClassName = cn(
    "shrink-0 inline-flex items-center overflow-hidden whitespace-nowrap",
    {
      "rounded-l-md tracking-wide": !round,
      "rounded-l-full ": round,
      "py-0.5 text-sm leading-5": large,
      "py-0.5 text-xs leading-4": !large,
      "pl-3 pr-2": large && round,
      "pl-2.5 pr-1.5": (large && !round) || (!large && round),
      "px-2": !large && !round,
    },
    groupBgColor
  );

  const labelClassName = cn(
    "inline-flex items-center overflow-hidden whitespace-nowrap min-w-0",
    {
      "rounded-r-md tracking-wide": !round,
      "rounded-r-full": round,
      "py-0.5 text-sm leading-5 px-2": large,
      "py-0.5 text-xs leading-4 px-1": !large,
      "text-gray-800 bg-gray-100": !bgColor,
      "group-hover:shadow-tag transition": onDelete,
    },
    bgColor
  );

  const containerClassName = cn(
    " min-w-0 font-medium inline-flex flex-row items-center group overflow-hidden",
    className,
    {
      "rounded-md tracking-wide": !round,
      "rounded-full ": round,
      "text-gray-800 bg-gray-200": !className,
      relative: onDelete,
    }
  );

  const actionClassName = cn(
    "cursor-pointer absolute opacity-0 group-hover:opacity-100 duration-200 translate-x-5 group-hover:translate-x-0 transform",
    actionBgColor,
    {
      "w-6 h-6 p-1 top-0 right-0": large,
      "w-5 h-5 p-1 top-0 right-0": !large,
      "rounded-full": round,
      "rounded-r-md": !round,
    }
  );

  const renderContent = () => {
    if (to) {
      return (
        <Link
          to={to}
          className="transform truncate whitespace-nowrap text-left transition duration-200 group-hover:-translate-x-5"
        >
          {label}
        </Link>
      );
    } else if (onClick) {
      return (
        <button
          type="button"
          onClick={props.onClick}
          className="transform truncate whitespace-nowrap text-left transition duration-200 group-hover:-translate-x-5"
        >
          {label}
        </button>
      );
    } else {
      return (
        <span className="transform truncate whitespace-nowrap text-left transition duration-200 group-hover:-translate-x-5">
          {label}
        </span>
      );
    }
  };

  const renderSublabel = () => {
    if (onDelete) {
      return (
        <>
          {renderContent()}
          <button type="button" onClick={onDelete}>
            <XIcon name="SmX" className={actionClassName} />
          </button>
        </>
      );
    } else {
      return <span className="truncate">{label}</span>;
    }
  };

  return (
    <span {...otherProps} className={containerClassName}>
      <span className={groupClassName}>{groupLabel}</span>
      <span className={labelClassName}>{renderSublabel()}</span>
    </span>
  );
};
