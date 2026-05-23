import React from "react";
import cn from "classnames";

interface Props {
  cta: string;
  isActive: boolean;
}

export const RenderButton: React.FC<Props> = (props) => {
  const { isActive, cta } = props;

  const className = cn(
    "text-left flex flex-col border-b-1 border-gray-800 text-white py-2 px-4 w-full -mb-1.5",
    {
      "relative ring ring-brand-500 ring-offset-2 ring-offset-gray-900 bg-gray-900":
        isActive,
      "bg-gray-700": !isActive,
    }
  );

  return (
    <div className={className}>
      <div className="mt-1 flex min-w-0 flex-1 flex-row items-center justify-between">
        <div className="truncate">{cta}</div>
      </div>
    </div>
  );
};
