import React from "react";
import cn from "classnames";

interface Props extends React.ButtonHTMLAttributes<HTMLDivElement> {}

export const ScreenCenter: React.FC<Props> = ({
  className,
  children,
  ...props
}) => {
  const classNames = cn(
    "min-h-screen bg-gray-100 flex flex-col justify-center py-8 px-2 sm:px-6 lg:px-8",
    className
  );

  return (
    <div className={classNames} {...props}>
      <div className="sm:mx-auto sm:w-full md:max-w-lg">{children}</div>
    </div>
  );
};
