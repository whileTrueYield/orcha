import React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface Props extends NavLinkProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
}

export const AdminMenuItem: React.FC<Props> = (props) => {
  const { Icon, name, ...navProps } = props;

  return (
    <NavLink
      className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-700"
      activeClassName="bg-white text-orange-600 hover:text-orange-600"
      {...navProps}
    >
      <Icon
        className="group-hover:text-gray-500' -ml-1 mr-3 h-6 w-6 shrink-0"
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </NavLink>
  );
};
