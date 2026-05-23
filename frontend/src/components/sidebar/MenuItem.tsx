import React, { FC } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import cn from "classnames";

interface Props extends NavLinkProps {
  icon: (className: string) => React.ReactElement;
  dismissSidebar: () => void;
  activeClassName?: string;
  danger?: boolean;
  betaFeature?: boolean;
  // MenuItem cannot reconciliate the default style
  // with the className from NavLinkProps, which can
  // strangely also be a method huh ?!
  className?: string;
}

export const MenuItem: FC<Props> = (props) => {
  const {
    children,
    icon,
    dismissSidebar,
    className,
    danger,
    betaFeature,
    ...otherProps
  } = props;
  const defaultClassName = cn(
    "group relative mt-1 group flex items-center px-2 py-2 leading-5 font-medium " +
      "rounded-md hover:text-white  focus:outline-none focus:text-white " +
      "nav-menu-item transition ease-in-out duration-150 tracking-wide text-lg",
    {
      "text-gray-300 hover:bg-pink-700 focus:bg-pink-700": danger,
      "text-gray-300 hover:bg-gray-700 focus:bg-gray-700": !danger,
    }
  );

  const activeClassName = danger
    ? "bg-pink-700 text-white hover:bg-pink-700 active-menu"
    : "bg-gray-700 text-white hover:bg-gray-700 active-menu";

  const iconClassName =
    "mr-3 h-6 w-6 shrink-0 transition group-[.active-menu]:text-[rgb(111,231,210)] duration-150 ease-in-out text-gray-400 hover:text-gray-300 focus:text-gray-300";

  return (
    <NavLink
      className={cn(defaultClassName, className)}
      onClick={dismissSidebar}
      activeStyle={{ color: "white" }}
      activeClassName={activeClassName}
      {...otherProps}
    >
      {icon(iconClassName)}
      <span className="flex items-center justify-start md:hidden xl:flex">
        {children}
      </span>
      {betaFeature ? (
        <span className="relative -top-1.5 ml-1.5 rounded bg-gradient-to-tr from-orange-800 to-pink-600 px-1 py-px text-[8px] font-bold leading-3 tracking-widest text-pink-100 sm:hidden xl:block">
          BETA
        </span>
      ) : null}
    </NavLink>
  );
};
