import { Avatar } from "components/views/Avatar";
import React from "react";
import cn from "classnames";
import { DotsHorizontalIcon } from "@heroicons/react/solid";

interface Props extends React.HTMLProps<HTMLDivElement> {
  avatarUrls: string[];
}

export const ReplySummaryModule: React.FC<Props> = (props) => {
  const { avatarUrls, className, ...divProps } = props;
  const containerClassName = cn(
    "group relative flex flex-row items-center text-brand-500 leading-8 text-sm cursor-pointer hover:underline",
    className
  );

  const renderAvatars = (avatarUrl: string, index: number) => {
    const avatarClassName =
      index === 0
        ? "inline-block h-8 w-8 rounded-md text-white shadow-solid"
        : "-ml-1 inline-block h-8 w-8 rounded-md text-white shadow-solid";
    return <Avatar key={index} src={avatarUrl} className={avatarClassName} />;
  };

  return (
    <div className={containerClassName} {...divProps}>
      <div
        className="absolute h-6 w-6 bg-gray-100"
        style={{ left: "-2.75rem" }}
      >
        <DotsHorizontalIcon className="h-6 w-6 text-gray-200 transition duration-150 group-hover:text-gray-400" />
      </div>
      <div className="mr-2 flex">{props.avatarUrls.map(renderAvatars)}</div>
      {props.children}
    </div>
  );
};
