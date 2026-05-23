import { gql, useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { SearchMain } from "./SearchMain/SearchMain";
import { SearchFilterSection } from "./SearchSide/SearchFilter";
import { useAppDispatch } from "store";
import { setSearchFilter } from "actions/filter/setSearchFilter";
import { QueryReturnValue } from "types/queryTypes";
import { useSelector } from "react-redux";
import { getSelectedItems } from "reducers/selector";
import { TicketBatchEditOverlay } from "pages/ticket/TicketBatchEdit/TicketBatchEditOverlay";
import { Transition } from "@headlessui/react";

interface params {
  projectId?: string;
}

export const Search = () => {
  const params = useParams<params>();
  const projectId = params.projectId ? parseInt(params.projectId) : undefined;
  usePageTitle("Search");
  const dispatch = useAppDispatch();
  const selection = useSelector(getSelectedItems("search"));

  const { data } = useQuery<QueryReturnValue["project"]>(GET_PROJECT, {
    variables: {
      id: projectId,
    },
    skip: !projectId,
  });

  return (
    <div className="flex min-w-0 flex-row sm:mt-6 sm:space-x-2 sm:pb-4">
      <div className="hidden sm:block">
        <SearchFilterSection onClose={() => dispatch(setSearchFilter())} />
      </div>
      <SearchMain project={data?.project} />
      <Transition
        appear={true}
        show={selection.length > 0}
        className="fixed bottom-12 right-1/2 z-20 -mr-[150px] transition-all sm:right-1/4 lg:right-1/3"
        enter="duration-500"
        enterFrom="opacity-0 -bottom-0"
        enterTo="opacity-100 bottom-14"
        entered="bottom-14"
        leave="duration-250"
        leaveFrom="opacity-100 bottom-14"
        leaveTo="opacity-0 -bottom-0"
      >
        <TicketBatchEditOverlay className="shadow-lg" domain="search" />
      </Transition>
    </div>
  );
};

// const EXPORT_SELECTION_QUERY = gql`
//   query ExportTicketsForSearch($sources: [String!]!) {
//     exportTickets(sources: $sources) {
//       local_id
//       title
//       description
//       id
//       created_at
//       status
//       stage
//       eta
//       product
//       workflow
//       project
//       owner_name
//       owner_email
//       scheduled_at
//       closed_at
//       author_name
//       author_email
//       ancestor_tickets
//       successor_tickets
//       tags
//     }
//   }
// `;

const GET_PROJECT = gql`
  query GetProjectForSearch($id: Int!) {
    project(id: $id) {
      id
      name
      parentId
    }
  }
`;
