import { FormEvent, useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { Input } from "components/fields/Input";
import { useHistory } from "react-router-dom";
import { ModelStage, Project, QueryProjectsArgs } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { UpProjectButton } from "./UpProjectButton";
import { ExplorerHead } from "./ExplorerHeader";
import { ExplorerTicketRow } from "./ExplorerTicketRow";
import { ExplorerProjectRow } from "./ExplorerProjectRow";
import { getTicketStage } from "./helper";
import { pull } from "lodash";
import { ExplorerMoreRow } from "./ExplorerMoreRow";
import { ExplorerRowProjectUp } from "./ExplorerRowProjectUp";
import { SearchIcon } from "@heroicons/react/outline";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { useGetTicketForProject } from "./hooks/useTicketQueryVariables";
import { ProjectMenuButton } from "./ProjectMenuButton";
import { ExplorerProjectMenuBar } from "./ExploreProjectMenuBar";
import { plural } from "utils/string";
import { useSelector } from "react-redux";
import { getExplorerFilter, getSelectedItems } from "reducers/selector";
import { useAppDispatch } from "store";
import { setSearchFilter } from "actions/filter/setSearchFilter";
import { AdjustmentsIcon } from "@heroicons/react/solid";
import {
  addToSelection,
  removeFromSelection,
  setSelection,
  showTicketEditModal,
  updateExplorerFilter,
} from "actions";
import { FCWithFragments } from "types";
import { convertToMiniProject } from "components/fields/convertToMini";
import { ExplorerRowToProjectEdit } from "./ExplorerRowToProjectEdit";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  project: Project;
  onDrop: (source: string, projectId: number) => void;
}

