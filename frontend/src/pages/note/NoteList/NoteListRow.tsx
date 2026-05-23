import { gql, useMutation } from "@apollo/client";
import { trim } from "lodash";
import { useEffect, useState } from "react";
import {
  MutationUpdateNoteArgs,
  MutationUpdateNoteColorArgs,
  Note,
  NoteColor,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { FCWithFragments } from "types";
import { XIcon } from "@heroicons/react/solid";
import { MutationReturnValue } from "types/queryTypes";
import cn from "classnames";
import { ClickTooltip } from "components/help/Tooltip";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";

interface Props {
  note: Note;
  onDeleteNote: (note: Note) => void;
}

const BG_COLORS = {
  YELLOW: "bg-yellow-100",
  BLUE: "bg-blue-100",
  PURPLE: "bg-purple-100",
  GREEN: "bg-green-100",
  PINK: "bg-pink-100",
  ORANGE: "bg-orange-100",
};

const BUTTON_BG_COLORS = {
  YELLOW: "bg-yellow-300",
  BLUE: "bg-blue-300",
  PURPLE: "bg-purple-300",
  GREEN: "bg-green-300",
  PINK: "bg-pink-300",
  ORANGE: "bg-orange-300",
};

const TEXT_COLORS = {
  YELLOW: "text-yellow-900",
  BLUE: "text-blue-800",
  PURPLE: "text-purple-800",
  GREEN: "text-green-800",
  PINK: "text-pink-800",
  ORANGE: "text-orange-800",
};

export const NoteListRow: FCWithFragments<Props> = (props) => {
  const { note, onDeleteNote } = props;
  const [body, setBody] = useState(note.body);
  const [color, setColor] = useState(note.color);
  const [isConfirmVisible, setIsConfirmModalVisible] = useState(false);
  const me = useSelector(getMe);

  useEffect(() => setBody(note.body), [note.body]);
  useEffect(() => setColor(note.color), [note.color]);

  const [updateNote] = useMutation<
    MutationReturnValue["updateNote"],
    MutationUpdateNoteArgs
  >(UPDATE_NOTE_MUTATION, {
    onError: onGraphQLError({
      title: "Note update failed",
    }),
    onCompleted: onMutationComplete({
      title: "Note Updated",
      callback: (data) => setBody(data.updateNote.body),
    }),
  });

  const [updateNoteColor] = useMutation<
    MutationReturnValue["updateNoteColor"],
    MutationUpdateNoteColorArgs
  >(UPDATE_NOTE_COLOR_MUTATION, {
    onError: onGraphQLError({
      title: "Note color change failed",
    }),
    onCompleted: onMutationComplete({
      callback: (data) => setBody(data.updateNoteColor.body),
    }),
  });

  const onUpdate = () => {
    const trimmedBody = trim(body);

    if (trimmedBody && trimmedBody !== note.body) {
      updateNote({
        variables: {
          noteId: note.id,
          input: {
            body: trimmedBody,
          },
        },
      });
    }
  };

  const colorTooltip = (close: () => void) => (
    <div className="flex flex-col space-y-1">
      {[
        NoteColor.Blue,
        NoteColor.Green,
        NoteColor.Orange,
        NoteColor.Pink,
        NoteColor.Purple,
        NoteColor.Yellow,
      ].map((color) => (
        <button
          key={color}
          onClick={() => {
            updateNoteColor({
              variables: { noteId: note.id, color: color },
            });
            close();
          }}
          className="flex flex-row items-center space-x-2 rounded px-2 py-1 text-right text-gray-200  hover:bg-gray-800 hover:text-white"
          type="button"
        >
          <div
            className={cn(BUTTON_BG_COLORS[color], "h-4 w-4 rounded-full", {
              "ring-1 ring-white ring-offset-2 ring-offset-gray-700":
                color === props.note.color,
            })}
          ></div>
          <div
            className={cn({
              "font-semibold text-white": color === props.note.color,
            })}
          >
            {me?.role?.preferences.noteColors[color]}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="group relative">
      <DangerConfirm
        cta="Yes, delete note"
        description="Deleted note cannot be recovered."
        onConfirm={() => onDeleteNote(note)}
        onClose={() => {
          setBody(note.body);
          setIsConfirmModalVisible(false);
        }}
        title={`Delete Note?`}
        visible={isConfirmVisible}
      />
      <button
        onClick={() => setIsConfirmModalVisible(true)}
        className="absolute -right-2 -top-3 rounded-full border-2 border-white bg-red-500 p-0.5 opacity-0 shadow transition-opacity hover:bg-red-600 group-hover:opacity-100"
        type="button"
      >
        <XIcon className="h-4 w-4 text-white" />
      </button>
      <div className="absolute -top-3 right-5 opacity-0 transition-opacity group-hover:opacity-100">
        <ClickTooltip tooltip={(close) => colorTooltip(close)}>
          <div
            role="button"
            className="grid h-6 w-6 grid-cols-2 overflow-hidden rounded-full border-2 border-white hover:ring hover:ring-sky-300"
          >
            <div className="h-2.5 w-2.5 bg-yellow-300" />
            <div className="h-2.5 w-2.5 bg-purple-300" />
            <div className="h-2.5 w-2.5 bg-orange-300" />
            <div className="h-2.5 w-2.5 bg-green-300" />
          </div>
        </ClickTooltip>
      </div>

      <textarea
        onBlur={onUpdate}
        className={cn(
          BG_COLORS[color],
          TEXT_COLORS[color],
          "h-48 w-full overflow-y-auto rounded border-0 text-sm shadow-md focus:outline-none focus:ring focus:ring-brand-200 focus:ring-offset-2"
        )}
        onChange={(evt) => {
          if (evt.currentTarget.value === "") {
            setIsConfirmModalVisible(true);
          }
          setBody(evt.currentTarget.value);
        }}
        value={body}
      />
    </div>
  );
};

NoteListRow.fragments = {
  NoteListRowFragment: gql`
    fragment NoteListRowFragment on Note {
      id
      body
      color
      updatedAt
    }
  `,
};

const UPDATE_NOTE_MUTATION = gql`
  mutation updateNote($noteId: Int!, $input: UpdateNoteInput!) {
    updateNote(input: $input, noteId: $noteId) {
      id
      ...NoteListRowFragment
    }
  }
  ${NoteListRow.fragments.NoteListRowFragment}
`;

const UPDATE_NOTE_COLOR_MUTATION = gql`
  mutation updateNoteColor($noteId: Int!, $color: NoteColor!) {
    updateNoteColor(color: $color, noteId: $noteId) {
      id
      ...NoteListRowFragment
    }
  }
  ${NoteListRow.fragments.NoteListRowFragment}
`;
