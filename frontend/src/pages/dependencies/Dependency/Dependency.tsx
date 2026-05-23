import { gql, useQuery } from "@apollo/client";
import { filter, get, groupBy, keyBy, range, uniq, without } from "lodash";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TicketDependency,
  MutationAddTicketAncestorArgs,
  Ticket,
  MutationRemoveTicketAncestorArgs,
  TicketStatus,
  QueryDependenciesArgs,
  ProjectDependency,
  Project,
} from "types/graphql";
import cn from "classnames";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { FCWithFragments } from "types";
import { DeleteDependencyButton } from "./DeleteDependencyButton";
import { Coordinate } from "./types";
import { RelationLine } from "./RelationLine";
import {
  FolderIcon,
  FolderOpenIcon,
  InformationCircleIcon,
  RefreshIcon,
} from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { createNotification, showTicketEditModal } from "actions";
import { useAppDispatch } from "store";
import { ToggleButton } from "components/fields/ToggleButton";
import { usePageTitle } from "hooks/usePageTitle";
import { DependencySquare } from "./DependencySquare";
import { useHistory } from "react-router-dom";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { urlResolver } from "utils/navigation";
import { convertToMiniProject } from "components/fields/convertToMini";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { sortProjectsByAncestry } from "pages/project/ProjectAnalytics/ProjectAnalyticPeriod/sortProjectGoals";
import { QueryReturnValue } from "types/queryTypes";
import { TicketIdTag } from "components/tags/TicketIdTag";

interface Props {
  project: Project;
  orgId: string;
  hideProjectSelect?: boolean;
  root?: string;
  hideToolBar?: boolean;
}