export const ExplorerMain: FCWithFragments<Props> = (props) => {
  const dispatch = useAppDispatch();
  const selection = useSelector(getSelectedItems("project"));
  const [lastDeselect, setLastDeselect] = useState<null | string>(null);
  const [lastSelect, setLastSelect] = useState<null | string>(null);
  const [isNewPage, setNewPage] = useState(true);
  const history = useHistory();
  const filter = useSelector(getExplorerFilter);
  const { project } = props;

  const projectIsArchived =
    project.stage === ModelStage.Archived || project.ancestorIsArchived;

  const searchElt = useSlashForSearch();

  const {
    data: ticketData,
    fetchMore: fetchMoreTicket,
    loading: loadingTicket,
  } = useGetTicketForProject(project.id, () => setNewPage(false));

  const { data: projectsData, loading } = useQuery<
    QueryReturnValue["projects"],
    QueryProjectsArgs
  >(GET_PROJECTS_QUERY_FOR_EXPLORER, {
    variables: {
      first: 200,
      parentId: project.id,
    },
    fetchPolicy: "cache-and-network",
  });

  // This is a trick for new page to appear blank during the loading
  // of content but to remain visible (not blinking) during re-fetch
  // or load more operations
  useEffect(() => setNewPage(true), [props.project.id]);

  const isLoading = isNewPage && (loading || loadingTicket);

  const tickets = ticketData?.moreTicketsForProject?.nodes || [];

  const onSelect = (id: string, shiftKey: boolean) => {
    if (!shiftKey) {
      dispatch(addToSelection({ domain: "project", itemIds: [id] }));
    } else {
      onShiftSelect(id);
    }
    setLastDeselect(null);
    setLastSelect(id);
  };

  // handle select and deselect automatically
  const onShiftSelect = (id: string) => {
    const newSelection = [...selection];
    const tbody = document.querySelector("tbody#explorer-tbody");
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

      dispatch(setSelection({ domain: "project", itemIds: newSelection }));
    } else {
      if (selection.indexOf(id) > -1) {
        dispatch(removeFromSelection({ domain: "project", itemIds: [id] }));
      } else {
        dispatch(addToSelection({ domain: "project", itemIds: [id] }));
      }
    }
  };

  const onDeselect = (id: string, shiftKey: boolean) => {
    if (!shiftKey) {
      dispatch(removeFromSelection({ domain: "project", itemIds: [id] }));
    } else {
      onShiftSelect(id);
    }
    setLastDeselect(id);
    setLastSelect(null);
  };

  const hasMore =
    ticketData?.moreTicketsForProject?.pageInfo.hasNextPage ||
    projectsData?.projects.pageInfo.hasNextPage;

  const onQuerySearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("query") as string;

    if (query) {
      dispatch(setSearchFilter({ search: query }));
      history.push(
        urlResolver.search.search(project.organizationId, project.id)
      );
    }
  };

  const projects = projectsData ? projectsData.projects.nodes : [];

  return (
    <div className="relative min-h-[calc(100vh-148px)] flex-1 border bg-white">
      <div className="flex min-w-0 flex-row bg-gray-50 p-2 sm:space-x-2">
        <UpProjectButton className="hidden sm:flex" project={project} />
        <div className="hidden flex-1 md:block">
          <ProjectSelect
            value={convertToMiniProject(project)}
            onChange={(project) =>
              project &&
              history.push(
                urlResolver.explorer.listing(
                  props.project.organizationId,
                  project.id
                )
              )
            }
            inputClassName="z-20"
          />
        </div>
        <form
          className="min-w-[35%] flex-1 md:flex-none"
          onSubmit={onQuerySearchSubmit}
        >
          <div className="relative" onClick={() => searchElt.current?.focus()}>
            <Input
              type="text"
              aria-label="Search tickets in projects"
              placeholder="search tickets"
              ref={searchElt}
              inputClassName="pl-8"
              name="query"
            />
            <SearchIcon className="absolute top-2 left-2 bottom-0 z-10 h-5 w-5 items-center text-gray-400" />
            <button
              className="absolute top-1.5 right-2 z-10 items-center rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              type="button"
              onClick={() =>
                history.push(
                  urlResolver.search.search(project.organizationId, project.id)
                )
              }
              sr-only="search"
            >
              <AdjustmentsIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
        <div className="lg:hidden">
          <ProjectMenuButton project={project} />
        </div>
      </div>
      <div className="relative z-20 bg-gray-50 px-2 pb-2 md:hidden">
        <ProjectSelect
          value={convertToMiniProject(project)}
          onChange={(project) =>
            project &&
            history.push(
              urlResolver.explorer.listing(
                props.project.organizationId,
                project.id
              )
            )
          }
        />
      </div>

      <div className="hidden lg:block">
        <ExplorerProjectMenuBar project={project} />
      </div>

      <div className="relative w-full flex-1">
        <table className="w-full flex-1">
          <thead className="sticky top-0 z-10 overflow-hidden bg-white">
            <ExplorerHead />
          </thead>
          <tbody
            id="explorer-tbody"
            className="divide-y divide-gray-200 bg-white"
          >
            <ExplorerRowProjectUp onDrop={props.onDrop} project={project} />
            <ExplorerRowToProjectEdit project={project} />
            {!isLoading &&
              projects.map((project) => (
                <ExplorerProjectRow
                  key={`project:${project.id}`}
                  row={{
                    id: `project:${project.id}`,
                    title: project.name,
                    createdAt: new Date(project.createdAt),
                    status: "",
                    url: urlResolver.explorer.listing(
                      project.organizationId,
                      project.id
                    ),
                  }}
                  selection={selection}
                  onSelect={onSelect}
                  onDeselect={onDeselect}
                  onDrop={props.onDrop}
                />
              ))}
            {!isLoading &&
              tickets.map((ticket) => (
                <ExplorerTicketRow
                  key={`ticket:${ticket.id}`}
                  row={{
                    id: `ticket:${ticket.id}`,
                    title: ticket.title,
                    createdAt: new Date(ticket.createdAt),
                    status: getTicketStage(ticket),
                    url: urlResolver.ticket.view(
                      ticket.organizationId,
                      ticket.id
                    ),
                    eta: ticket.eta,
                    localId: ticket.localId,
                    productCode: ticket.product?.code,
                    workflowName: ticket.workflow?.name,
                  }}
                  selection={selection}
                  onSelect={onSelect}
                  onDeselect={onDeselect}
                  onInfoClick={() => dispatch(showTicketEditModal(ticket.id))}
                  onDrop={props.onDrop}
                />
              ))}

            {filter.flags.hideCompleted.value ? (
              <tr className="bg-white text-sm text-gray-400">
                <td colSpan={5} className="py-4 text-center">
                  {plural(
                    "{} ticket - ",
                    "{} tickets - ",
                    ticketData?.moreTicketsForProject.totalCount
                  )}
                  Closed tickets are not displayed.
                  <button
                    type="button"
                    className="ml-1 text-brand-500 underline hover:text-brand-700"
                    onClick={() =>
                      dispatch(
                        updateExplorerFilter({
                          flags: {
                            hideCompleted: {
                              ...filter.flags.hideCompleted,
                              value: false,
                            },
                          },
                        })
                      )
                    }
                  >
                    Display all tickets.
                  </button>
                </td>
              </tr>
            ) : (
              <tr className="bg-white text-sm text-gray-400">
                <td colSpan={5} className="py-4 text-center">
                  {plural(
                    "{} ticket",
                    "{} tickets",
                    ticketData?.moreTicketsForProject.totalCount
                  )}
                  {!projectIsArchived &&
                    " - Archived tickets are not displayed."}
                </td>
              </tr>
            )}

            {!isLoading && hasMore && (
              <ExplorerMoreRow
                onClick={() => {
                  fetchMoreTicket({
                    variables: {
                      cursor:
                        ticketData?.moreTicketsForProject.pageInfo.endCursor,
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

ExplorerMain.fragments = {
  ExplorerMainFragment: gql`
    fragment ExplorerMainFragment on Project {
      id
      organizationId
      stage
      ancestorIsArchived
      createdAt
      updatedAt
      createdAt
      author {
        id
        name
        avatarUrl
      }
      owner {
        id
        title
        name
        avatarUrl
      }
      ...ProjectMenuButtonFragment
      ...ExplorerProjectMenuBarFragment
      ...ExplorerRowToProjectEditFragment
    }
    ${ExplorerProjectMenuBar.fragments.ExplorerProjectMenuBarFragment}
    ${ProjectMenuButton.fragments.ProjectMenuButtonFragment}
    ${ExplorerRowToProjectEdit.fragments.ExplorerRowToProjectEditFragment}
  `,
};

export const GET_PROJECTS_QUERY_FOR_EXPLORER = gql`
  query GetProjectsForExplorer($first: Int, $search: String, $parentId: Int) {
    projects(first: $first, search: $search, parentId: $parentId) {
      nodes {
        id
        name
        organizationId
        createdAt
      }
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
    }
  }
`;

export const GET_PROJECT_QUERY_FOR_EXPLORER = gql`
  query GetProjectForExplorer($id: Int!) {
    project(id: $id) {
      id
      ...ExplorerMainFragment
    }
  }
  ${ExplorerMain.fragments.ExplorerMainFragment}
`;
