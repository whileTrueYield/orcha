import prisma from "../../prisma";
import { clamp, trim, without } from "lodash";
import { Project } from "@generated/type-graphql";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { PaginatedProjects } from "./entity";
import { Prisma, ModelStage, TicketStatus } from ".prisma/client";

/**
 * DEPRECATED
 **/
export const normalizeProjectPath = (path: string = ""): string => {
  const pathFragment = path.split("/");
  return pathFragment
    .map(trim) // remove spaces "foo/ bar  /baz" => "foo/bar/baz"
    .filter((part) => part) // remove empty parts like "/foo/ /bar/"
    .join("/");
};

export async function findProjectByName(
  name: string,
  parentId: number | null,
  organizationId: number
): Promise<Project | null> {
  return prisma.project.findFirst({
    where: {
      organizationId: organizationId,
      name: { equals: name, mode: "insensitive" },
      parentId,
    },
  });
}

/**
 * Return all the project's children, grand children... IDs
 *
 * @param projectId the parent project ID
 * @returns
 */
export async function getProjectDescendantIds(
  projectId: number
): Promise<number[]> {
  const results = await prisma.$queryRaw<{ id: string }[]>`
  WITH RECURSIVE c AS (
    SELECT ${projectId} AS id
    UNION ALL
    SELECT project.id
    FROM project
        JOIN c ON c.id = project."parentId"
  )
  SELECT id FROM c;`;

  // the query will inevitably include the projectId we provided, we remove it here
  return without(
    results.map((r) => parseInt(r.id)),
    projectId
  );
}
/**
 * Return all the parent IDs, in hierarchical order (parent, grand parent,
 * grand-grand parent...), for a given project ID
 *
 * @param parentId the parent project ID
 * @returns
 */
export async function getProjectParentIds(
  projectId: number
): Promise<number[]> {
  const results = await prisma.$queryRaw<{ parentId: string }[]>`
    WITH RECURSIVE c AS (
      SELECT ${projectId} AS "parentId"
      UNION ALL
      SELECT project."parentId"
      FROM project
          JOIN c ON c."parentId" = project.id
      WHERE project."parentId" is not NULL
    )
    SELECT "parentId" FROM c;`;

  // the query will inevitably include the provided parentId, we remove it here
  return without(
    results.map((r) => parseInt(r.parentId)),
    projectId
  );
}

/**
 * Safely move a project and append "copy + #" if a project with the same path
 * already exist
 */
export async function moveProject(
  project: Project,
  name: string,
  parentId?: number | null
): Promise<Project> {
  while (true) {
    // are we changing the parent
    if (project.name === name) {
      return project;
    }

    // find if another project with the same name already exist
    const hasHomonyms = await prisma.project.findFirst({
      where: {
        organizationId: project.organizationId,
        name: { equals: name, mode: "insensitive" },
        id: { not: project.id },
        parentId,
      },
    });

    // we'll add copy, copy 2, copy 3... to the name until we don't find any other
    // siblings with the same name
    if (hasHomonyms) {
      const results = /^(.*) copy( \d+)?$/.exec(name);
      if (results) {
        if (results[2]) {
          name = `${results[1]} copy ${parseInt(results[2]) + 1}`;
        } else {
          name = `${results[1]} copy 2`;
        }
      } else {
        name = `${name} copy`;
      }
    } else {
      return prisma.project.update({
        where: { id: project.id },
        data: { name },
      });
    }
  }
}

/**
 * Safely rename a project and append "copy + #" if a project with the same path
 * already exist
 */
export async function renameProject(
  project: Project,
  name: string
): Promise<Project> {
  return moveProject(project, name, project.parentId);
}

interface GetPaginatedProjectsArgs extends GetPageArgsFor<Project> {
  organizationId: number;
  parentId?: number;
}

// Return a paginated set of projects where the format
// is normalized to maintain familiarity and functionality
// when working with pages
export async function getPaginatedProjects(
  args: GetPaginatedProjectsArgs
): Promise<PaginatedProjects> {
  const { first, last, organizationId, search, parentId } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Project = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 1000);

  const AND: Prisma.ProjectWhereInput[] = [];
  const projectQuery: Prisma.ProjectWhereInput = {
    organizationId,
    AND,
  };

  // We allow search on projects by path
  const query = trim(search);
  if (query) {
    projectQuery.name = { contains: query, mode: "insensitive" };
  }

  // if we specify the projectId then we only want what's in that project
  if (parentId) {
    projectQuery.parentId = parentId;
  }

  const projects = await prisma.project.findMany({
    where: projectQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.project.count({ where: projectQuery });

  return paginateNodes({ nodes: projects, offset, pageSize, count });
}

export const getTicketQueryForProject = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  if (projectId) {
    return {
      organizationId: organizationId,
      projectId: {
        in: [projectId, ...(await getProjectDescendantIds(projectId))],
      },
    };
  } else {
    return {
      organizationId: organizationId,
    };
  }
};

export const getTicketQueryForPublishedAndArchived = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = { in: [ModelStage.PUBLISHED, ModelStage.ARCHIVED] };
  return ticketQuery;
};

export const getTicketQueryForScheduled = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = ModelStage.PUBLISHED;
  ticketQuery.status = TicketStatus.SCHEDULED;
  return ticketQuery;
};

export const getTicketQueryForDraft = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = ModelStage.DRAFT;
  return ticketQuery;
};

export const getTicketQueryForInProgress = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForScheduled(
    organizationId,
    projectId
  );

  ticketQuery.scheduleItems = {
    some: {
      stoppedAt: null,
    },
  };

  return ticketQuery;
};

export const getTicketQueryForDone = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = ModelStage.PUBLISHED;
  ticketQuery.status = { in: [TicketStatus.DONE, TicketStatus.CANCELLED] };

  // this was temporarily disabled as we want to display all tickets done
  // reactive it to only capture the tickets during the past period (usually 14 days)
  // ticketQuery.closedAt = { gt: subDays(new Date(), project.duration) };

  return ticketQuery;
};

export const getTicketQueryForUnestimated = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = ModelStage.PUBLISHED;
  ticketQuery.status = TicketStatus.UNSCHEDULED;
  ticketQuery.estimating = true;

  ticketQuery.ticketWorkflowStates = {
    some: {
      isActive: true,
      OR: [
        { estimateMaximum: null },
        { estimateMinimum: null },
        { estimateMostLikely: null },
      ],
    },
  };

  return ticketQuery;
};

export const getTicketQueryForUnassigned = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = ModelStage.PUBLISHED;
  ticketQuery.status = TicketStatus.UNSCHEDULED;
  ticketQuery.estimating = false;

  ticketQuery.ticketWorkflowStates = {
    some: {
      isActive: true,
      assignee: null,
    },
  };

  // ticketQuery.ticketWorkflowStates = {
  //   some: {
  //     isActive: true,
  //   },
  // };

  return ticketQuery;
};

export const getTicketQueryForEstimated = async (
  organizationId: number,
  projectId?: number
): Promise<Prisma.TicketWhereInput> => {
  const ticketQuery = await getTicketQueryForProject(organizationId, projectId);
  ticketQuery.stage = ModelStage.PUBLISHED;
  ticketQuery.status = TicketStatus.UNSCHEDULED;

  ticketQuery.ticketWorkflowStates = {
    none: {
      isActive: true,
      OR: [
        { estimateMaximum: null },
        { estimateMinimum: null },
        { estimateMostLikely: null },
      ],
    },
  };

  return ticketQuery;
};
