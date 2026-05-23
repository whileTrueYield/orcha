import {
  TicketStatus,
  EstimateType,
  ModelStage,
  RoleStatus,
  TicketWorkflowState,
  ScheduleStatus,
} from "@generated/type-graphql";
import { get, last, map, max, orderBy, uniq } from "lodash";
import fetch from "node-fetch";
import { RoleWorkDay, WorkWeekTime } from "../../role/entity";
import prisma from "../../../prisma";
import { Prisma, ScheduleItem, Ticket } from ".prisma/client";
import { getProjectDescendantIds } from "../../project/helper";
import { cronQueue } from "../../../cron/queues";
import { config } from "../../../config";
import { addYears } from "date-fns";
import {
  generateTimeOffsFromRecurringBlackoutTime,
  mergeTimeOffs,
} from "../../blackoutTime/entity";

interface ContextWorkWeek {
  monday?: [string, string][];
  tuesday?: [string, string][];
  wednesday?: [string, string][];
  thursday?: [string, string][];
  friday?: [string, string][];
  saturday?: [string, string][];
  sunday?: [string, string][];
}

interface ScheduleSnapshot {
  uid: string;
  employee_id: number;
  end: number;
  end_min: number;
  end_max: number;
  end_p50: number;
  end_p70: number;
  end_p80: number;
  end_p90: number;
  end_p95: number;
  start: number;
  start_min: number;
  start_max: number;
  start_p50: number;
  start_p70: number;
  start_p80: number;
  start_p90: number;
  start_p95: number;
}

interface StartedWorkflowState {
  uid: string;
  employee_id: number;
  start_time: number;
}

type ContextScheduleTimeOff = [number, number];

interface ContextSchedule {
  id: string;
  week: ContextWorkWeek;
  timezone: string;
  time_offs: Array<ContextScheduleTimeOff>;
}

interface ContextTask {
  uid: string;
  employee_id: number;
  min: number;
  max: number;
  likely: number;
  priority: number;
  fractionable: Boolean;
  ancestors: string[];
}

interface EstimateContext {
  epoch: number;
  schedules: ContextSchedule[];
  tasks: ContextTask[];
  started: StartedWorkflowState[];
}

type RecordTypeStrings = keyof typeof EstimateType;

const unbuildUid = (uid: string): [EstimateType, number] => {
  const [recordType, strId] = uid.split(":");
  const id = parseInt(strId);

  if (isNaN(id)) {
    throw Error("Bad Uid: could not parse ${id} into an int");
  }

  switch (recordType) {
    case "TicketWorkflowState":
      return [EstimateType.TicketWorkflowState, id];
    default:
      throw Error(
        "Bad recordType: ${recordType} should be one of ${uidRecordTypes}"
      );
  }
};

// this is a standardization of record ID being used by the AI. The AI
// associates every records together using a single ID, not a record type
// and an ID (like type: Role and ID: 12 would be "Role:12")
export const buildUid = (recordType: RecordTypeStrings, id: number): string =>
  `${recordType}:${id}`;

// requestEstimate runs the schedule AI and triggers a series of simulations
// we don't want this to run instantly, instead each time it is requested
// we trigger a job that will run 65 secs after.
// In short, when a series of action would require the schedule to re-run a
// simulation, we only want to run once but cover all the changes since the
// first request.
//
//  When this job finally runs it will re-estimates all the tickets with all
// the changes that happened during that past minute or so.
//
// onDemandEstimateTickets job has a control gate that prevents it from running
// if a previous estimate was executed after the current job was scheduled.
export async function requestEstimate(
  organizationId: number,
  quick: boolean = false
) {
  // wait 65 secs before considering computing this request
  const delay = quick ? 5 : 65;

  await cronQueue.add(
    "onDemandEstimateTickets",
    { organizationId },
    {
      delay: delay * 1000,
    }
  );
}

/**
 * Return true if the schedule contains annomalies preventing it from
 * running normaly
 * @param organizationId
 */
export async function getScheduleStatus(
  organizationId: number
): Promise<ScheduleStatus> {
  // if any schedule ticket has ticket workflow states active and assigned
  // a not active role
  const ticketWithAssignmentIssue = await prisma.ticket.findFirst({
    where: {
      organizationId: organizationId,
      status: TicketStatus.SCHEDULED,
      stage: ModelStage.PUBLISHED,
      ticketWorkflowStates: {
        some: {
          assignee: {
            status: { not: RoleStatus.ACCEPTED },
          },
        },
      },
    },
  });

  return ticketWithAssignmentIssue
    ? ScheduleStatus.ASSIGNEE_DEACTIVATED
    : ScheduleStatus.OK;
}

