import React from "react";
import { ScheduleItem } from "types/graphql";
import cn from "classnames";
import { GroupTag } from "components/tags/GroupTag";
import { Tag } from "components/tags/Tag";

interface Props {
  scheduleItem: ScheduleItem;
  isActive: boolean;
}

export const RenderActiveScheduleItem: React.FC<Props> = (props) => {
  const { isActive, scheduleItem } = props;

  const className = cn(
    "text-left flex flex-col text-white px-4 py-3 space-y-2 rounded-lg w-full",
    {
      "bg-gradient-to-br from-brand-800 to-brand-600": !isActive,
    }
  );

  const tagClass = cn("text-white flex-none", {
    "bg-brand-800": !isActive,
    "bg-brand-700": isActive,
  });

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-1 flex-row items-center justify-between space-x-2">
        <div className="truncate">{scheduleItem.ticket.title}</div>
        <Tag className={tagClass}>IN PROGRESS</Tag>
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
