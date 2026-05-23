import React from "react";
import { NextTicket } from "types/graphql";
import cn from "classnames";
import { GroupTag } from "components/tags/GroupTag";
import { Tag } from "components/tags/Tag";

interface Props {
  nextTicket: NextTicket;
  isActive: boolean;
  isRecommended?: boolean;
}

export const RenderNextTicket: React.FC<Props> = (props) => {
  const { isActive, nextTicket, isRecommended } = props;
  const isBlocked = nextTicket.nextState.isBlocked;

  const className = cn(
    "text-left flex flex-col text-white px-4 py-3 space-y-2 rounded-lg w-full focus:outline-none",
    {
      "bg-gray-800": !isBlocked && !isActive,
      "bg-red-800": isBlocked && !isActive,
    }
  );

  const tagClass = cn("text-white flex-none", {
    "bg-gray-700": !isBlocked && !isActive,
    "bg-gray-500": !isBlocked && isActive,
    "bg-red-700": isBlocked && !isActive,
    "bg-red-500": isBlocked && isActive,
  });

  const topTagClass = cn("text-white flex-none", {
    "bg-gray-700": !isActive && !isRecommended && !isBlocked,
    "bg-gray-600": isActive && !isRecommended && !isBlocked,
    "bg-lime-700": !isActive && isRecommended && !isBlocked,
    "bg-lime-600": isActive && isRecommended && !isBlocked,
    "bg-red-700": isBlocked && !isActive,
    "bg-red-600": isBlocked && isActive,
  });

  if (isBlocked) {
    return (
      <div className={className}>
        <div className="flex min-w-0 flex-1 flex-row items-center justify-between space-x-2">
          <div className="truncate">{nextTicket.ticket.title}</div>
          <Tag className={topTagClass}>BLOCKED</Tag>
        </div>

        <div className="flex flex-1 flex-row items-center justify-between">
          <div>
            <GroupTag
              className="hidden text-white md:block"
              label={`${nextTicket.ticket.product?.code} ${nextTicket.ticket.localId}`}
              groupLabel={
                nextTicket.ticket.product
                  ? nextTicket.ticket.product.name
                  : "N/A"
              }
              groupBgColor={tagClass}
            />
            <GroupTag
              className="text-white md:hidden"
              label={`${nextTicket.ticket.localId}`}
              groupLabel={`${nextTicket.ticket.product?.code}`}
              groupBgColor={tagClass}
            />
          </div>
          <div>
            <GroupTag
              className="text-white"
              label={nextTicket.nextState.name}
              groupLabel={
                nextTicket.ticket.workflow
                  ? nextTicket.ticket.workflow.name
                  : "N/A"
              }
              groupBgColor={tagClass}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-1 flex-row items-center justify-between space-x-2">
        <div className="truncate">{nextTicket.ticket.title}</div>
        <Tag className={topTagClass}>
          {isRecommended ? "RECOMMENDED" : "NEXT"}
        </Tag>
      </div>

      <div className="flex flex-1 flex-row items-center justify-between">
        <div>
          <GroupTag
            className="hidden text-white md:block"
            label={`${nextTicket.ticket.product?.code} ${nextTicket.ticket.localId}`}
            groupLabel={
              nextTicket.ticket.product ? nextTicket.ticket.product.name : "N/A"
            }
            groupBgColor={tagClass}
          />
          <GroupTag
            className="text-white md:hidden"
            label={`${nextTicket.ticket.localId}`}
            groupLabel={`${nextTicket.ticket.product?.code}`}
            groupBgColor={tagClass}
          />
        </div>
        <div>
          <GroupTag
            className="text-white"
            label={nextTicket.nextState.name}
            groupLabel={
              nextTicket.ticket.workflow
                ? nextTicket.ticket.workflow.name
                : "N/A"
            }
            groupBgColor={tagClass}
          />
        </div>
      </div>
    </div>
  );
};