export async function estimateAllScheduledTickets(organizationId: number) {
  // first lets find out if there is any ticket that are
  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      scheduleStatus: await getScheduleStatus(organizationId),
    },
  });

  // We will retrieve the estimates now
  const scheduledTickets = await prisma.ticket.findMany({
    where: {
      organizationId: organizationId,
      status: TicketStatus.SCHEDULED,
      stage: ModelStage.PUBLISHED,
      // exclude ticket with non active assignnee
      ticketWorkflowStates: {
        none: {
          isActive: true,
          assignee: {
            status: { not: "ACCEPTED" },
          },
        },
      },
    },
    include: {
      scheduleItems: {
        // capture only the most recent schedule item
        orderBy: { stoppedAt: "desc" },
        take: 1,
        include: {
          ticketWorkflowState: true,
          nextTicketWorkflowState: true,
        },
      },
      ticketWorkflowStates: {
        where: { isActive: true },
        orderBy: { position: "asc" },
      },
      ancestors: {
        include: {
          ticketWorkflowStates: {
            where: { isActive: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  // use the schedule priority to augment ticket's priority
  const scheduleConfigs = await prisma.scheduleConfig.findMany({
    where: { organizationId },
    // go descending so higher priority will overide lower one
    // ie. priority 0 more important than priority 1
    orderBy: { priority: "desc" },
    include: {
      // we want to grab the highest priority value,
      // the lower this value, the higher the priority
      // ... I know it's counter intuitive, I'm sorry
      //
      //    HIGH         REGULAR       LOW
      // Priority -1 > Priority 0 > Priority 10
      tags: { select: { id: true } },
      products: { select: { id: true } },
      projects: { select: { id: true } },
      workflows: { select: { id: true } },
      features: { select: { id: true } },
      tickets: { select: { id: true } },
    },
  });

  const snapshots = await estimateTickets(
    organizationId,
    scheduledTickets,
    scheduleConfigs
  );

  const todayISO = new Date(new Date().toISOString());
  const todayEpoch = getDayEpoch(todayISO);
  const updateEpoch = Math.ceil(new Date().getTime() / 1000);

  // delete previous estimate for today
  await prisma.estimate.deleteMany({
    where: {
      epoch: todayEpoch,
      organizationId: organizationId,
    },
  });

  // insert the new ones
  await prisma.estimate.createMany({
    data: snapshots.map((snapshot): Prisma.EstimateCreateManyInput => {
      const [recordType, id] = unbuildUid(snapshot.uid);
      return {
        epoch: todayEpoch,
        organizationId: organizationId,
        id,
        type: recordType,
        updatedEpoch: updateEpoch,
        assigneeId: snapshot.employee_id,
        end: Math.ceil(snapshot.end),
        end_max: Math.ceil(snapshot.end_max),
        end_min: Math.ceil(snapshot.end_min),
        end_p50: Math.ceil(snapshot.end_p50),
        end_p70: Math.ceil(snapshot.end_p70),
        end_p80: Math.ceil(snapshot.end_p80),
        end_p90: Math.ceil(snapshot.end_p90),
        end_p95: Math.ceil(snapshot.end_p95),
        start: Math.ceil(snapshot.start),
        start_min: Math.ceil(snapshot.start_min),
        start_max: Math.ceil(snapshot.start_max),
        start_p50: Math.ceil(snapshot.start_p50),
        start_p70: Math.ceil(snapshot.start_p70),
        start_p80: Math.ceil(snapshot.start_p80),
        start_p90: Math.ceil(snapshot.start_p90),
        start_p95: Math.ceil(snapshot.start_p95),
      };
    }),
  });

  const ticketEstimates: { [ticketId: number]: number[] } = {};
  for (const snapshot of snapshots) {
    const [recordType, id] = unbuildUid(snapshot.uid);

    switch (recordType) {
      case EstimateType.TicketWorkflowState:
        const ticketWorkflowState = await prisma.ticketWorkflowState.update({
          where: { id },
          data: {
            estimate: new Date(snapshot.end_p80 * 1000),
          },
        });

        // collect all estimate per ticket
        if (ticketWorkflowState.ticketId in ticketEstimates) {
          ticketEstimates[ticketWorkflowState.ticketId].push(snapshot.end_p80);
        } else {
          ticketEstimates[ticketWorkflowState.ticketId] = [snapshot.end_p80];
        }
    }
  }

  // flush all old  ticket estimates
  await prisma.ticket.updateMany({
    where: { organizationId },
    data: { eta: null },
  });

  // update the ticket estimate
  for (const ticketId in ticketEstimates) {
    const ticket_end_p80 = max(ticketEstimates[ticketId]);

    if (ticket_end_p80) {
      await prisma.ticket.update({
        where: { id: parseInt(ticketId) },
        data: {
          eta: new Date(ticket_end_p80 * 1000),
        },
      });
    }
  }
}

export const getDayEpoch = (date: Date): number => {
  return date.setUTCHours(0, 0, 0, 0) / 1000;
};

type TicketWithTicketWorkflowStates = Ticket & {
  ticketWorkflowStates: TicketWorkflowState[];
};

type ScheduleItemForEstimate = ScheduleItem & {
  ticketWorkflowState: TicketWorkflowState;
  nextTicketWorkflowState?: TicketWorkflowState | null;
};

type TicketForEstimate = Ticket & {
  scheduleItems: ScheduleItemForEstimate[];
  ticketWorkflowStates: TicketWorkflowState[];
  ancestors: TicketWithTicketWorkflowStates[];
};

interface ScheduleItemForEstimateObj {
  id: number;
}

interface ScheduleConfigForEstimate {
  priority: number;
  tags: ScheduleItemForEstimateObj[];
  features: ScheduleItemForEstimateObj[];
  products: ScheduleItemForEstimateObj[];
  workflows: ScheduleItemForEstimateObj[];
  tickets: ScheduleItemForEstimateObj[];
  projects: ScheduleItemForEstimateObj[];
}

export async function estimateTickets(
  organizationId: number,
  scheduledTickets: TicketForEstimate[],
  scheduleConfigs: ScheduleConfigForEstimate[],
  quick?: boolean
): Promise<ScheduleSnapshot[]> {
  // we will also retrieve all the active jobs
  const startedScheduleItems = await prisma.scheduleItem.findMany({
    where: {
      organizationId: organizationId,
      stoppedAt: null,
      role: {
        status: RoleStatus.ACCEPTED,
      },
      ticket: {
        status: TicketStatus.SCHEDULED,
        stage: ModelStage.PUBLISHED,
      },
    },
  });

  // store who's working on which ticket workflow state
  const startedWorkflowStates: StartedWorkflowState[] = map(
    startedScheduleItems,
    (scheduleItem): StartedWorkflowState => ({
      uid: buildUid("TicketWorkflowState", scheduleItem.ticketWorkflowStateId),
      employee_id: scheduleItem.roleId,
      start_time: Math.round(scheduleItem.startedAt.getTime() / 1000),
    })
  );

  const contextTasks: ContextTask[] = [];
  const employee_ids: number[] = [];

  // the name of the game here is to capture the lowest set priority
  // for example:
  // workflow "A" : priority 10
  // product "B"  : priority 2
  // if a ticket belongs to both, it should have the lowest priority: 2
  const ticketPriority: { [id: number]: number } = {};
  for (const filter of scheduleConfigs) {
    const where: Prisma.TicketWhereInput = {
      stage: ModelStage.PUBLISHED,
      status: TicketStatus.SCHEDULED,
    };

    if (filter.projects.length) {
      let projectIds: number[] = [];

      // capture all the sub-project IDs from the selected projects
      for (const project of filter.projects) {
        projectIds = [
          ...projectIds,
          project.id,
          ...(await getProjectDescendantIds(project.id)),
        ];
      }

      where.projectId = { in: uniq(projectIds) };
    }

    if (filter.workflows.length) {
      where.workflowId = { in: map(filter.workflows, "id") };
    }

    if (filter.products.length) {
      where.productId = { in: map(filter.products, "id") };
    }

    if (filter.features.length) {
      where.features = { some: { id: { in: map(filter.features, "id") } } };
    }

    if (filter.tags.length) {
      where.tags = { some: { id: { in: map(filter.tags, "id") } } };
    }

    if (filter.tickets.length) {
      where.id = { in: map(filter.tickets, "id") };
    }

    const prioritizedTickets = await prisma.ticket.findMany({
      select: { id: true },
      where,
    });

    prioritizedTickets.forEach(({ id }) => {
      if (id in ticketPriority) {
        if (ticketPriority[id] > filter.priority) {
          ticketPriority[id] = filter.priority;
        }
      } else {
        ticketPriority[id] = filter.priority;
      }
    });
  }

  for (const ticket of scheduledTickets) {
    let startPosition = 0;

    const lastScheduleItem = last(
      orderBy(ticket.scheduleItems, "stoppedAt", "asc")
    );

    if (lastScheduleItem) {
      // if there is a nextTicketWorkflowState this means the
      // ticketWorkflowState state is done
      startPosition = lastScheduleItem.nextTicketWorkflowState
        ? lastScheduleItem.nextTicketWorkflowState.position
        : lastScheduleItem.ticketWorkflowState.position;
    }

    // the ancestor of this ticket are the last step of
    // every ancestor (we start this task after all ancestor
    // have been completed)
    let ancestors: string[] = [];
    ticket.ancestors.forEach((ancestor) => {
      const lastState = last(ancestor.ticketWorkflowStates);
      if (lastState) {
        ancestors.push(buildUid("TicketWorkflowState", lastState.id));
      }
    });

    for (const state of ticket.ticketWorkflowStates) {
      // we don't want to re-compute workflow state that we've already achieved
      // so we do not process anything before the last known active state
      if (state.position < startPosition) {
        continue;
      }

      if (state.assigneeId) {
        const uid = buildUid("TicketWorkflowState", state.id);

        const contextTask: ContextTask = {
          uid,
          employee_id: state.assigneeId,
          min: state.estimateMinimum!,
          likely: state.estimateMostLikely!,
          max: state.estimateMaximum!,
          priority: get(ticketPriority, ticket.id, 10000),
          fractionable: state.fractionable,
          ancestors,
        };

        // If there is a lastScheduleItem associated with this ticket,
        // it's possible that the person working on it is not the assignee
        // This means that we should repace the employee_id by the roleId
        // stored on the lastScheduleItem
        if (
          lastScheduleItem &&
          // nextTicketWorkflowState would mean this state is "done"
          !lastScheduleItem.nextTicketWorkflowState &&
          // must be the same state
          lastScheduleItem.ticketWorkflowStateId === state.id
        ) {
          contextTask.employee_id = lastScheduleItem.roleId;
        }

        contextTasks.push(contextTask);
        // The next step has this step as an ancestor
        ancestors = [uid];

        // Add assignee to the list of employee to provide
        // to the scheduler
        employee_ids.push(contextTask.employee_id);
      }
    }
  }

  // We'll then capture all the employees schedules
  const roles = await prisma.role.findMany({
    where: {
      id: { in: uniq(employee_ids) },
      organizationId,
    },
    include: { user: true },
  });

  const contextSchedules: ContextSchedule[] = [];
  for (const role of roles) {
    const workWeek = JSON.parse(role.workWeek) as WorkWeekTime;
    const contextWorkWeek: ContextWorkWeek = {};

    // Converts a day into a set of tuples [[hour, minute],[hour, minute],...]
    const dayConv = (schedule: RoleWorkDay): [string, string] => [
      schedule.startTime,
      schedule.stopTime,
    ];

    contextWorkWeek.monday = map(workWeek.monday, dayConv);
    contextWorkWeek.tuesday = map(workWeek.tuesday, dayConv);
    contextWorkWeek.wednesday = map(workWeek.wednesday, dayConv);
    contextWorkWeek.thursday = map(workWeek.thursday, dayConv);
    contextWorkWeek.friday = map(workWeek.friday, dayConv);
    contextWorkWeek.saturday = map(workWeek.saturday, dayConv);
    contextWorkWeek.sunday = map(workWeek.sunday, dayConv);

    const bots = await prisma.blackoutTime.findMany({
      where: {
        roles: { some: { id: role.id } },
        stopAt: { gt: new Date() },
      },
    });

    const rbots = await prisma.recurringBlackoutTime.findMany({
      where: {
        roles: { some: { id: role.id } },
        disabled: false,
      },
    });

    const timeOffs: [number, number][] = [
      ...bots.map((bot): [number, number] => [
        Math.round(bot.startAt.getTime() / 1000),
        Math.round(bot.stopAt.getTime() / 1000),
      ]),
      ...generateTimeOffsFromRecurringBlackoutTime(
        rbots,
        new Date(),
        addYears(new Date(), 2)
      ),
    ];

    contextSchedules.push({
      id: role.id.toString(),
      timezone: role.timeZone || "Zulu",
      week: contextWorkWeek,
      time_offs: mergeTimeOffs(timeOffs),
    });
  }

  const estimateContext: EstimateContext = {
    epoch: Math.round(new Date().getTime() / 1000),
    tasks: contextTasks,
    schedules: contextSchedules,
    started: startedWorkflowStates,
  };

  const estimateUrl = quick
    ? `${config.aiUri}/scheduler/estimate/quick`
    : `${config.aiUri}/scheduler/estimate`;

  const estimatesResp = await fetch(estimateUrl, {
    method: "post",
    body: JSON.stringify(estimateContext),
    headers: { "Content-Type": "application/json" },
  });

  return (await estimatesResp.json()) as ScheduleSnapshot[];
}
