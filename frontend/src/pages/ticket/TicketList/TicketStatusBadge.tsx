import {
  CheckCircleIcon,
  PencilIcon,
  CalendarIcon,
  ArchiveIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import React from "react";
import { ModelStage, TicketStatus } from "types/graphql";
import cn from "classnames";

interface Props {
  status: TicketStatus;
  stage: ModelStage;
  className?: string;
}

export const TicketStatusBadge: React.FC<Props> = (props) => {
  const { status, stage } = props;

  const iconColor = (classname: string) =>
    "w-5 h-5 mr-1 inline-block " + classname;

  let icon = <PencilIcon className={iconColor("text-gray-500")} />;
  let label = `${stage}`;

  if (stage === ModelStage.Draft) {
    icon = <PencilIcon className={iconColor("text-gray-400")} />;
    label = "Draft";
  } else if (stage === ModelStage.Archived) {
    icon = <ArchiveIcon className={iconColor("text-gray-400")} />;
    label = "Archived";
  } else if (stage === ModelStage.Published) {
    if (status === TicketStatus.Cancelled) {
      icon = <XCircleIcon className={iconColor("text-orange-300")} />;
      label = "Cancelled";
    } else if (status === TicketStatus.Done) {
      icon = <CheckCircleIcon className={iconColor("text-green-400")} />;
      label = "Done";
    } else if (status === TicketStatus.Scheduled) {
      icon = <CalendarIcon className={iconColor("text-brand-400")} />;
      label = "Scheduled";
    } else if (status === TicketStatus.Unscheduled) {
      icon = <ClockIcon className={iconColor("text-brand-400")} />;
      label = "Unscheduled";
    }
  }

  const className = cn(
    "flex flex-row items-center text-sm capitalize text-gray-500",
    props.className
  );

  return (
    <div className={className}>
      {icon} {label}
    </div>
  );
};
