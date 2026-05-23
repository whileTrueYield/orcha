import { showTicketEditModal } from "actions";
import { ClickTooltip } from "components/help/Tooltip";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { format } from "date-fns";
import { useAppDispatch } from "store";
import { Ticket } from "types/graphql";

interface Props {
  tickets: Ticket[];
  date: Date;
}

export const GanttMilestone: React.FC<Props> = (props) => {
  const { tickets, date } = props;

  const dispatch = useAppDispatch();

  return (
    <ClickTooltip
      tooltip={(close) => (
        <div className="space-y-2 p-1">
          {tickets.map((ticket) => (
            <div
              role="button"
              className="space-y-2 rounded-md border border-gray-600 bg-gray-800 p-2 hover:bg-gray-900"
              key={ticket.id}
              onClick={() => {
                close();
                dispatch(showTicketEditModal(ticket.id));
              }}
            >
              <div className="flex flex-row items-center space-x-2 text-sm">
                <TicketIdTag
                  productCode={ticket.product?.code}
                  localId={ticket.localId}
                  status={ticket.status}
                  className="shrink-0 text-xs"
                />
                <span className="truncate text-sm text-gray-100">
                  {ticket.title}
                </span>
              </div>
              <div>
                <span className="truncate text-sm text-gray-200">
                  Projected Delivery:{" "}
                </span>
                <span className="text-white">{format(date, "ccc'.' PP")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    >
      <div
        role="button"
        className="h-4 w-4 rotate-45 transform border border-white bg-yellow-400 transition-all hover:bg-yellow-300"
      ></div>
    </ClickTooltip>
  );
};
