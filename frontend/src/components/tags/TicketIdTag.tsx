import { StarIcon } from "@heroicons/react/solid";
import cn from "classnames";
import { Maybe, TicketStatus } from "types/graphql";

interface Props {
  productCode?: Maybe<string>;
  localId?: Maybe<number | string>;
  milestone?: boolean;
  className?: string;
  status?: TicketStatus | null;
}

export const TicketIdTag: React.FC<Props> = (props) => {
  const { milestone, className, localId, productCode, status } = props;

  const containerClassName = cn(
    "items-center whitespace-nowrap rounded py-px px-1 font-medium",
    {
      "bg-brand-200 text-brand-800 group-hover:bg-brand-300 group-hover:text-brand-900":
        !status || status === TicketStatus.Scheduled,
      "bg-green-200 text-green-800 group-hover:bg-green-300 group-hover:text-green-900":
        status === TicketStatus.Done,
      "bg-gray-200 text-gray-700 group-hover:bg-gray-300 group-hover:text-gray-900":
        status === TicketStatus.Unscheduled ||
        status === TicketStatus.Cancelled,
    }
  );

  return (
    <span className={cn(className, "whitespace-nowrap")}>
      {milestone && (
        <StarIcon className="relative -mt-0.5 mr-0.5 inline-block h-4 w-4 text-yellow-400" />
      )}
      <span className={containerClassName} title={milestone ? "Milestone" : ""}>
        {productCode || "n/a"}
        <span className="ml-0.5 font-semibold">{localId || "--"}</span>
      </span>
    </span>
  );
};
