import React from "react";
import { SmartTime } from "components/views/Time";
import gql from "graphql-tag";
import { Avatar } from "components/views/Avatar";
import { ArrowRightIcon } from "@heroicons/react/solid";
import { useQuery } from "@apollo/client";
import { QueryReturnValue } from "types/queryTypes";
import cn from "classnames";
import {
  TicketWorkflowStateNote,
  TicketWorkflowStateNoteCategory,
} from "types/graphql";
import Tiptap from "components/TipTap/TipTap";

interface Props {
  ticketId: number;
  className?: string;
  onSeeAll?: () => void;
}

export const TicketNote: React.FC<Props> = (props) => {
  const { ticketId, className, onSeeAll } = props;

  const { data } = useQuery<QueryReturnValue["lastTicketWorkflowStateNote"]>(
    GET_TICKET_NOTE,
    { variables: { ticketId } }
  );

  if (!data) {
    return null;
  }

  const note = data.lastTicketWorkflowStateNote;

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
          <span className="truncate rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold uppercase text-sky-800">
            {note.fromTicketWorkflowState.name}
          </span>
          <ArrowRightIcon className="h-3 w-3 shrink-0 text-gray-500" />
          <span className="truncate rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold uppercase text-sky-800">
            {note.ticketWorkflowState.name}
          </span>
        </>
      );
    }
  };

  if (note) {
    const containerClassName = cn("mt-3 rounded-lg border p-4", {
      "bg-white": note.category === TicketWorkflowStateNoteCategory.StateNote,
      "bg-blue-50 border-blue-200":
        note.category === TicketWorkflowStateNoteCategory.CloseNote,
      "bg-red-50 border-red-200":
        note.category === TicketWorkflowStateNoteCategory.BlockNote,
      "bg-green-50 border-green-200":
        note.category === TicketWorkflowStateNoteCategory.UnblockNote,
    });

    return (
      <div className={className}>
        <div className={containerClassName}>
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center space-x-2">
              <Avatar
                src={note.author.avatarUrl}
                name={note.author.name}
                className="h-10 w-10 flex-none rounded-md shadow"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <div className="flex min-w-0 flex-col justify-between space-y-1 sm:flex-row sm:space-y-0">
                  <div className="text-sm font-medium">{note.author.name}</div>
                  <div className="flex min-w-0 flex-row items-center space-x-1">
                    {renderTopRightState(note)}
                  </div>
                </div>
                <SmartTime
                  className="hidden text-sm text-gray-500 sm:block"
                  date={note.updatedAt}
                />
              </div>
            </div>
            <div className="text-sm sm:ml-12">
              <Tiptap readonly content={note.body} className="max-w-none" />
            </div>
          </div>
        </div>
        {onSeeAll && (
          <div className="mt-1 flex w-full flex-row justify-end pr-2">
            <button
              type="button"
              className="text-sm text-brand-600 underline hover:no-underline"
              onClick={onSeeAll}
            >
              Show all notes
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export const GET_TICKET_NOTE = gql`
  query lastTicketWorkflowStateNote($ticketId: Int!) {
    lastTicketWorkflowStateNote(ticketId: $ticketId) {
      id
      body
      updatedAt
      category
      fromTicketWorkflowState {
        id
        name
      }
      ticketWorkflowState {
        id
        name
      }
      author {
        id
        name
        avatarUrl
      }
    }
  }
`;
