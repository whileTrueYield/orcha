import React from "react";
import { ScheduleItem } from "types/graphql";
import cn from "classnames";
import { GroupTag } from "components/tags/GroupTag";
import { Tag } from "components/tags/Tag";

interface Props {
  scheduleItem: ScheduleItem;
  isActive: boolean;
  isBlocked?: boolean;
}

export const RenderScheduleItem: React.FC<Props> = (props) => {
  const { isActive, scheduleItem, isBlocked } = props;

  const className = cn(
    "text-left min-w-0 flex flex-col text-white px-4 py-3 space-y-2 rounded-lg w-full",
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
    "bg-orange-700": !isBlocked && !isActive,
    "bg-orange-500": !isBlocked && isActive,
    "bg-red-500": isBlocked,
  });

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-1 flex-row items-center justify-between space-x-2">
        <div className="truncate">{scheduleItem.ticket.title}</div>
        <Tag className={topTagClass}>{isBlocked ? "BLOCKED" : "PAUSED"}</Tag>
      </div>

      <div className="flex flex-1 flex-row items-center justify-between">
        <div>
          <GroupTag
            className="hidden text-white md:block"
            label={`${scheduleItem.ticket.product?.code} ${scheduleItem.ticket.localId}`}
            groupLabel={
              scheduleItem.ticket.product
                ? scheduleItem.ticket.product.name
                : "N/A"
            }
            groupBgColor={tagClass}
          />
          <GroupTag
            className="text-white md:hidden"
            label={`${scheduleItem.ticket.localId}`}
            groupLabel={`${scheduleItem.ticket.product?.code}`}
            groupBgColor={tagClass}
          />
        </div>
        <div>
          <GroupTag
            className="text-white"
            label={scheduleItem.ticketWorkflowState.name}
            groupLabel={
              scheduleItem.ticket.workflow
                ? scheduleItem.ticket.workflow.name
                : "N/A"
            }
            groupBgColor={tagClass}
          />
        </div>
      </div>
    </div>
  );
};
