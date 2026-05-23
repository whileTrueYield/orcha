import React from "react";
import { Joke } from "./Joke";
import cn from "classnames";

interface Props extends React.HTMLProps<HTMLDivElement> {
  title: string;
  subTitle?: string;
  src?: string;
  className?: string;
}

export const EmptyState: React.FC<Props> = (props) => {
  const className = cn(
    "min-h-0 min-w-0 flex items-center justify-center flex-col w-full py-6",
    props.className
  );

  const src = props.src || "/img/svg/undraw_empty_xct9.svg";

  return (
    <div className={className}>
      <img
        src={src}
        className="max-h-[8rem] max-w-xs shrink object-contain px-4"
        alt=""
      />
      <p className="mt-8 flex-shrink-0 text-center font-title text-base font-medium tracking-wide text-gray-700">
        {props.title}
      </p>
      <p className="mt-2 flex-shrink-0 px-4 text-center text-sm text-gray-500 sm:px-0">
        {props.subTitle ? props.subTitle : <Joke />}
      </p>
      {props.children}
    </div>
  );
};
