import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { Ticket, TicketStatus } from "types/graphql";
import { ExclamationIcon } from "@heroicons/react/solid";
import { CheckCircleIcon } from "@heroicons/react/outline";
import cn from "classnames";
import PlainTextView from "components/PlainText/PlainTextView";

interface Props {
  ticket: Ticket;
  className?: string;
}

export const TicketClosingNote: FCWithFragments<Props> = (props) => {
  const { ticket } = props;

  if (ticket.closingNote) {
    if (ticket.status === TicketStatus.Cancelled) {
      const className = cn(
        "rounded-lg border-l-8 bg-white border-yellow-500 border-yellow-300 p-4 shadow mx-2 sm:mx-0",
        props.className,
      );

      return (
        <div className={className}>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <ExclamationIcon
                className="h-6 w-6 text-yellow-400"
                aria-hidden="true"
              />
              <h3 className="ml-2 text-base font-medium text-yellow-600">
                This ticket has been cancelled
              </h3>
            </div>
            <div className="mt-2 sm:ml-8">
              <PlainTextView
                content={ticket.closingNote}
                className="min-w-none"
              />
            </div>
          </div>
        </div>
      );
    } else if (ticket.status === TicketStatus.Done) {
      const className = cn(
        "rounded-lg border-l-8 bg-white border-green-500 border-green-300 p-4 shadow mx-2 sm:mx-0",
        props.className,
      );

      return (
        <div className={className}>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <CheckCircleIcon
                className="h-6 w-6 text-green-400"
                aria-hidden="true"
              />
              <h3 className="ml-2 text-base font-medium text-green-700">
                This ticket is done
              </h3>
            </div>
            <div className="mt-2 sm:ml-8">
              <PlainTextView
                content={ticket.closingNote}
                className="max-w-none"
              />
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
};

TicketClosingNote.fragments = {
  TicketClosingNoteFragment: gql`
    fragment TicketClosingNoteFragment on Ticket {
      id
      closingNote
      status
    }
  `,
};
