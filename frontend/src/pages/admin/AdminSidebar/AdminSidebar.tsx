import {
  ClockIcon,
  CollectionIcon,
  CreditCardIcon,
  CubeIcon,
  LinkIcon,
  TagIcon,
  UploadIcon,
  UserIcon,
} from "@heroicons/react/outline";
import React from "react";
import { urlResolver } from "utils/navigation";
import { AdminMenuItem } from "./AdminMenuItem";
import { ProductRouter } from "pages/product/Router";
import { UserRouter } from "pages/user/Router";
import { WorkflowRouter } from "pages/workflow/Router";
import { BillingRouter } from "pages/billing/Router";
import { RepositoryLinksRouter } from "pages/repositoryLinks/Router";
import { ImportRouter } from "pages/import/Router";
import { BlackoutTimeRouter } from "pages/blackoutTime/Router";
import { TagRouter } from "pages/tag/Router";
import { useSelector } from "react-redux";
import { isAdminLevel } from "reducers/selector";
import { useHistory, useParams } from "react-router-dom";
import { ListBox } from "components/fields/Listbox";

interface SubNavigation {
  name: string;
  href: (orgId: string) => string;
  Icon: React.FC;
}

const subNavigation: SubNavigation[] = [
  {
    name: "People",
    href: (orgId: string) => urlResolver.role.listing(orgId),
    Icon: UserIcon,
  },
  {
    name: "Blackout & Time Off",
    href: (orgId: string) => urlResolver.blackoutTime.root(orgId),
    Icon: ClockIcon,
  },
  // {
  //   name: "Teams",
  //   href: (orgId: string) => urlResolver.team.listing(orgId),
  //   Icon: UserGroupIcon,
  // },
  {
    name: "Products",
    href: (orgId: string) => urlResolver.product.listing(orgId),
    Icon: CubeIcon,
  },
  {
    name: "Workflows",
    href: (orgId: string) => urlResolver.workflow.listing(orgId),
    Icon: CollectionIcon,
  },
  {
    name: "Tag Manager",
    href: (orgId: string) => urlResolver.tag.listing(orgId),
    Icon: TagIcon,
  },
  // {
  //   name: "Autopilot",
  //   href: (orgId: string) => urlResolver.schedule.setup(orgId),
  //   Icon: ChipIcon,
  // },
  {
    name: "Billing & Plan",
    href: (orgId: string) => urlResolver.admin.billing(orgId),
    Icon: CreditCardIcon,
  },
  {
    name: "Repository Links",
    href: (orgId: string) => urlResolver.admin.repositoryLinks(orgId),
    Icon: LinkIcon,
  },
  {
    name: "Import",
    href: (orgId: string) => urlResolver.import.importTicket(orgId),
    Icon: UploadIcon,
  },
];

export const AdminSidebar: React.FC = (props) => {
  const isAdmin = useSelector(isAdminLevel);
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();

  if (isAdmin) {
    return (
      <div className="absolute inset-0 max-w-full">
        <main
          className="flex flex-row justify-center py-4 lg:px-8"
          id="main-admin-container"
        >
          <div className="max-w-full flex-1 sm:max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-5">
            <aside className="relative z-20 py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
              <div className="mx-auto max-w-md lg:hidden">
                <ListBox
                  options={subNavigation}
                  value={null}
                  getKey={(item) => item.name}
                  getLabel={(item) => (item ? item.name : "")}
                  onChange={(item) => history.push(item.href(orgId))}
                  placeholder="Admin Sections"
                />
              </div>
              <nav className="hidden space-y-1 lg:block">
                {subNavigation.map((item) => (
                  <AdminMenuItem
                    key={item.name}
                    name={item.name}
                    to={item.href(orgId)}
                    Icon={item.Icon}
                  />
                ))}
              </nav>
            </aside>
            <div className="sm:px-6 lg:col-span-9 lg:px-0">
              <ProductRouter />
              <WorkflowRouter />
              {/* <TeamRouter /> */}
              <UserRouter />
              <BillingRouter />
              <RepositoryLinksRouter />
              <ImportRouter />
              <TagRouter />
              <BlackoutTimeRouter />
            </div>
          </div>
        </main>
      </div>
    );
  }
  return null;
};
