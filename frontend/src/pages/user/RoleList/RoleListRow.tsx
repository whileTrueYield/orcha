import React from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import { SmartTime } from "components/views/Time";
import { Role, RoleStatus, RoleType } from "types/graphql";
import { Avatar } from "components/views/Avatar";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { Tag } from "components/tags/Tag";
import {
  ClockIcon,
  ChevronRightIcon,
  GlobeIcon,
  ExclamationIcon,
} from "@heroicons/react/solid";
import { format, utcToZonedTime } from "date-fns-tz";
import { Clock } from "components/Clock";

interface Props {
  role: Role;
  index: number;
  url: string;
}

export const RoleListRow: FCWithFragments<Props> = (props) => {
  const { role } = props;

  const tagClassName = cn("mx-0 capitalize", {
    "bg-brand-200 text-brand-700": role.type === RoleType.Member,
    "bg-gray-600 text-gray-100": role.type === RoleType.Owner,
    "bg-yellow-500 text-yellow-100": role.type === RoleType.Admin,
  });

  const renderSecondCell = (role: Role) => {
    switch (role.status) {
      case RoleStatus.Accepted:
        return (
          <div>
            <div className="mb-2 flex items-center text-sm leading-5 text-gray-500">
              <Tag className={tagClassName}>{role.type}</Tag>
            </div>
            <div className="flex flex-row items-center justify-between text-sm leading-5 text-gray-500">
              <span className="flex flex-row items-center">
                <GlobeIcon className="mr-1.5 h-5 w-5 shrink-0 text-gray-300" />
                {role.timeZone.replace("_", " ")}
              </span>
              <span className="hidden 2xl:block">
                <Clock
                  interval={1000}
                  getValue={() =>
                    format(
                      utcToZonedTime(new Date(), role.timeZone),
                      "cccc, MMM do, p"
                    )
                  }
                />
              </span>
              <span className="2xl:hidden">
                {format(utcToZonedTime(new Date(), role.timeZone), "cccc, p")}
              </span>
            </div>
          </div>
        );

      case RoleStatus.Invited:
        return (
          <div>
            <div className="text-sm leading-5 text-gray-500">
              Invited <SmartTime date={role.createdAt} />
            </div>
            <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
              <ClockIcon className="mr-1 h-5 w-5 shrink-0 text-gray-400" />
              invited as <span className="ml-1 font-semibold">{role.type}</span>
            </div>
          </div>
        );
      case RoleStatus.Rejected:
        return (
          <div>
            <div className="text-sm leading-5 text-gray-500">
              Rejected the invite
            </div>
            <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
              <ClockIcon className="mr-1 h-5 w-5 shrink-0 text-gray-400" />
              invited as <span className="ml-1 font-semibold">{role.type}</span>
            </div>
          </div>
        );
      case RoleStatus.Deactivated:
      default:
        return (
          <div>
            <div className="text-sm leading-5 text-gray-500">Deactivated</div>
            <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
              <ExclamationIcon className="mr-1 h-5 w-5 shrink-0 text-gray-400" />
              <span className="ml-1 font-semibold text-gray-400 line-through">
                {role.type}
              </span>
            </div>
          </div>
        );
    }
  };

  const linkClassName = cn(
    "block transition duration-150 ease-in-out focus:bg-gray-50 focus:outline-none",
    {
      "hover:bg-gray-50": role.status === RoleStatus.Accepted,
      "bg-gray-50 hover:bg-gray-100": role.status === RoleStatus.Invited,
      "bg-yellow-50 hover:bg-yellow-100": role.status === RoleStatus.Rejected,
      "border-l-8 border-l-red-400 bg-red-50 hover:bg-red-100":
        role.status === RoleStatus.Deactivated,
    }
  );

  return (
    <li className="border-t border-gray-200">
      <Link to={props.url} className={linkClassName}>
        <div className="flex items-center px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center">
            <div className="shrink-0">
              <Avatar
                className="h-12 w-12 rounded-md bg-gray-200"
                src={role.avatarUrl}
                name={role.name}
              />
            </div>
            <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <div className="truncate text-sm font-medium leading-5 text-brand-600">
                  {role.name}
                </div>
                <div className="mt-1 flex items-center text-sm leading-5 text-gray-500">
                  <span className="truncate">{role.title || ""}</span>
                </div>
              </div>
              <div className="hidden md:block">{renderSecondCell(role)}</div>
            </div>
          </div>
          <div>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </Link>
    </li>
  );
};

RoleListRow.fragments = {
  RoleListRowDetails: gql`
    fragment RoleListRowDetails on Role {
      id
      status
      name
      title
      type
      createdAt
      avatarUrl
      timeZone
    }
  `,
};
