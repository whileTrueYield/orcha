import { gql, useQuery } from "@apollo/client";
import { ArrowRightIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { Avatar } from "components/views/Avatar";
import { formatDistance, format } from "date-fns";
import {
  TicketWorkflowStateNote,
  TicketWorkflowStateNoteCategory,
} from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";
import cn from "classnames";
import Tiptap from "components/TipTap/TipTap";

interface Props {
  ticketId: number;
}

export const TicketNotes: React.FC<Props> = (props) => {
  const { data } = useQuery<QueryReturnValue["ticketNotes"]>(GET_TICKET_NOTES, {
    variables: { ticketId: props.ticketId },
  });

  if (!data) {
    return null;
  }

  const notes = data.ticketNotes;

  if (!notes.length) {
    return (
      <div className="p-6 text-center text-base ">
        <div className="text-base font-medium text-gray-500">No Notes</div>
        <div className="mt-2 text-sm text-gray-500">
          Workflow transition notes will appear here
        </div>
      </div>
    );
  }

  const renderTopRightState = (note: TicketWorkflowStateNote) => {
    if (note.category === TicketWorkflowStateNoteCategory.CloseNote) {
      return <span></span>;
    } else if (note.category === TicketWorkflowStateNoteCategory.BlockNote) {
      return (
        <>
          <span className="truncate rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold uppercase text-sky-800">
            {note.fromTicketWorkflowState.name}
          </span>
          <ArrowRightIcon className="h-3 w-3 shrink-0 text-gray-500" />
          <span className="truncate rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold uppercase text-red-50">
            BLOCKED
          </span>
        </>
      );
    } else if (note.category === TicketWorkflowStateNoteCategory.UnblockNote) {
      return (
        <>
          <span className="truncate rounded-md bg-green-500 px-2 py-0.5 text-xs font-semibold uppercase text-green-50">
            UNBLOCKED
          </span>
          <ArrowRightIcon className="h-3 w-3 shrink-0 text-gray-500" />
          <span className="truncate rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold uppercase text-sky-800">
            {note.ticketWorkflowState.name}
          </span>
        </>
      );
    } else {
      return (
        <>
          <span className="truncate rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-800">
            {note.fromTicketWorkflowState.name}
          </span>
          <ArrowRightIcon className="h-3 w-3 shrink-0 text-gray-500" />
          <span className="truncate rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase text-brand-800">
            {note.ticketWorkflowState.name}
          </span>
        </>
      );
    }
  };

  return (
    <div>
      <div className="text-center text-lg font-medium text-gray-600">
        Workflow Transition Notes
      </div>
      <div className="relative mt-6">
        <ul className="relative z-20 mx-4 space-y-4" id="all-notes">
          {notes.map((note) => {
            const containerClassName = cn(
              "rounded-lg border px-4 py-2 text-sm",
              {
                "bg-white":
                  note.category === TicketWorkflowStateNoteCategory.StateNote,
                "bg-blue-50 border-blue-200":
                  note.category === TicketWorkflowStateNoteCategory.CloseNote,
                "bg-red-50 border-red-200":
                  note.category === TicketWorkflowStateNoteCategory.BlockNote,
                "bg-green-50 border-green-200":
                  note.category === TicketWorkflowStateNoteCategory.UnblockNote,
              }
            );

            return (
              <li key={note.id}>
                <div className="flex space-x-0 sm:space-x-3">
                  <Avatar
                    className="hidden h-12 w-12 rounded-lg border-4 border-gray-100 sm:block"
                    src={note.author.avatarUrl}
                    name={note.author.name}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex min-w-0 flex-col space-y-1 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="flex flex-1 flex-row space-x-2 sm:flex-col sm:space-x-0">
                        <h3 className="text-sm font-medium">
                          {note.author.name}
                        </h3>
                        <div
                          className="text-sm text-gray-500"
                          title={format(
                            new Date(note.createdAt),
                            "h:mm a, EEEE, MMMM do, y"
                          )}
                        >
                          {formatDistance(
                            new Date(note.createdAt),
                            new Date(),
                            {
                              addSuffix: true,
                            }
                          )}
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-row items-center space-x-1">
                        {renderTopRightState(note)}
                      </div>
                    </div>
                    <div className={containerClassName}>
                      <Tiptap readonly content={note.body} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="absolute inset-y-4 left-10 z-10 hidden w-0.5 bg-gray-300 sm:block">
          <div className="absolute -bottom-5 -left-[11px] rounded-full bg-gray-300 p-0.5 text-white">
            <ChevronUpIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

const GET_TICKET_NOTES = gql`
  query ticketNotes($ticketId: Int!) {
    ticketNotes(ticketId: $ticketId) {
      id
      body
      createdAt
      updatedAt
      category
      author {
        id
        name
        avatarUrl
        title
      }
      fromTicketWorkflowState {
        id
        name
      }
      ticketWorkflowState {
        id
        name
      }
    }
  }
`;
