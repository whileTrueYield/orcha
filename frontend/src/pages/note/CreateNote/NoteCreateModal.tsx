import { gql, useQuery } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { Modal, ModalProps } from "components/modals/Modal";
import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { noteFormFields } from "../formFields";
import {
  Note,
  MutationCreateNoteArgs,
  MutationUpdateNoteArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { DocumentAddIcon, PencilIcon } from "@heroicons/react/outline";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/solid";
import { FormTextareaGroup } from "components/fields/Textarea";
import { Button } from "components/fields/Button";
import { Dialog } from "@headlessui/react";
import { FCWithFragments } from "types";
import { useBlockingMutation } from "utils/graphql";
import { QueryReturnValue } from "types/queryTypes";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    body: noteFormFields.body.required(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {}

export const NoteCreateModal: FCWithFragments<Props> = (props) => {
  const { visible } = props;
  const [editMode, setEditMode] = useState(false);
  const [lastNote, setLastNote] = useState<Note | null>(null);

  const { refetch } = useQuery<QueryReturnValue["lastNote"]>(LAST_NOTE_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.lastNote) {
        setLastNote(data.lastNote);
      } else {
        setEditMode(false);
      }
    },
  });

  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  return (
    <Modal {...props}>
      {editMode && lastNote ? (
        <NoteEditForm
          onClose={props.onClose}
          lastNote={lastNote}
          setEditMode={setEditMode}
        />
      ) : (
        <NoteCreateForm
          onClose={props.onClose}
          lastNote={lastNote}
          setEditMode={setEditMode}
        />
      )}
    </Modal>
  );
};

interface CreateNoteProps {
  lastNote: Note | null;
  onClose: () => void;
  setEditMode: (mode: boolean) => void;
}

