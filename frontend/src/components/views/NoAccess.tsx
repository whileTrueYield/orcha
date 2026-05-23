import React from "react";
import cn from "classnames";

interface Props extends React.HTMLProps<HTMLDivElement> {
  title?: string;
  subTitle?: string;
  src?: string;
  className?: string;
}

export const NoAccess: React.FC<Props> = (props) => {
  const className = cn(
    "min-h-0 min-w-0 flex items-center justify-center flex-col w-full py-6",
    props.className
  );

  const title = props.title || "This feature is missing";
  const subTitle =
    props.subTitle || "Access to this feature might be restricted";

  const src = props.src || "/img/svg/undraw_taken_re_yn20.svg";

  return (
    <div className={className}>
      <img
        src={src}
        className="max-h-[16rem] max-w-xs shrink object-contain px-4"
        alt=""
      />
      <p className="mt-8 flex-shrink-0 text-center font-title text-base font-medium tracking-wide text-gray-700">
        {title}
      </p>
      <p className="mt-2 flex-shrink-0 px-4 text-center text-sm text-gray-500 sm:px-0">
        {subTitle}
      </p>
      {props.children}
    </div>
  );
};
