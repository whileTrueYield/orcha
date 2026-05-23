import React from "react";
import { OrchaIcon } from "./Icon";
import { Footer } from "./Footer";

interface Props extends React.ButtonHTMLAttributes<HTMLDivElement> {
  noLogo?: boolean;
}

export const AuthScreenContainer: React.FC<Props> = ({
  children,
  className,
  noLogo,
  ...props
}) => {
  const classes = className || "mx-auto w-full md:max-w-lg";

  return (
    <div
      className="flex min-h-screen flex-col justify-center bg-gradient-to-tr from-gray-300 to-white py-4 px-2 sm:px-6 lg:px-8"
      {...props}
    >
      <div className="flex flex-1 flex-col justify-between md:justify-around">
        {noLogo ? null : (
          <div className="flex flex-row justify-center">
            <OrchaIcon />
          </div>
        )}
        <div className={classes}>{children}</div>
        <Footer />
      </div>
    </div>
  );
};
