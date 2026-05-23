import { useState } from "react";
import { gql } from "@apollo/client";
import { PencilAltIcon, XIcon } from "@heroicons/react/outline";
import { PencilIcon } from "@heroicons/react/solid";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { Avatar } from "components/views/Avatar";
import { SmartTime } from "components/views/Time";
import { FCWithFragments } from "types";
import { Issue, IssueAction, IssueActionCategory } from "types/graphql";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import Tiptap from "components/TipTap/TipTap";
import { TipTapTextModal } from "components/modals/TipTapTextModal";

interface Props {
  action: IssueAction;
  issue: Issue;
  onUpdate: (issueActionId: number, note: string) => void;
  onDelete: (issueActionId: number) => void;
}

export const IssueActionSupportNote: FCWithFragments<Props> = (props) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const me = useSelector(getMe);

  const { action } = props;

  console.log({ body: action.body });

  const body = action.body || "";

  if (action.category !== IssueActionCategory.SupportNote) {
    console.warn(
      "IssueActionSupportNote was used to display a",
      action.category
    );
    return null;
  }

  if (action.author) {
    return (
      <>
        <div>
          <div className="relative">
            <Avatar
              className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-400 ring-8 ring-white"
              src={action.author.avatarUrl}
              name={action.author.name}
              alt=""
            />
            <span className="absolute -bottom-0.5 -right-1 rounded-tl-md bg-white px-0.5 py-px">
              <PencilIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
        <div className="group relative min-w-0 flex-1 rounded-md bg-yellow-100 px-4 py-2">
          {me?.role?.id === action.author?.id ? (
            <>
              <button
                className="absolute right-2 top-2 rounded p-1 transition hover:bg-yellow-200 group-hover:opacity-100 sm:opacity-0"
                onClick={() => setShowConfirmDelete(true)}
                type="button"
                title="Delete Note"
              >
                <span className="sr-only">Delete note</span>
                <XIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="absolute right-10 top-2 rounded p-1 transition hover:bg-yellow-200 group-hover:opacity-100 sm:opacity-0"
                onClick={() => setShowEditModal(true)}
                type="button"
                title="Edit Note"
              >
                <span className="sr-only">Edit note</span>
                <PencilAltIcon className="h-5 w-5 text-gray-600" />
              </button>
            </>
          ) : null}
          <DangerConfirm
            title="Delete Support Note"
            description="Are you sure you want to delete this note? This action cannot
            be undone."
            cta="Yes, delete note"
            visible={showConfirmDelete}
            onClose={() => setShowConfirmDelete(false)}
            onConfirm={() => props.onDelete(action.id)}
          />
          <TipTapTextModal
            large
            title="Edit your note"
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSubmit={(note) => props.onUpdate(action.id, note)}
            cta="Update note"
            value={body}
            label="Note"
          />
          <div>
            <div className="text-sm">
              <span className="font-medium text-yellow-900">
                {action.author.name}
              </span>

              {me?.role?.id === action.author?.id ? (
                <button
                  className="ml-2 text-yellow-900 underline opacity-0 transition-opacity hover:text-yellow-700 group-hover:opacity-100"
                  onClick={() => setShowEditModal(true)}
                  type="button"
                  title="Edit Note"
                >
                  edit note
                </button>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-yellow-700">
              Added a note
              <SmartTime date={action.createdAt} className="ml-1" />
            </p>
          </div>
          <div className="mt-2 space-y-4 text-sm text-yellow-800">
            <Tiptap readonly content={action.body} className="max-w-none" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 ring-8 ring-white">
          <PencilAltIcon
            className="h-5 w-5 text-brand-500"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-md bg-gray-100 px-4 py-2">
        <div>
          <div className="text-sm">
            <span className="font-medium text-gray-900">Someone</span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Added a note
            <SmartTime date={action.createdAt} className="ml-1" />
          </p>
        </div>
        <div className="mt-2 space-y-4 text-sm text-gray-700">
          {body.split("\n").map((paragraph, index) => (
            <p key={index} className="leading-6">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </>
  );
};

IssueActionSupportNote.fragments = {
  IssueActionSupportNoteFragment: gql`
    fragment IssueActionSupportNoteFragment on IssueAction {
      id
      title
      body
      category
      createdAt
      author {
        id
        name
        avatarUrl
      }
    }
  `,
};
