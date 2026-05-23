import React, { useState, useCallback } from "react";
import { DocumentationListRow } from "./DocumentationListRow";
import { Paginator } from "components/views/Paginator";
import { EmptyState } from "components/views/EmtpyState";
import { DocumentationCreateModal } from "../DocumentationCreate/DocumentationCreateModal";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Documentation } from "types/graphql";
import { Button } from "components/fields/Button";
import { CubeIcon, PlusIcon, SearchIcon } from "@heroicons/react/outline";
import { PlusCircleIcon } from "@heroicons/react/solid";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { urlResolver } from "utils/navigation";
import { usePageTitle } from "hooks/usePageTitle";
import { useUrlQuery } from "hooks/useUrlQuery";
import { useParams } from "react-router-dom";
import { onGraphQLError } from "utils/GQLClient";
import { NoAccess } from "components/views/NoAccess";
import { QueryReturnValue } from "types/queryTypes";

export const DocumentationList: React.FC = (props) => {
  usePageTitle("Documentation Listing");
  const { orgId } = useParams<{ orgId: string }>();
  const urlQuery = useUrlQuery();
  const pagination = usePagination({
    pageSize: 10,
  });
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);
  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);

  const [
    createDocumentationModalVisible,
    setCreateDocumentationModalVisibility,
  ] = useState(urlQuery.get("create") === "true");

  const searchElt = useSlashForSearch();

  const { data, loading, error } = useQuery<QueryReturnValue["documentations"]>(
    GET_DOCUMENTATIONS,
    {
      variables: {
        first: pagination.pageSize,
        search: filter,
        offset: pagination.pageSize * pagination.page,
      },
      fetchPolicy: "cache-and-network",
      onError: onGraphQLError({ title: "Could not access documentation" }),
    }
  );

  const loadingList = (
    <div className="col-span-6">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <CubeIcon name="MdCube" className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">
          Loading Documentations...
        </p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="col-span-6">
      <EmptyState
        title="No Documentations."
        subTitle="Get started by creating a new documentation."
      >
        <Button
          className="my-4"
          type="button"
          btnType="primary"
          onClick={() => setCreateDocumentationModalVisibility(true)}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          New Documentation
        </Button>
      </EmptyState>
    </div>
  );

  const documentations = (
    data?.documentations ? data.documentations.nodes : []
  ) as Documentation[];
  const total = data?.documentations ? data.documentations.totalCount : 0;

  const documentationList = documentations.map((documentation, index) => (
    <li key={documentation.id}>
      <DocumentationListRow
        documentation={documentation}
        index={index}
        url={urlResolver.documentation.view(orgId, documentation.id)}
      />
    </li>
  ));

  if (error) {
    return <NoAccess className="h-full" />;
  }

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start sm:mt-6">
      <DocumentationCreateModal
        visible={createDocumentationModalVisible}
        onClose={() => setCreateDocumentationModalVisibility(false)}
      />
      <div className="flex flex-col px-4 pb-4 sm:flex-row sm:px-0">
        <div className="flex-1">
          <div
            className="relative max-w-lg rounded-md sm:mr-4"
            onClick={() => searchElt.current?.focus()}
          >
            <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
            <input
              id="search"
              onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
              ref={searchElt}
              value={debouncedFilter}
              placeholder={`Search documentation... (press "/" to focus)`}
              className="block w-full rounded-md border border-gray-100 bg-gray-200 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:border-gray-300 focus:bg-white focus:outline-none sm:text-sm sm:leading-5"
            />
            {debouncedFilter && (
              <div className="absolute right-2 top-0 bottom-0 flex items-center">
                <button
                  onClick={() => setFilter("")}
                  className="focus:ring-blue rounded-md bg-gray-300 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
                >
                  clear
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-0 mt-2 sm:mt-0">
          <Button
            type="button"
            btnType="white"
            fullInMobile
            onClick={() => setCreateDocumentationModalVisibility(true)}
          >
            <PlusCircleIcon className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" />
            New Documentation
          </Button>
        </div>
      </div>
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {documentationList.length > 0
            ? documentationList
            : loading
            ? loadingList
            : emptyList}
        </ul>
      </div>
      <Paginator
        total={total}
        {...pagination}
        isLoading={loading}
        setPage={pagination.setPage}
        itemCount={documentations.length}
        itemName="documentation"
        className="mt-4"
      />
    </div>
  );
};

const GET_DOCUMENTATIONS = gql`
  query GetDocumentations($first: Int!, $search: String, $offset: Int) {
    documentations(first: $first, search: $search, offset: $offset) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        name
        description
        stage
        ...DocumentationListRowFragment
      }
    }
  }
  ${DocumentationListRow.fragments.DocumentationListRowFragment}
`;
