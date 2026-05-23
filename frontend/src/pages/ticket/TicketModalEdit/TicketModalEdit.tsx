import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { ModelStage } from "types/graphql";
import { DraftTicketEditForm } from "./DraftTicketEditForm";
import { FCWithFragments } from "types";
import { gql, useQuery } from "@apollo/client";
import { TicketEditForm } from "./TicketEditForm";
import { DocumentNode } from "graphql";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { ProjectStaticCrumbs } from "pages/project/ProjectView/ProjectStaticCrumbs";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  setOpen: (open: boolean) => void;
  ticketId: number;
  refetchQueries?: DocumentNode[];
}

export const TicketModalEdit: FCWithFragments<Props> = (props) => {
  const { setOpen, ticketId, refetchQueries } = props;

  const { data } = useQuery<QueryReturnValue["ticket"]>(
    GET_TICKET_FOR_MODAL_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: { id: ticketId },
    }
  );

  useRefetchOnVisible([GET_TICKET_FOR_MODAL_QUERY]);

  if (!data) {
    return null;
  }

  const ticket = data.ticket;

  const renderTicketStage = () => {
    if (ticket.stage === ModelStage.Draft) {
      return (
        <DraftTicketEditForm ticket={ticket} refetchQueries={refetchQueries} />
      );
    } else {
      return <TicketEditForm ticket={ticket} refetchQueries={refetchQueries} />;
    }
  };

  return (
    <Transition.Root appear show as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-30 overflow-hidden"
        onClose={setOpen}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-all" />

          <div className="fixed inset-y-0 right-0 flex pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen p-2 sm:max-w-lg sm:py-2 sm:px-4">
                <div className="relative flex h-full flex-col rounded-xl bg-gray-100 shadow-xl">
                  <div className="min-h-0 overflow-y-scroll rounded-xl pb-4 pt-2">
                    <div className="mx-4 mb-2 flex flex-row items-center space-x-4">
                      <button
                        type="button"
                        className="shrink-0 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                      <ProjectStaticCrumbs
                        project={ticket.project}
                        category="listing"
                      />
                    </div>
                    {renderTicketStage()}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

TicketModalEdit.fragments = {
  TicketModalEditFragment: gql`
    fragment TicketModalEditFragment on Ticket {
      id
      localId
      title
      project {
        ...ProjectStaticCrumbsFragment
      }
      ...DraftTicketEditFormFragment
      ...TicketEditFormFragment
    }
    ${DraftTicketEditForm.fragments.DraftTicketEditFormFragment}
    ${TicketEditForm.fragments.TicketEditFormFragment}
    ${ProjectStaticCrumbs.fragments.ProjectStaticCrumbsFragment}
  `,
};

const GET_TICKET_FOR_MODAL_QUERY = gql`
  query GetTicketForProject($id: Int!) {
    ticket(id: $id) {
      id
      localId
      ...TicketModalEditFragment
    }
  }
  ${TicketModalEdit.fragments.TicketModalEditFragment}
`;
