import React from "react";
import cn from "classnames";

type ButtonCategory = "gray" | "info" | "danger" | "warning" | "ok";

interface Props {
  children?: React.ReactNode;
  onClick: () => void;
  category: ButtonCategory;
  count: number;
  active: boolean;
}

export const ProjectAnalyticTicketButton: React.FC<Props> = (props) => {
  const { category, active, count } = props;

  const countClass = cn("py-1 text-3xl font-bold text-center", {
    "text-brand-600": active,
    "text-gray-500": !active,
  });

  const labelClass = cn("text-sm font-medium items-center text-center", {
    "text-brand-700": active,
    "text-gray-500": !active,
  });

  const buttonClass = cn("group py-2 transition", {
    "bg-white hover:bg-gray-200": !active,
    "bg-gray-50 shadow": active,
    "bg-red-100": category === "danger" && !active && count > 0,
    "bg-orange-100": category === "warning" && !active && count > 0,
    "bg-green-100": category === "ok" && !active && count > 0,
  });

  return (
    <button type="button" onClick={props.onClick} className={buttonClass}>
      <div className={countClass}>{count}</div>
      <div className={labelClass}>{props.children}</div>
    </button>
  );
};
