import { PlusIcon } from "@heroicons/react/solid";
import React from "react";
import cn from "classnames";

interface Props {
  className?: string;
  plusIconClassName: string;
  children?: React.ReactNode;
}

export const PlusOnIcon: React.FC<Props> = (props) => {
  const plusIconClassName = cn(
    props.plusIconClassName,
    "absolute -right-1 -bottom-1 w-4 h-4"
  );

  const className = cn("relative mb-1", props.className);

  return (
    <div className={className}>
      {props.children}
      <PlusIcon className={plusIconClassName} />
    </div>
  );
};
