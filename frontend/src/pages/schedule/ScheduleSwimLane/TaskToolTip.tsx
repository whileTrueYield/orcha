import { Popover } from "components/Popover/Popover";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { useRef, useState } from "react";
import { TicketStatus } from "types/graphql";

export function minuteToHours(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = Math.floor(duration - hours * 60);

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  ticketTitle: string;
  ticketStatus?: TicketStatus;
  ticketProductCode?: string;
  ticketWorkflowStateName: string;
  ticketLocalId?: number | null;
  className?: string;
  note: string;
}

export const TaskToolTip: React.FC<Props> = (props) => {
  const {
    ticketTitle,
    ticketProductCode,
    ticketWorkflowStateName,
    ticketLocalId,
    ticketStatus,
    children,
    note,
    ...otherProps
  } = props;
  const timeout = useRef<any>(null);
  const [isVisible, setVisible] = useState(false);
  const popoverRef = useRef(null);
  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);

  const onMouseEnter = () => {
    timeout.current = setTimeout(() => setVisible(true), 500);
  };

  const onMouseLeave = () => {
    clearTimeout(timeout.current);
    setVisible(false);
  };

  const renderStatus = () => {
    switch (ticketStatus) {
      case TicketStatus.Cancelled:
        return (
          <div className="inline-block rounded bg-red-600 px-1 text-sm font-semibold text-red-50">
            Cancelled
          </div>
        );
      case TicketStatus.Done:
        return (
          <div className="inline-block rounded bg-green-600 px-1 text-sm font-semibold text-green-50">
            Done
          </div>
        );
      case TicketStatus.Scheduled:
        return (
          <div className="inline-block rounded bg-sky-600 px-1 text-sm font-semibold text-sky-50">
            Scheduled
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setReferenceElement}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...otherProps}
    >
      {children}
      {referenceElement && isVisible ? (
        <Popover
          referenceElement={referenceElement}
          className="z-30 w-96 max-w-xs cursor-auto px-2 sm:max-w-sm sm:px-0"
          background="bg-gray-700"
        >
          <div
            ref={popoverRef}
            className="relative overflow-hidden rounded-md bg-gray-700 p-4 shadow-lg"
          >
            <div className="relative space-y-1">
              <div className="space-x-1.5 text-base font-medium tracking-wide text-white">
                <TicketIdTag
                  className="text-sm"
                  productCode={ticketProductCode}
                  localId={ticketLocalId}
                />
                {renderStatus()}
                <span>{ticketTitle}</span>
              </div>
              <div className="text-sm text-gray-100">
                Stage:{" "}
                <span className="font-medium">{ticketWorkflowStateName}</span>
              </div>
              <div className="text-sm text-gray-100">{note}</div>
            </div>
          </div>
        </Popover>
      ) : null}
    </div>
  );
};