const NoteCreateForm: React.FC<CreateNoteProps> = (props) => {
  const { setEditMode } = props;
  const [submitted, setSubmitted] = useState(false);
  const createFormContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });
  const formRef = useRef<HTMLFormElement>(null);

  const { setFocus } = createFormContext;
  React.useEffect(() => {
    setFocus("body");
  }, [setFocus]);

  const [createNote] = useBlockingMutation<
    { createNote: Note },
    MutationCreateNoteArgs
  >(CREATE_NOTE_MUTATION, {
    onError: onGraphQLError({
      title: "Note creation failed",
      callback: () => setSubmitted(false),
    }),
    onCompleted: onMutationComplete({
      title: "Note Created",
      callback: () => {
        createFormContext.reset();
        setSubmitted(false);
        props.onClose();
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
              fragment: NoteCreateModal.fragments.NoteCreateModalDetails,
            });

            return {
              ...paginatedNotes,
              nodes: [newNote, ...paginatedNotes.nodes],
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

  const onCreate = (formData: FormSchema) => {
    setSubmitted(true);
    createNote({
      variables: {
        input: {
          body: formData.body,
        },
      },
    });
  };

  return (
    <FormProvider {...createFormContext}>
      <form
        ref={formRef}
        onSubmit={createFormContext.handleSubmit(onCreate)}
        className="sm:flex sm:items-start"
      >
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
          <DocumentAddIcon
            className="h-6 w-6 text-brand-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
          >
            Create a New Note
          </Dialog.Title>
          <div className="mt-2">
            <div className="mt-4">
              <FormTextareaGroup
                name="body"
                tabIndex={4}
                rows={3}
                placeholder="e.g. Finish the post about quantum gravity"
                autoFocus
                onKeyPress={(event) => {
                  if (
                    event.code === "Enter" &&
                    event.ctrlKey &&
                    formRef.current
                  ) {
                    formRef.current.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true }),
                    );
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-between sm:mt-4 sm:flex-row">
            <div className="mb-4 flex flex-row items-center sm:mb-0">
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex flex-1 flex-row items-center justify-center space-x-1 rounded-md rounded-r-none border border-r-0 bg-white px-4 py-2 text-sm text-gray-600 disabled:bg-gray-200"
                disabled={!props.lastNote}
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">Last Note</span>
              </button>
              <button
                type="button"
                className="flex flex-1 flex-row items-center justify-center space-x-1 rounded-md rounded-l-none border border-brand-200 bg-brand-100 px-4 py-2 text-sm font-medium text-brand-900"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">New Note</span>
              </button>
            </div>
            <div className="sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                btnType="primary"
                tabIndex={5}
                fullInMobile
                disabled={submitted}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Create
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={6}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

interface UpdateNoteProps {
  lastNote: Note | null;
  onClose: () => void;
  setEditMode: (mode: boolean) => void;
}

const NoteEditForm: React.FC<UpdateNoteProps> = (props) => {
  const { lastNote, setEditMode } = props;
  const formRef = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const editFormContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { body: lastNote?.body },
  });

  const { setFocus } = editFormContext;
  React.useEffect(() => {
    setFocus("body");
  }, [setFocus]);

  const [updateNote] = useBlockingMutation<
    { updateNote: Note },
    MutationUpdateNoteArgs
  >(UPDATE_NOTE_MUTATION, {
    onError: onGraphQLError({
      title: "Note update failed",
      callback: () => setSubmitted(false),
    }),
    onCompleted: onMutationComplete({
      title: "Note Updated",
      callback: () => {
        props.onClose();
      },
    }),
  });

  const onUpdate = (formData: FormSchema) => {
    if (lastNote) {
      setSubmitted(true);
      updateNote({
        variables: {
          noteId: lastNote.id,
          input: {
            body: formData.body,
          },
        },
      });
    }
  };

  return (
    <FormProvider {...editFormContext}>
      <form
        ref={formRef}
        onSubmit={editFormContext.handleSubmit(onUpdate)}
        className="sm:flex sm:items-start"
      >
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
          <PencilIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
        </div>
        <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
          >
            Edit Last Note
          </Dialog.Title>
          <div className="mt-2">
            <div className="mt-4">
              <FormTextareaGroup
                name="body"
                tabIndex={4}
                rows={3}
                placeholder="e.g. Finish the post about quantum gravity"
                autoFocus
                onKeyPress={(event) => {
                  if (
                    event.code === "Enter" &&
                    event.ctrlKey &&
                    formRef.current
                  ) {
                    formRef.current.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true }),
                    );
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-col justify-between sm:mt-4 sm:flex-row">
            <div className="mb-4 flex flex-row items-center sm:mb-0">
              <button
                type="button"
                className="flex flex-1 flex-row items-center justify-center space-x-1 rounded-md rounded-r-none border border-brand-200 bg-brand-100 px-4 py-2 text-sm font-medium text-brand-900 disabled:cursor-not-allowed"
                disabled={!props.lastNote}
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">Last Note</span>
              </button>
              <button
                type="button"
                className="flex flex-1 flex-row items-center justify-center space-x-1 rounded-md rounded-l-none border border-l-0 bg-white px-4 py-2 text-sm text-gray-600"
                onClick={() => setEditMode(false)}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="whitespace-nowrap">New Note</span>
              </button>
            </div>
            <div className="sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                btnType="primary"
                tabIndex={5}
                fullInMobile
                disabled={submitted}
              >
                <PencilIcon className="mr-2 h-5 w-5" />
                Update
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={6}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

NoteCreateModal.fragments = {
  NoteCreateModalDetails: gql`
    fragment NoteCreateModalDetails on Note {
      id
      body
      updatedAt
    }
  `,
};

const CREATE_NOTE_MUTATION = gql`
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      ...NoteCreateModalDetails
    }
  }
  ${NoteCreateModal.fragments.NoteCreateModalDetails}
`;

const UPDATE_NOTE_MUTATION = gql`
  mutation EditNoteModal($noteId: Int!, $input: UpdateNoteInput!) {
    updateNote(input: $input, noteId: $noteId) {
      id
      ...NoteCreateModalDetails
    }
  }
  ${NoteCreateModal.fragments.NoteCreateModalDetails}
`;

const LAST_NOTE_QUERY = gql`
  query LastNoteModal {
    lastNote {
      id
      ...NoteCreateModalDetails
    }
  }
  ${NoteCreateModal.fragments.NoteCreateModalDetails}
`;
