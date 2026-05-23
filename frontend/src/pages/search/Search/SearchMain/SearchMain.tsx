import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { Input } from "components/fields/Input";
import { useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { SearchHead } from "./SearchHeader";
import { SearchRowElement } from "./SearchRow";
import { getTicketStage } from "./helper";
import { pull } from "lodash";
import { SearchMoreRow } from "./SearchMoreRow";
import { SearchFilterTags } from "./SearchFilterTags";
import { SearchIcon } from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { useGetTicketForProject } from "./hooks/useTicketQueryVariables";
import { useAppDispatch } from "store";
import { useSelector } from "react-redux";
import { getSearchFilter, getSelectedItems } from "reducers/selector";
import { SearchHeaderRow } from "./SearchHeaderRow";
import {
  setSearchFilter,
  updateSearchFilter,
} from "actions/filter/setSearchFilter";
import { Project } from "types/graphql";
import {
  addToSelection,
  removeFromSelection,
  setSelection,
  showTicketEditModal,
} from "actions";

interface Props {
  project?: Project | null;
}

interface Params {
  orgId: string;
}

export const SearchMain: React.FC<Props> = (props) => {
  const params = useParams<Params>();
  const { orgId } = params;
  const filter = useSelector(getSearchFilter);
  const selection = useSelector(getSelectedItems("search"));
  const dispatch = useAppDispatch();
  const [lastDeselect, setLastDeselect] = useState<null | string>(null);
  const [lastSelect, setLastSelect] = useState<null | string>(null);
  const [isNewPage, setNewPage] = useState(true);

  const [query, setQuery] = useState(filter.search || "");

  const [tagId, tagLabel] = useMemo(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return [urlSearchParams.get("tag_id"), urlSearchParams.get("tag_label")];
  }, []);

  const history = useHistory();
  useEffect(() => {
    if (tagId && tagLabel) {
      dispatch(
        setSearchFilter({
          recordSets: { tags: [{ id: parseInt(tagId), label: tagLabel }] },
        })
      );
      // history.replace(urlResolver.search.listing(orgId));
    }
  }, [dispatch, history, orgId, tagId, tagLabel]);

  const searchElt = useSlashForSearch();

  const {
    data,
    fetchMore: fetchMoreTicket,
    loading,
  } = useGetTicketForProject(props.project?.id, () => setNewPage(false));

  // This is a trick for new page to appear blank during the loading
  // of content but to remain visible (not blinking) during re-fetch
  // or load more operations
  useEffect(() => setNewPage(true), [props.project?.id]);

  const isLoading = isNewPage && loading;

  const tickets = data?.moreTickets?.nodes || [];

  const onSelect = (id: string, shiftKey: boolean) => {
    if (!shiftKey) {
      dispatch(addToSelection({ domain: "search", itemIds: [id] }));
    } else {
      onShiftSelect(id);
    }
    setLastDeselect(null);
    setLastSelect(id);
  };

  // handle select and deselect automatically
  const onShiftSelect = (id: string) => {
    const newSelection = [...selection];
    const tbody = document.querySelector("tbody#search-tbody");
    let mode: "select" | "deselect" = "select";
    let lastId: string = "";
    let lastIdFoundOnPage = false;

    if (
      tbody &&
      lastDeselect &&
      tbody.querySelector(`tr[data-id="${lastDeselect}"]`)
    ) {
      mode = "deselect";
      lastId = lastDeselect;
      lastIdFoundOnPage = !!tbody.querySelector(`tr[data-id="${lastId}"]`);
    } else if (
      tbody &&
      lastSelect &&
      tbody.querySelector(`tr[data-id="${lastSelect}"]`)
    ) {
      mode = "select";
      lastId = lastSelect;
      lastIdFoundOnPage = !!tbody.querySelector(`tr[data-id="${lastId}"]`);
    }

    if (tbody && lastIdFoundOnPage) {
      let selecting = false;
      const rows = tbody.querySelectorAll("tr");

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const dataId = row.getAttribute("data-id");

        if (!dataId) {
          continue;
        }

        if (dataId === id || dataId === lastId) {
          selecting = !selecting;
          mode === "select"
            ? newSelection.push(dataId)
            : pull(newSelection, dataId);
        } else if (selecting) {
          mode === "select"
            ? newSelection.push(dataId)
            : pull(newSelection, dataId);
        }
      }

      dispatch(setSelection({ domain: "search", itemIds: newSelection }));
    } else {
      if (selection.indexOf(id) > -1) {
        dispatch(removeFromSelection({ domain: "search", itemIds: [id] }));
      } else {
        dispatch(addToSelection({ domain: "search", itemIds: [id] }));
      }
    }
  };

  const onDeselect = (id: string, shiftKey: boolean) => {
    if (!shiftKey) {
      dispatch(removeFromSelection({ domain: "search", itemIds: [id] }));
    } else {
      onShiftSelect(id);
    }
    setLastDeselect(id);
    setLastSelect(null);
  };

  const hasMore = data?.moreTickets?.pageInfo.hasNextPage;
  const onQuerySearchSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (query) {
      dispatch(setSearchFilter({ search: query }));
    }
  };

  const clearSearch = () => {
    dispatch(updateSearchFilter({ search: "" }));
    setQuery("");
  };

  return (
    <div className="relative min-h-[calc(100vh-112px)] flex-1 border bg-white">
      <div className="flex min-w-0 flex-row bg-gray-50 p-2 sm:space-x-2">
        <div className="hidden flex-1 md:block">
          <ProjectSelect
            projectId={props.project?.id}
            onChange={(project) => {
              history.push(
                urlResolver.search.search(params.orgId, project?.id)
              );
            }}
            inputClassName="z-20"
            showUnsetButton
          />
        </div>
        <form
          className="min-w-[45%] flex-1 sm:mr-0 md:flex-none lg:min-w-[55%]"
          onSubmit={onQuerySearchSubmit}
        >
          <div className="relative" onClick={() => searchElt.current?.focus()}>
            <Input
              type="text"
              aria-label="Search tickets in projects"
              placeholder="search tickets"
              ref={searchElt}
              inputClassName="pl-8"
              onChange={(event) => setQuery(event.currentTarget.value)}
              value={query}
              autoFocus
            />
            <SearchIcon className="absolute top-2 left-2 bottom-0 z-10 h-5 w-5 items-center text-gray-400" />
            {query ? (
              <button
                type="button"
                title="clear search"
                className="absolute top-1.5 right-1.5 z-10 items-center rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                onClick={clearSearch}
                sr-only="clear search"
              >
                <XIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <div className="relative z-20 bg-gray-50 px-2 pb-2 md:hidden">
        <ProjectSelect
          projectId={props.project?.id}
          onChange={(project) => {
            history.push(urlResolver.search.search(params.orgId, project?.id));
          }}
          showUnsetButton
        />
      </div>
      <div>
        <SearchFilterTags className="border-b bg-gray-50 pb-1.5" />
      </div>
      <div className="relative w-full flex-1">
        <table className="w-full flex-1">
          <thead className="sticky top-0 z-10 overflow-hidden bg-white">
            <SearchHead />
          </thead>
          <tbody
            id="search-tbody"
            className="divide-y divide-gray-200 bg-white"
          >
            <SearchHeaderRow
              project={props.project}
              total={data?.moreTickets.totalCount || 0}
            />

            {!isLoading &&
              tickets.map((ticket) => (
                <SearchRowElement
                  key={`ticket:${ticket.id}`}
                  row={{
                    id: `ticket:${ticket.id}`,
                    localId: ticket.localId,
                    productCode: ticket.product?.code,
                    workflow: ticket.workflow?.name,
                    title: ticket.title,
                    createdAt: new Date(ticket.createdAt),
                    status: getTicketStage(ticket),
                    category: "ticket",
                    url: urlResolver.ticket.view(params.orgId, ticket.id),
                    eta: ticket.eta,
                    project: ticket.project,
                  }}
                  selection={selection}
                  onSelect={onSelect}
                  onDeselect={onDeselect}
                  onInfoClick={() => dispatch(showTicketEditModal(ticket.id))}
                />
              ))}

            {!isLoading && hasMore && (
              <SearchMoreRow
                onClick={() => {
                  fetchMoreTicket({
                    variables: {
                      cursor: data?.moreTickets.pageInfo.endCursor,
                    },
                  });
                }}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
