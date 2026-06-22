import { gql, useLazyQuery } from "@apollo/client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  Transition,
} from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/outline";
import { FolderIcon } from "@heroicons/react/solid";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FolderIcon as ProjectIconSolid,
} from "@heroicons/react/solid";
import { ModalProps } from "components/modals/Modal";
import { useDebouncedState } from "hooks/useDebouncedState";
import { trim } from "lodash";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { getMe } from "reducers/selector";
import { SearchResult } from "types/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { LoadingIcon } from "../icons/LoadingIcon";
import { CheckboxGroup } from "components/fields/Checkbox";
import { QueryReturnValue } from "types/queryTypes";
import cn from "classnames";
import { TicketIdTag } from "components/tags/TicketIdTag";

interface Props extends ModalProps {}

// Transform a previously visited id string into a SearchResult object
// "<type>:<id>:<name>" => {type: ..., id: ..., name:...}
function decodeSearchResult(result: string): SearchResult | null {
  try {
    const [objectType, ...attributes] = result.split(":");

    // ticket have a richer format
    // "<type>:<id>:<productCode>:<localId>:<name>"
    if (objectType === "ticket") {
      return {
        id: result,
        name: attributes.slice(3).join(":"),
        description: "",
        meta: "",
      };
    } else {
      return {
        id: result,
        name: attributes.slice(1).join(":"),
        description: "",
        meta: "",
      };
    }
  } catch (error) {
    return null;
  }
}

export const SearchModal: React.FC<Props> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [includeClosed, setIncludeClosed] = useState(false);

  const me = useSelector(getMe);

  const recentlyVisited = me?.role?.preferences.recentlyVisited || [];

  const [debouncedQuery, debouncedSetQuery, query, setQuery] =
    useDebouncedState("", 500);

  const [search, { loading }] = useLazyQuery<QueryReturnValue["search"]>(
    SEARCH_QUERY,
    {
      onCompleted: (data) => {
        setResults(data.search);
      },
      onError: onGraphQLError({ title: "Search failed" }),
    },
  );

  useEffect(() => {
    if (query) {
      search({ variables: { query: query, includeClosed } });
    } else {
      setResults([]);
    }
  }, [search, setResults, query, includeClosed]);

  const onResultSelect = (result: SearchResult) => {
    // if a query is different from the debounced version it means we have
    // not yet sent the query to the server, we should wait for the response
    // before allowing the user the select a result from a previous search
    if (query !== debouncedQuery) {
      return;
    }

    const [objectType, objectId] = result.id.split(":");

    switch (objectType) {
      case "ticket":
        history.push(urlResolver.ticket.view(orgId, parseInt(objectId)));
        break;
      case "project":
        history.push(urlResolver.explorer.editor(orgId, parseInt(objectId)));
        break;
      default:
        console.warn("Unknown search result", result);
        return;
    }

    props.onClose();
  };

  const renderResult = (result: SearchResult) => {
    const [resultType, ...rest] = result.id.split(":");

    if (resultType === "project") {
      return (
        <>
          <FolderIcon className="mr-2 h-5 w-5 shrink-0 text-yellow-300 group-[.is-active]:hidden" />
          <ProjectIconSolid className="mr-2 hidden h-5 w-5 shrink-0 text-yellow-400 group-[.is-active]:block" />
          <div className="flex-1">{result.name}</div>
        </>
      );
    } else {
      return (
        <>
          <TicketIdTag
            productCode={rest[1]}
            localId={rest[2]}
            className="mr-2 text-xs"
          />
          <div className="flex-1">{result.name}</div>
        </>
      );
    }
  };

  const renderSearchResult = (results: SearchResult[]) => {
    if (loading) {
      return <p className="p-4 text-sm text-gray-500">searching...</p>;
    }
    if (results.length === 0) {
      return <p className="p-4 text-sm text-gray-500">No results found.</p>;
    }

    return (
      <ComboboxOptions
        static
        className="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800"
      >
        {results.map((result) => (
          <ComboboxOption
            key={result.id}
            value={result}
            className={({ focus }) =>
              cn(
                "group flex cursor-default select-none flex-row items-center px-4 py-2",
                { "is-active bg-brand-100 text-brand-800": focus },
              )
            }
          >
            {renderResult(result)}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    );
  };

  const renderPreviousHits = () => {
    if (recentlyVisited.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="bg-gray-50 py-4 text-center text-sm font-medium text-gray-700">
          Recently Visited
        </div>
        <ComboboxOptions
          static
          className="max-h-96 scroll-py-2 overflow-y-auto pb-2 text-sm text-gray-800"
        >
          {recentlyVisited.map(decodeSearchResult).map((result) => {
            if (result) {
              return (
                <ComboboxOption
                  key={result.id}
                  value={result}
                  className={({ focus }) =>
                    cn(
                      "group flex cursor-default select-none flex-row items-center px-4 py-2",
                      { "is-active bg-brand-100 text-brand-800": focus },
                    )
                  }
                >
                  {renderResult(result)}
                </ComboboxOption>
              );
            } else {
              return null;
            }
          })}
        </ComboboxOptions>
      </div>
    );
  };

  return (
    <Transition.Root
      show={props.visible}
      as={Fragment}
      afterLeave={() => setQuery("")}
      appear
    >
      <Dialog as="div" className="relative z-30" onClose={props.onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox
                value={debouncedQuery}
                onChange={(result: any) => onResultSelect(result)}
              >
                <div className="relative">
                  {loading ? (
                    <LoadingIcon className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-brand-500" />
                  ) : (
                    <SearchIcon
                      className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                  <ComboboxInput
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search tickets and projects..."
                    onChange={(event) => debouncedSetQuery(event.target.value)}
                  />
                </div>
                {trim(query)
                  ? renderSearchResult(results)
                  : renderPreviousHits()}
              </Combobox>
              <div className="flex flex-row justify-between bg-gray-100 px-3 py-2">
                <div className="flex flex-row items-center text-sm text-gray-500">
                  <ArrowUpIcon className="mx-1 h-5 w-5 rounded border border-b-2 border-gray-300 bg-white p-0.5 text-gray-400" />
                  <span>and</span>
                  <ArrowDownIcon className="mx-1 h-5 w-5 rounded border border-b-2 border-gray-300 bg-white p-0.5 text-gray-400" />
                  <span>to select</span>
                </div>
                <div className="flex flex-row items-center text-sm text-gray-500">
                  <span className="mx-0.5 h-5 rounded border border-b-2 border-gray-300 bg-white px-1 py-0.5 text-xs font-semibold text-gray-400">
                    {navigator.userAgent.match(/MacIntosh/gi) ? "Cmd" : "Ctrl"}
                  </span>
                  <span className="mx-0.5 h-5 rounded border border-b-2 border-gray-300 bg-white px-1 py-0.5 text-xs font-semibold text-gray-400">
                    K
                  </span>
                  <span className="ml-1">Quick Search</span>
                </div>
                <CheckboxGroup
                  id="includeClosed"
                  label="Include closed tickets"
                  checked={includeClosed}
                  onChange={(event) =>
                    setIncludeClosed(event.currentTarget.checked)
                  }
                />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const SEARCH_QUERY = gql`
  query search($query: String!, $includeClosed: Boolean) {
    search(query: $query, includeClosed: $includeClosed) {
      id
      name
    }
  }
`;
