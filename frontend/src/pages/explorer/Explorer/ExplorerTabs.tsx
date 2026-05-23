import {
  ChartBarIcon,
  DocumentTextIcon,
  LinkIcon,
  TicketIcon,
} from "@heroicons/react/outline";
import { useMemo } from "react";
import { NavLink, useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";

interface Params {
  orgId: string;
  projectId: string;
}

interface ExplorerNavTab {
  disabled?: boolean;
  name: string;
  href: string;
  icon: React.FC<{ className: string }>;
}

interface Props {
  isDraft?: boolean;
}

export const ExplorerTabs: React.FC<Props> = (props) => {
  const { isDraft } = props;
  const { orgId, projectId } = useParams<Params>();
  const history = useHistory();

  const tabs = useMemo(
    (): ExplorerNavTab[] => [
      {
        name: "Tickets",
        href: urlResolver.explorer.listing(orgId, projectId),
        icon: TicketIcon,
        disabled: isDraft,
      },
      {
        name: "Readme",
        href: urlResolver.explorer.editor(orgId, projectId || ""),
        icon: DocumentTextIcon,
        disabled: !projectId,
      },
      {
        name: "Analytics",
        href: urlResolver.explorer.analytics(orgId, projectId),
        icon: ChartBarIcon,
        disabled: isDraft,
      },
      {
        name: "Dependencies",
        href: urlResolver.explorer.dependencies(orgId, projectId),
        icon: LinkIcon,
        disabled: isDraft,
      },
    ],
    [orgId, projectId, isDraft]
  );

  const renderLink = (link: ExplorerNavTab) => {
    const Icon = link.icon;
    if (link.disabled) {
      return (
        <div key={link.name}>
          <div className="whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-gray-400 2xl:px-3">
            <Icon className="relative -top-px -ml-0.5 mr-1 hidden h-4 w-4 2xl:inline-block" />
            {link.name}
          </div>
        </div>
      );
    } else {
      return (
        <NavLink
          key={link.name}
          to={link.href}
          activeClassName="is-active"
          className="group"
        >
          <div className="whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800 group-[.is-active]:bg-brand-500 group-[.is-active]:text-white 2xl:px-3">
            <Icon className="relative -top-px -ml-0.5 mr-1 hidden h-4 w-4 2xl:inline-block" />
            {link.name}
          </div>
        </NavLink>
      );
    }
  };

  const renderLinkIcon = (link: ExplorerNavTab) => {
    const Icon = link.icon;
    if (link.disabled) {
      return (
        <div key={link.name}>
          <div className="whitespace-nowrap rounded-lg p-2 text-sm font-medium text-gray-400">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      );
    } else {
      return (
        <NavLink
          key={link.name}
          to={link.href}
          activeClassName="is-active"
          className="group"
        >
          <div className="flex flex-row items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-800 group-[.is-active]:bg-brand-500 group-[.is-active]:text-white">
            <Icon className="h-5 w-5" />
            <span className="ml-1 hidden text-sm font-medium text-white group-[.is-active]:block">
              {link.name}
            </span>
          </div>
        </NavLink>
      );
    }
  };

  return (
    <div>
      <div className="hidden sm:block lg:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500"
          onChange={(event) => {
            console.log("tabs onChange triggered");
            if (event.target.value) {
              history.push(event.target.value);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled className="text-gray-500">
            Select View
          </option>
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.href} disabled={tab.disabled}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white py-3 sm:hidden [.ce-scroll-locked_&]:hidden">
        <nav className="flex justify-around" aria-label="Tabs">
          {tabs.map(renderLinkIcon)}
        </nav>
      </div>

      <div className="hidden lg:block">
        <nav className="flex space-x-2 2xl:space-x-4" aria-label="Tabs">
          {tabs.map(renderLink)}
        </nav>
      </div>
    </div>
  );
};
