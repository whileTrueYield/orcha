import React, { useCallback, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import {
  BookOpenIcon,
  DocumentTextIcon,
  PencilAltIcon,
  SearchIcon,
} from "@heroicons/react/outline";
import { Paginator } from "components/views/Paginator";
import { useDebouncedState } from "hooks/useDebouncedState";
import { usePagination } from "hooks/usePagination";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { FCWithFragments } from "types";
import {
  MutationCreateNoteArgs,
  MutationDeleteNoteArgs,
  MutationUpdateRoleNoteColorPreferencesArgs,
  Note,
  NoteColor,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { NoteListRow } from "./NoteListRow";
import { trim, without } from "lodash";
import { PlusOnIcon } from "components/icons/PlusOnIcon";
import { useBlockingMutation } from "utils/graphql";
import { usePageTitle } from "hooks/usePageTitle";
import { PopoverTips } from "components/help/HelpBlock";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import cn from "classnames";
import { PencilIcon, XIcon } from "@heroicons/react/solid";
import { HoverTooltip } from "components/help/Tooltip";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { InputModal } from "components/modals/InputModal";

const BUTTON_NOTE_COLORS = {
  YELLOW: "bg-yellow-300 hover:bg-yellow-400",
  BLUE: "bg-blue-300 hover:bg-blue-400",
  PURPLE: "bg-purple-300 hover:bg-purple-400",
  GREEN: "bg-green-300 hover:bg-green-400",
  PINK: "bg-pink-300 hover:bg-pink-400",
  ORANGE: "bg-orange-300 hover:bg-orange-400",
};

const noteColors = [
  NoteColor.Blue,
  NoteColor.Green,
  NoteColor.Orange,
  NoteColor.Pink,
  NoteColor.Purple,
  NoteColor.Yellow,
];

export const NoteList: FCWithFragments = () => {
  usePageTitle("Notes");
  const pagination = usePagination({ pageSize: 11 });
  const me = useSelector(getMe);
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);
  const [colorFilter, _setColorFilter] = useState<NoteColor[]>([]);
  const [editColorVisible, setEditcolorVisible] = useState(false);

  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);

  const setColorFilter = (colors: NoteColor[]) => {
    _setColorFilter(colors);
    setPage(0);
  };

  const noteQueryVariables: any = {
    last: pagination.pageSize,
    search: filter,
    offset: pagination.pageSize * pagination.page,
    colors: colorFilter,
  };

  const { data, loading, refetch } = useQuery<QueryReturnValue["notes"]>(
    GET_NOTES,
    {
      fetchPolicy: "cache-and-network",
      variables: noteQueryVariables,
    },
  );

  const [deleteNote] = useBlockingMutation<
    MutationReturnValue["deleteNote"],
    MutationDeleteNoteArgs
  >(DELETE_NOTE_MUTATION, {
    onError: onGraphQLError({
      title: "Note deletion failed",
    }),
    onCompleted: onMutationComplete({
      title: "Note Deleted",
      callback: refetch,
    }),
  });

  const [updateNoteColor] = useBlockingMutation<
    MutationReturnValue["updateRoleNoteColorPreferences"],
    MutationUpdateRoleNoteColorPreferencesArgs
  >(UPDATE_NOTE_COLOR);

  const searchElt = useSlashForSearch();

  const loadingList = (
    <div className="col-span-6">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <BookOpenIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading Notes...</p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
      <CreateNoteForm />
    </div>
  );
  const notes = (data?.notes ? data.notes.nodes : []) as Note[];
  const total = data?.notes ? data.notes.totalCount : 0;

  const noteList = (
    <div className="mx-auto grid max-w-9xl grid-cols-1 gap-4 px-4 sm:px-0 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ">
      <CreateNoteForm />
      {notes.map((note) => {
        return (
          <NoteListRow
            note={note}
            key={note.id}
            onDeleteNote={(note) =>
              deleteNote({ variables: { noteId: note.id } })
            }
          />
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start sm:mt-6">
      <InputModal
        onClose={() => setEditcolorVisible(false)}
        label="Rename color"
        description="Organize your notes by color. You can change names whenever you want."
        visible={editColorVisible}
        cta="Rename color"
        onSubmit={({ value }) =>
          updateNoteColor({
            variables: {
              input: {
                color: colorFilter[0],
                value,
              },
            },
          })
        }
        title="Name Your Colors"
        placeholder="Dev Ops"
        value={me?.role?.preferences.noteColors[colorFilter[0]]}
      />
      <div>
        <div className="flex flex-col items-center justify-between space-x-3 space-y-2 px-4 py-4 sm:flex-row sm:space-y-0 sm:px-0">
          <div className="flex-1 truncate text-2xl text-gray-700 sm:font-medium">
            {colorFilter.length > 0 && colorFilter.length < noteColors.length
              ? colorFilter
                  .map((color) => me?.role?.preferences.noteColors[color])
                  .join(", ")
              : "All Notes"}
            {colorFilter.length === 1 ? (
              <button
                onClick={() => setEditcolorVisible(true)}
                className={cn(
                  "ml-2 h-5 w-5 rounded-full bg-gray-100 p-0.5 text-sky-400 ring-sky-300 ring-offset-1 ring-offset-gray-100 transition-all hover:bg-sky-100 hover:text-sky-600 hover:shadow-md hover:ring",
                )}
                type="button"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            ) : (
              <PopoverTips
                title="All Notes"
                className="relative top-0.5 ml-1 inline-block px-1"
              >
                <p>Your notes are only visible to you.</p>
                <p>
                  To rename a color, select it and click on the pencil icon next
                  to it.
                </p>

                <p>
                  You can use the
                  <PencilAltIcon className="mx-1 -mt-px inline-block h-4 w-4 rounded border border-white bg-white p-px text-gray-500" />
                  in the top right to quickly create a new note.
                </p>
              </PopoverTips>
            )}
          </div>
          <div className="flex shrink-0 flex-row space-x-2">
            {colorFilter.length > 0 ? (
              <button
                onClick={() => setColorFilter([])}
                className={cn(
                  "h-5 w-5 rounded-full bg-gray-300 p-0.5 text-white shadow ring-sky-300 transition-all hover:bg-gray-400 hover:shadow-md hover:ring",
                )}
                type="button"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : null}

            {noteColors.map((color) => (
              <HoverTooltip
                key={color}
                tooltip={me?.role?.preferences.noteColors[color]}
              >
                <button
                  onClick={() => {
                    if (colorFilter.includes(color)) {
                      setColorFilter(without(colorFilter, color));
                    } else {
                      setColorFilter([...colorFilter, color]);
                    }
                  }}
                  className={cn(
                    BUTTON_NOTE_COLORS[color],
                    "h-5 w-5 rounded-full shadow transition-all hover:shadow-md",
                    {
                      "ring ring-gray-600": colorFilter.includes(color),
                    },
                  )}
                  type="button"
                />
              </HoverTooltip>
            ))}
          </div>
          <div
            className="relative w-full rounded-md sm:mr-4 sm:max-w-lg"
            onClick={() => searchElt.current?.focus()}
          >
            <SearchIcon className="absolute bottom-0 left-3 top-2 h-5 w-5 items-center text-gray-400" />
            <input
              id="search"
              onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
              ref={searchElt}
              value={debouncedFilter}
              placeholder={`Search note... (press "/" to focus)`}
              className="block w-full rounded-md border border-gray-100 bg-gray-200 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:border-gray-300 focus:bg-white focus:outline-none sm:text-sm sm:leading-5"
            />
            {filter && (
              <div className="absolute bottom-0 right-2 top-0 flex items-center">
                <button
                  onClick={() => setFilter("")}
                  className="focus:ring-blue rounded-md bg-gray-300 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
                >
                  clear
                </button>
              </div>
            )}
          </div>
          {/* <div className="hidden items-center justify-center rounded-md border border-brand-200 bg-brand-100 py-1.5 pl-2 pr-3 text-base text-brand-700 sm:flex">
            <InformationCircleIcon className="mr-1 h-5 w-5 text-brand-600 opacity-75" />
            Your notes are only visible to you
          </div> */}
        </div>
        <div>
          {notes.length > 0 ? noteList : loading ? loadingList : emptyList}
        </div>
        <Paginator
          total={total}
          {...pagination}
          isLoading={loading}
          setPage={setPage}
          itemCount={notes.length}
          itemName="note"
          className="mt-8 px-4 sm:px-0"
        />
      </div>
    </div>
  );
};

const CreateNoteForm: React.FC = (props) => {
  const [body, setBody] = useState("");

  const [createNote] = useBlockingMutation<
    { createNote: Note },
    MutationCreateNoteArgs
  >(CREATE_NOTE_MUTATION, {
    onError: onGraphQLError({
      title: "Note creation failed",
    }),
    onCompleted: onMutationComplete({
      title: "Note Created",
      callback: () => {
        setBody("");
      },
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }
      const note = data.createNote;

      cache.modify({
        fields: {
          notes(paginatedNotes) {
            const newNote = cache.writeFragment({
              data: note,
              fragment: NoteListRow.fragments.NoteListRowFragment,
            });

            return {
              ...paginatedNotes,
              nodes: [...paginatedNotes.nodes, newNote],
              totalCount: paginatedNotes.totalCount + 1,
              pageInfo: {
                ...paginatedNotes.pageInfo,
                pageSize: paginatedNotes.pageInfo.pageSize + 1,
              },
            };
          },
        },
      });
    },
  });

  const onCreate = () => {
    const trimmedBody = trim(body);
    if (body) {
      createNote({ variables: { input: { body: trimmedBody } } });
    }
  };

  return (
    <div className="relative">
      <textarea
        className="relative z-0 h-48 w-full overflow-y-auto rounded-md border-2 border-dashed border-gray-300 bg-transparent text-sm  transition-all hover:border-gray-400 focus:z-20 focus:rounded focus:border-0 focus:border-transparent focus:bg-yellow-100 focus:text-yellow-900 focus:shadow-md focus:outline-none focus:ring focus:ring-brand-200 focus:ring-offset-2"
        onChange={(event) => setBody(event.currentTarget.value)}
        onBlur={onCreate}
        value={body}
        id="new-note"
      />
      <label
        className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center"
        htmlFor="new-note"
      >
        <PlusOnIcon
          className="text-gray-400"
          plusIconClassName="w-4 h-4 bg-gray-100"
        >
          <DocumentTextIcon className="h-8 w-8" />
        </PlusOnIcon>
        <span className="mt-1 block text-sm font-medium text-gray-600">
          New Note
        </span>
      </label>
    </div>
  );
};

NoteList.fragments = {
  NoteListPaginatedNoteFragment: gql`
    fragment NoteListPaginatedNoteFragment on PaginatedNotes {
      nodes {
        id
        ...NoteListRowFragment
      }
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
    ${NoteListRow.fragments.NoteListRowFragment}
  `,
};

const GET_NOTES = gql`
  query GetNotes(
    $last: Int!
    $search: String
    $offset: Int
    $colors: [NoteColor!]
  ) {
    notes(last: $last, search: $search, offset: $offset, colors: $colors) {
      ...NoteListPaginatedNoteFragment
    }
  }
  ${NoteList.fragments.NoteListPaginatedNoteFragment}
`;

const DELETE_NOTE_MUTATION = gql`
  mutation DeleteNoteList($noteId: Int!) {
    deleteNote(noteId: $noteId) {
      id
      body
    }
  }
`;

const CREATE_NOTE_MUTATION = gql`
  mutation CreateNoteForList($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      body
      updatedAt
    }
  }
`;

const UPDATE_NOTE_COLOR = gql`
  mutation updateRoleNoteColorPreferences($input: UpdateRoleNotColorsInput!) {
    updateRoleNoteColorPreferences(input: $input) {
      id
      preferences {
        noteColors {
          YELLOW
          BLUE
          PURPLE
          GREEN
          PINK
          ORANGE
        }
      }
    }
  }
`;