export const Dependency: FCWithFragments<Props> = (props) => {
  usePageTitle("Dependencies");

  const history = useHistory();
  const dispatch = useAppDispatch();

  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [draggedItemPosition, setDraggedItemPosition] =
    useState<Coordinate | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [lineType, setLineType] = useState<"square" | "curve">("square");

  let activeDestination: number | null = null;
  const setActiveDestination = (_activeDestination: number | null) =>
    (activeDestination = _activeDestination);

  const svgRef = useRef<SVGSVGElement>(null);
  const yScrollRef = useRef<HTMLDivElement>(null);
  const xScrollRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = useQuery<
    QueryReturnValue["dependencies"],
    QueryDependenciesArgs
  >(GET_DEPENDENCY_QUERY, {
    variables: { projectId: props.project.id },
    fetchPolicy: "cache-and-network",
    onError: onGraphQLError({ title: "Could not load dependencies" }),
    onCompleted: ({ dependencies }) => {
      setOpenProjects(dependencies.projects.map((p) => p.id));
    },
  });

  const [addTicketAncestor] = useBlockingMutation<
    { addTicketAncestor: Ticket },
    MutationAddTicketAncestorArgs
  >(ADD_TICKET_ANCESTOR_MUTATION, {
    onError: onGraphQLError({ title: "Could not add ticket" }),
  });

  const [removeTicketAncestor] = useBlockingMutation<
    { removeTicketAncestor: Ticket },
    MutationRemoveTicketAncestorArgs
  >(REMOVE_TICKET_ANCESTOR_MUTATION, {
    onError: onGraphQLError({ title: "Could not remove ticket" }),
  });

  const deleteRelation = async (ticketId: number, ancestorId: number) => {
    await removeTicketAncestor({
      variables: {
        ticketId,
        ancestorId: ancestorId,
      },
      update: (cache) => {
        cache.updateFragment(
          {
            id: `TicketDependency:${ancestorId}`,
            fragment: Dependency.fragments.DependencyTicketFragment,
            fragmentName: "DependencyTicketFragment",
          },
          (data) => ({
            ...data,
            successors: without(data.successors, ticketId),
          })
        );

        cache.updateFragment(
          {
            id: `TicketDependency:${ticketId}`,
            fragment: Dependency.fragments.DependencyTicketFragment,
            fragmentName: "DependencyTicketFragment",
          },
          (data) => ({
            ...data,
            ancestors: without(data.ancestors, ancestorId),
          })
        );
      },
    });
  };

  const onDrop = () => {
    if (draggedItem && activeDestination) {
      const [position, id] = draggedItem.split(":");

      // if the destination and the sources are the same
      if (id === activeDestination.toString()) {
        return;
      }

      let ticketId = parseInt(id);
      let ancestorId = activeDestination;

      if (position === "successor") {
        ancestorId = parseInt(id);
        ticketId = activeDestination;
      }

      addTicketAncestor({
        variables: {
          ticketId,
          ancestorId,
        },
        update: (cache) => {
          cache.updateFragment(
            {
              id: "TicketDependency:" + ancestorId,
              fragment: Dependency.fragments.DependencyTicketFragment,
              fragmentName: "DependencyTicketFragment",
            },
            (data) => ({
              ...data,
              successors: uniq([...data.successors, ticketId]),
            })
          );

          cache.updateFragment(
            {
              id: "TicketDependency:" + ticketId,
              fragment: Dependency.fragments.DependencyTicketFragment,
              fragmentName: "DependencyTicketFragment",
            },
            (data) => ({
              ...data,
              ancestors: uniq([...data.ancestors, ancestorId]),
            })
          );
        },
      });
    }
  };

  const tickets = useMemo(
    () => (data ? data.dependencies.tickets : []),
    [data]
  );
  const projects = useMemo(
    () => sortProjectsByAncestry(data?.dependencies.projects),
    [data]
  );

  const ticketsById = useMemo(() => keyBy(tickets, "id"), [tickets]);
  const projectsById = useMemo(() => keyBy(projects, "id"), [projects]);

  const ticketsByProject = useMemo(() => {
    return groupBy(tickets, "projectId");
  }, [tickets]);

  // when mouse drop stops, clear the dragged item
  useEffect(() => {
    const onDragEnd = () => {
      setTimeout(() => setDraggedItem(null));
    };
    window.addEventListener("dragend", onDragEnd);
    return () => {
      window.removeEventListener("dragend", onDragEnd);
    };
  }, [setDraggedItem]);

  const [openProjects, setOpenProjects] = useState<number[]>([
    props.project.id,
  ]);

  let elementCursor = 0;
  const elementPosition: { [id: string]: number } = useMemo(() => ({}), []);
  const registerElement = (id: string | number) =>
    (elementPosition[id] = elementCursor++);

  const getDependencyCount = useCallback(
    (ticket: TicketDependency, count: number = 0): number => {
      const ancestors = ticket.ancestors.reduce(
        (acc: TicketDependency[], ticketId) => {
          if (ticketId in ticketsById) {
            return [...acc, ticketsById[ticketId]];
          } else {
            return acc;
          }
        },
        []
      );

      if (ancestors.length) {
        return Math.max(
          ...ancestors.map((ticket) => getDependencyCount(ticket, count + 1))
        );
      } else {
        return count;
      }
    },
    [ticketsById]
  );

  const displayProjectRelation = (project: ProjectDependency) => {
    const tickets = get(ticketsByProject, project.id, []);
    return tickets.map(displayTicketRelation);
  };

  const isTicketVisible = (ticket?: TicketDependency) => {
    if (!ticket) {
      return false;
    } else if (ticket.projectId) {
      const project = projectsById[ticket.projectId];
      return isProjectOpen(project);
    } else {
      return true;
    }
  };

  const displayTicketRelation = (ticket: TicketDependency) => {
    if (!isTicketVisible(ticket)) {
      return null;
    }

    const ancestors = ticket.ancestors.map((ticketId) => ticketsById[ticketId]);
    const visibleAncestors = filter(ancestors, isTicketVisible);

    const startY = elementPosition[ticket.id] * 32 + 16;
    const startX = getDependencyCount(ticket) * 32 + 20;

    const nodes: React.ReactNode[] = [];
    const isSuccessor = ticket.id === activeItem;

    for (const ancestor of visibleAncestors) {
      const isAncestor = ancestor.id === activeItem;

      const endX = getDependencyCount(ancestor) * 32 + 24 + 20;
      const endY = elementPosition[ancestor.id] * 32 + 16;

      const className = cn("stroke-current", {
        "z-0": isAncestor || isSuccessor,
        "text-purple-400": isAncestor,
        "text-pink-400": isSuccessor,
        "text-gray-600": !isAncestor && !isSuccessor,
        "opacity-10": activeItem && !isAncestor && !isSuccessor,
        "opacity-50": !activeItem,
      });

      const halfWay = startX + (endX - startX) / 2;
      const dist = Math.abs(startX - endX);

      let points = [
        "M" + [startX, startY].join(","),
        "C" + [halfWay - dist / 4, startY].join(","),
        [halfWay + dist / 4, endY].join(","),
        [endX, endY].join(","),
      ];

      if (lineType === "square") {
        points = [
          "M" + [startX, startY].join(","),
          [halfWay, startY].join(","),
          [halfWay, endY].join(","),
          [endX, endY].join(","),
        ];
      }

      nodes.push(
        <path
          key={`line-${ticket.id}-${ancestor.id}`}
          fill="none"
          strokeWidth={isAncestor || isSuccessor ? 3 : 2}
          className={className}
          d={points.join(" ")}
          strokeLinejoin="round"
        />
      );
    }

    return nodes;
  };

  const displayTicketBlock = (ticket: TicketDependency) => {
    const dependencyCount = getDependencyCount(ticket);

    const isActiveItem = activeItem === ticket.id;
    const isAncestor = activeItem
      ? ticket.successors.indexOf(activeItem) > -1
      : false;
    const isSuccessor = activeItem
      ? ticket.ancestors.indexOf(activeItem) > -1
      : false;

    const isHighlighted = isActiveItem || isAncestor || isSuccessor;

    const isScheduled = ticket.status === TicketStatus.Scheduled;
    const isUnscheduled = ticket.status === TicketStatus.Unscheduled;
    const isCancelled = ticket.status === TicketStatus.Cancelled;
    const isDone = ticket.status === TicketStatus.Done;

    const ticketClassName = cn(
      "hover:z-20 transition-all relative duration-300 mt-1 h-6 w-6 rounded cursor-pointer",
      {
        "bg-pink-400 z-10": isAncestor,
        "bg-purple-400 z-10": isSuccessor,
        "z-10": !activeItem,
        "bg-gray-300": !isHighlighted && activeItem,
        "bg-orange-500":
          ((!isHighlighted && !activeItem) || isHighlighted) && isCancelled,
        "bg-green-500":
          ((!isHighlighted && !activeItem) || isHighlighted) && isDone,
        "bg-brand-500":
          ((!isHighlighted && !activeItem) || isHighlighted) && isScheduled,
        "bg-gray-600":
          ((!isHighlighted && !activeItem) || isHighlighted) && isUnscheduled,
      }
    );

    const containerClass = cn("group relative h-8 bg-white");

    registerElement(ticket.id);

    const renderDragHandle = () => (
      <>
        <div
          draggable
          onDragStart={() => setDraggedItem(`ancestor:${ticket.id}`)}
          className="absolute -left-5 top-0.5 z-10 h-5 w-5 cursor-pointer rounded-full border-2 border-brand-400 bg-white opacity-0 transition hover:bg-gray-200 group-hover:opacity-100"
        />
        <div
          draggable
          className="absolute -right-5 top-0.5 z-10 h-5 w-5 cursor-pointer rounded-full border-2 border-brand-400 bg-white opacity-0 transition hover:bg-gray-200 group-hover:opacity-100"
          onDragStart={() => setDraggedItem(`successor:${ticket.id}`)}
        />
        <DependencySquare ticket={ticket} />
      </>
    );

    const renderDeleteRelation = () => {
      if (isAncestor) {
        return (
          <div className="absolute left-6 top-0.5 flex items-center justify-center">
            <DeleteDependencyButton
              onClick={() =>
                activeItem && deleteRelation(activeItem, ticket.id)
              }
            />
          </div>
        );
      }
      if (isSuccessor) {
        return (
          <div className="absolute left-6 top-0.5 flex items-center justify-center">
            <DeleteDependencyButton
              onClick={() =>
                activeItem && deleteRelation(ticket.id, activeItem)
              }
            />
          </div>
        );
      }

      return null;
    };

    return (
      <div
        key={ticket.id}
        className={containerClass}
        onDragOver={(event) => {
          if (draggedItem) {
            // do not trigger hover when source === destination
            const draggedId = draggedItem.split(":")[1];
            if (
              activeDestination !== ticket.id &&
              draggedId !== ticket.id.toString()
            ) {
              setActiveDestination(ticket.id);
              event.currentTarget.classList.replace("bg-white", "bg-brand-100");
            }
          }
        }}
        onDragLeave={(event) => {
          if (activeDestination === ticket.id) {
            setActiveDestination(null);
          }
          event.currentTarget.classList.replace("bg-brand-100", "bg-white");
        }}
        onDrop={(event) => {
          event.currentTarget.classList.replace("bg-brand-100", "bg-white");
        }}
      >
        <div
          className={ticketClassName}
          style={{ marginLeft: 20 + dependencyCount * 32 }}
          onClick={(event) => {
            setActiveItem(ticket.id);
            event?.stopPropagation();
          }}
        >
          {isAncestor || isSuccessor ? renderDeleteRelation() : null}
          {renderDragHandle()}
        </div>
      </div>
    );
  };

  const displayTicketTitle = (ticket: TicketDependency, depth: number) => {
    const isActiveItem = activeItem === ticket.id;
    const isAncestor = activeItem
      ? ticket.successors.indexOf(activeItem) > -1
      : false;

    const isSuccessor = activeItem
      ? ticket.ancestors.indexOf(activeItem) > -1
      : false;

    const className = cn(
      "flex h-8 relative min-w-0 items-center px-2 text-sm cursor-pointer space-x-1 flex-row",
      {
        "bg-brand-50 text-brand-700 font-semibold": isActiveItem,
        "bg-pink-50 text-pink-700 font-semibold": isAncestor,
        "bg-purple-50 text-purple-700 font-semibold": isSuccessor,
        "text-gray-500 bg-white font-medium":
          !isActiveItem && !isAncestor && !isSuccessor,
      }
    );

    return (
      <div
        key={ticket.id}
        className={className}
        style={{ paddingLeft: 2 + 10 * depth }}
        onClick={(event) => {
          dispatch(showTicketEditModal(ticket.id));
          event?.stopPropagation();
        }}
      >
        <div
          className="absolute inset-y-0 left-0 bg-gray-200"
          style={{ width: 10 * depth }}
        ></div>
        <TicketIdTag
          localId={ticket.localId}
          productCode={`${ticket.productCode}`}
          className="shrink-0 text-xs"
          status={ticket.status}
          milestone={ticket.milestone}
        />

        <div title={ticket.title} className="truncate hover:underline">
          {ticket.title}
        </div>
      </div>
    );
  };

  const getParentProject = (
    project: ProjectDependency
  ): ProjectDependency | undefined => {
    if (project.parentId) {
      return projectsById[project.parentId];
    }
  };

  const isProjectOpen = (project?: ProjectDependency): boolean => {
    if (!project) {
      return false;
    }

    if (project.id === props.project.id) {
      return true;
    }

    if (openProjects.indexOf(project.id) === -1) {
      return false;
    }

    if (project.parentId) {
      return isProjectOpen(projectsById[project.parentId]);
    } else {
      return true;
    }
  };

  const displayProjectBlock = (project: ProjectDependency) => {
    const tickets = get(ticketsByProject, project.id, []) as TicketDependency[];

    if (isProjectOpen(project)) {
      registerElement(`project:${project.id}`);
      return (
        <Fragment key={project.id}>
          <div className="sticky top-0 h-8 bg-gray-50 "></div>
          {tickets.map((ticket) => displayTicketBlock(ticket))}
        </Fragment>
      );
    } else if (isProjectOpen(getParentProject(project))) {
      registerElement(`project:${project.id}`);
      return (
        <div key={project.id} className="sticky top-0 h-8 bg-gray-50"></div>
      );
    }

    return null;
  };

  const toggleProject = (projectId: number) => {
    if (openProjects.indexOf(projectId) > -1) {
      setOpenProjects(without(openProjects, projectId));
    } else {
      setOpenProjects([...openProjects, projectId]);
    }
  };

  const getProjectDepth = (parentId?: number | null, depth = 0): number => {
    if (parentId) {
      const parent = projectsById[parentId];
      if (parent) {
        return getProjectDepth(parent.parentId, depth + 1);
      }
    }
    return depth;
  };

  const displayProjectName = (project: ProjectDependency) => {
    const tickets = get(ticketsByProject, project.id, []) as TicketDependency[];
    const projectIsOpen = isProjectOpen(project);
    const isParentProjectOpen = isProjectOpen(getParentProject(project));

    const depth = getProjectDepth(project.parentId);
    const chevronClass = cn("h-5 w-5 transition", {
      "text-gray-300 -rotate-90 transform": !projectIsOpen,
      "text-gray-500": projectIsOpen,
    });
    const projectClass = cn("truncate", {
      "text-gray-500": !projectIsOpen,
      "text-gray-700": projectIsOpen,
    });

    const depthDots = range(depth).map((index) => (
      <div className="h-1 w-1 rounded-full bg-gray-300" key={index} />
    ));

    if (isParentProjectOpen || projectIsOpen) {
      return (
        <Fragment key={project.id}>
          <div
            role="button"
            className="sticky top-0 z-10 flex h-8 cursor-pointer items-center space-x-1 bg-gray-50 pl-2 text-sm font-semibold text-gray-700"
            onClick={() => toggleProject(project.id)}
          >
            {depthDots}
            {project ? <ChevronDownIcon className={chevronClass} /> : null}
            <div title={project.name} className={projectClass}>
              {project.name}
            </div>
          </div>

          {projectIsOpen
            ? tickets.map((ticket) => displayTicketTitle(ticket, depth))
            : null}
        </Fragment>
      );
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (!draggedItem) {
      setDraggedItemPosition(null);
    } else {
      const [position, id] = draggedItem.split(":");
      const draggedItemPosition = {
        y: elementPosition[id] * 32 + 16,
        x: 0,
      };

      if (position === "ancestor") {
        draggedItemPosition.x = getDependencyCount(ticketsById[id]) * 32;
      } else {
        draggedItemPosition.x =
          getDependencyCount(ticketsById[id]) * 32 + 24 + 10;
      }

      setDraggedItemPosition(draggedItemPosition);
    }
  }, [
    draggedItem,
    setDraggedItemPosition,
    getDependencyCount,
    ticketsById,
    elementPosition,
  ]);

  return (
    <div>
      {props.hideToolBar ? null : (
        <div className="z-20 mx-4 mb-4 flex flex-col justify-end space-y-4 sm:mx-0 sm:flex-row sm:space-y-0">
          {props.hideProjectSelect ? null : (
            <ProjectSelect
              value={convertToMiniProject(props.project)}
              onChange={(project) =>
                project &&
                history.push(
                  urlResolver.explorer.dependencies(props.orgId, project.id)
                )
              }
              className="z-20 -mr-px flex-1"
              inputClassName="rounded-r-none"
            />
          )}
          <Button
            type="button"
            btnType="white"
            fullInMobile
            onClick={() => setOpenProjects(projects.map((prjt) => prjt.id))}
            btnGroup={props.hideProjectSelect ? "start" : "middle"}
          >
            <FolderOpenIcon className="mr-1 h-5 w-5 text-yellow-300" />
            <span className="hidden lg:inline">Open All</span>
            <span className="lg:hidden">Open</span>
          </Button>
          <Button
            type="button"
            btnType="white"
            fullInMobile
            onClick={() => setOpenProjects([])}
            btnGroup="middle"
          >
            <FolderIcon className="mr-1 h-5 w-5 text-yellow-300" />
            <span className="hidden lg:inline">Close All</span>
            <span className="lg:hidden">Close</span>
          </Button>
          <div className="-mx-px flex flex-row items-center border-b border-l border-r border-t border-gray-300 bg-white px-3">
            <ToggleButton
              checked={lineType === "square"}
              onChange={() =>
                setLineType(lineType === "curve" ? "square" : "curve")
              }
              label="Straight"
              leftLabel="Curved"
              checkedColor="bg-gray-200"
              uncheckedColor="bg-gray-200"
              small
            />
          </div>
          <Button
            type="button"
            btnType="white"
            btnGroup="end"
            onClick={() =>
              refetch().then(() =>
                dispatch(
                  createNotification({
                    type: "Success",
                    title: `Dependencies successfully refreshed`,
                  })
                )
              )
            }
          >
            <RefreshIcon className="mr-1 h-5 w-5 text-gray-500" />
            <span className="hidden lg:inline">Refresh</span>
          </Button>
        </div>
      )}

      <div
        className="border sm:max-h-[calc(100vh-290px)] sm:overflow-y-auto sm:rounded-lg"
        ref={yScrollRef}
        onDrop={onDrop}
      >
        <div className="flex w-full min-w-0 flex-row">
          <div
            id="dependency-ticket-container"
            className="relative min-w-0 max-w-xl shrink-0 divide-y divide-gray-200 border-r bg-gray-50 sm:w-64 md:w-[calc(100vw-600px)] lg:w-[calc(100vw-700px)]"
          >
            {projects.map(displayProjectName)}
          </div>
          <div
            onClick={() => setActiveItem(null)}
            className="flex-1 overflow-x-auto overscroll-x-contain bg-white"
            ref={xScrollRef}
          >
            <div className="relative min-w-fit divide-y divide-gray-100">
              {projects.map(displayProjectBlock)}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute inset-0 h-full min-w-full"
                ref={svgRef}
              >
                {projects.map(displayProjectRelation)}
                <RelationLine
                  yScrollElement={yScrollRef.current}
                  xScrollElement={xScrollRef.current}
                  start={draggedItemPosition}
                  lineType={lineType}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="my-4 flex flex-row items-center justify-center">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="h-5 w-5 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-brand-700">
                Only Scheduled and Unscheduled tickets are displayed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Dependency.fragments = {
  DependencyTicketFragment: gql`
    fragment DependencyTicketFragment on TicketDependency {
      id
      localId
      productCode
      title
      status
      projectId
      successors
      ancestors
      milestone
    }
  `,
  DependencyProjectFragment: gql`
    fragment DependencyProjectFragment on ProjectDependency {
      id
      name
      parentId
      successors
      ancestors
    }
  `,
};

const GET_DEPENDENCY_QUERY = gql`
  query Dependencies($projectId: Int) {
    dependencies(projectId: $projectId) {
      tickets {
        id
        ...DependencyTicketFragment
      }
      projects {
        id
        ...DependencyProjectFragment
      }
    }
  }
  ${Dependency.fragments.DependencyTicketFragment}
  ${Dependency.fragments.DependencyProjectFragment}
`;

const ADD_TICKET_ANCESTOR_MUTATION = gql`
  mutation DepedencyAddTicketAncestor($ticketId: Int!, $ancestorId: Int!) {
    addTicketAncestor(ticketId: $ticketId, ancestorId: $ancestorId) {
      id
      ancestors {
        id
      }
    }
  }
`;

const REMOVE_TICKET_ANCESTOR_MUTATION = gql`
  mutation DepedencyRemoveTicketAncestor($ticketId: Int!, $ancestorId: Int!) {
    removeTicketAncestor(ticketId: $ticketId, ancestorId: $ancestorId) {
      id
      ancestors {
        id
      }
    }
  }
`;
