import {
  TicketStatus,
  EstimateType,
  ModelStage,
  RoleStatus,
} from "@generated/type-graphql";
import { groupBy, keyBy, last, map, orderBy, sample, uniq } from "lodash";
import fetch from "node-fetch";
import prisma from "../prisma";
import { RoleWorkDay, WorkWeekTime } from "../models/entities";
import { config } from "../config";
import { subDays } from "date-fns";
import { markdownToTipTapDoc } from "./demo/markdownToDoc";

interface ContextWorkWeek {
  monday?: [string, string][];
  tuesday?: [string, string][];
  wednesday?: [string, string][];
  thursday?: [string, string][];
  friday?: [string, string][];
  saturday?: [string, string][];
  sunday?: [string, string][];
}

interface ScheduleEventResponse {
  startTime: number;
  stopTime: number;
  uid: string;
  roleId: number;
}

export interface SimulatedScheduleEvent {
  startTime: number;
  stopTime: number;
  estimateType: EstimateType;
  estimateId: number;
  roleId: number;
}

interface StartedWorkflowState {
  uid: string;
  employee_id: number;
  start_time: number;
}

interface ContextSchedule {
  id: string;
  week: ContextWorkWeek;
  timezone: string;
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
        "Bad recordType: ${recordType} should be one of ${uidRecordTypes}",
      );
  }
};

const buildUid = (recordType: RecordTypeStrings, id: number): string =>
  `${recordType.toString()}:${id}`;

export async function simulateWork(
  organizationId: number,
  fromDate: Date,
): Promise<SimulatedScheduleEvent[]> {
  // We will retrieve the estimates now
  const scheduledTickets = await prisma.ticket.findMany({
    where: {
      organizationId: organizationId,
      status: TicketStatus.SCHEDULED,
      stage: ModelStage.PUBLISHED,
    },
    include: {
      scheduleItems: {
        orderBy: { startedAt: "asc" },
        take: 1,
        include: {
          ticketWorkflowState: true,
          nextTicketWorkflowState: true,
        },
      },
      ticketWorkflowStates: {
        where: {
          isActive: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      ancestors: {
        include: {
          ticketWorkflowStates: {
            where: {
              isActive: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });

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
    }),
  );

  const contextTasks: ContextTask[] = [];
  const employee_ids: number[] = [];

  for (const ticket of scheduledTickets) {
    let startPosition = 0;

    const lastScheduleItem = last(ticket.scheduleItems);
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
      // so we do not process anything before the last known state
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
          priority: 101,
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

    contextSchedules.push({
      id: role.id.toString(),
      timezone: role.timeZone || "Zulu",
      week: contextWorkWeek,
    });
  }

  const estimateContext: EstimateContext = {
    epoch: fromDate.getTime() / 1000,
    tasks: contextTasks,
    schedules: contextSchedules,
    started: startedWorkflowStates,
  };

  const eventsResp = await fetch(`${config.aiUri}/scheduler/events`, {
    method: "post",
    body: JSON.stringify(estimateContext),
    headers: { "Content-Type": "application/json" },
  });

  const snapshots = (await eventsResp.json()) as ScheduleEventResponse[];

  return map(snapshots, (event): SimulatedScheduleEvent => {
    const [estimateType, estimateId] = unbuildUid(event.uid);
    return {
      startTime: event.startTime,
      stopTime: event.stopTime,
      estimateType,
      estimateId,
      roleId: event.roleId,
    };
  });
}

export const getDayEpoch = (date: Date): number => {
  return date.setUTCHours(0, 0, 0, 0) / 1000;
};

export async function runSimulation(
  organizationId: number,
  pastTimeFrame: number,
) {
  const events = orderBy(
    await simulateWork(organizationId, subDays(new Date(), pastTimeFrame)),
    ["startTime"],
    ["asc"],
  );

  const nowEpoch = new Date().getTime() / 1000;

  const ticketWorkflowStates = await prisma.ticketWorkflowState.findMany({
    where: {
      ticket: {
        organizationId: organizationId,
      },
    },
  });

  const statesByTicketId = groupBy(ticketWorkflowStates, "ticketId");
  const stateById = keyBy(ticketWorkflowStates, "id");

  const lastEvent: { [stateId: number]: SimulatedScheduleEvent } = {};
  // identify the closing event by going through the list of events
  // and only storing the last one
  for (const event of events) {
    const state = stateById[event.estimateId];
    const lastState = orderBy(
      statesByTicketId[state.ticketId],
      "position",
      "desc",
    )[0];

    if (state === lastState) {
      if (lastEvent[event.estimateId]) {
        if (lastEvent[event.estimateId].startTime < event.startTime) {
          lastEvent[event.estimateId] = event;
        }
      } else {
        lastEvent[event.estimateId] = event;
      }
    }
  }

  // store all the event in their order of appearance
  const eventsByTicketId: { [ticketId: number]: SimulatedScheduleEvent[] } = {};
  for (const event of events) {
    const state = stateById[event.estimateId];

    if (!eventsByTicketId[state.ticketId]) {
      eventsByTicketId[state.ticketId] = [];
    }

    eventsByTicketId[state.ticketId].push(event);
  }

  // first lets remove all the events in the future
  const pastEvents = events.filter((event) => event.startTime < nowEpoch);

  for (const event of pastEvents) {
    const ticketWorkflowState = await prisma.ticketWorkflowState.findFirst({
      where: {
        id: event.estimateId,
      },
    });

    if (ticketWorkflowState) {
      // only provide a stopTime if the task stopped before now
      const stopTime =
        event.stopTime > nowEpoch ? null : new Date(event.stopTime * 1000);

      // a task is done if the event is the last one for that ticket
      // and it does not finish in the future
      const isDone = stopTime
        ? event === lastEvent[ticketWorkflowState.id]
        : false;

      // find the next event and set the schedule item next TicketWorkflowState
      // to it only if it's a different state (aka moving to the next stage)
      const eventPosition =
        eventsByTicketId[ticketWorkflowState.ticketId].indexOf(event);
      const nextEvent =
        eventsByTicketId[ticketWorkflowState.ticketId][eventPosition + 1];
      const nextEventId =
        nextEvent && nextEvent.estimateId !== ticketWorkflowState.id
          ? nextEvent.estimateId
          : null;

      await prisma.scheduleItem.create({
        data: {
          nextTicketWorkflowState: nextEventId
            ? { connect: { id: nextEventId } }
            : undefined,
          ticketWorkflowState: { connect: { id: ticketWorkflowState.id } },
          role: { connect: { id: event.roleId } },
          startedAt: new Date(event.startTime * 1000),
          stoppedAt: stopTime,
          createdAt: stopTime || undefined,
          organization: { connect: { id: organizationId } },
          ticket: { connect: { id: ticketWorkflowState.ticketId } },
          done: !!nextEventId,
        },
      });

      // If we transition to another state, lets add a note
      if (nextEventId) {
        await prisma.ticketWorkflowStateNote.create({
          data: {
            ticketWorkflowStateId: nextEventId,
            fromTicketWorkflowStateId: ticketWorkflowState.id,
            authorId: event.roleId,
            body: JSON.stringify(markdownToTipTapDoc(getTransitionNote())),
            createdAt: stopTime || undefined,
          },
        });
      }

      if (isDone) {
        await prisma.ticket.update({
          where: { id: ticketWorkflowState.ticketId },
          data: {
            status: TicketStatus.DONE,
            closedAt: stopTime,
            closingNote: JSON.stringify(
              markdownToTipTapDoc(getTransitionNote()),
            ),
          },
        });
      }
    }
  }
}

const getTransitionNote = (): string =>
  sample([
    "Loogs good to me!",
    "LGTM 👍",
    "This should do it",
    "Tested in staging, looks fine",
    "Minor changes in the spec but result should be as expected",
    "I think it's good now",
    "That should do it",
    "Done",
    "Done and Done!",
    "let me know if you find anything but should be good now",
    "All set and ready to go!",
    "This one's in the bag 🎉",
    "Ready for review!",
    "Checked off the list ✅",
    "Good to merge!",
    "Ready to ship 🚀",
    "Looking good, feel free to merge",
    "Code review passed, ready for deployment",
    "Mission accomplished 👊",
    "Work complete, over and out",
    "Ready to move on to the next task",
    "Issue resolved, let me know if there are any questions",
    "Task completed successfully",
    "Problem solved, on to the next challenge",
    "Task completed, thanks for the opportunity to work on it!",
    "Checked and double-checked, all good to go",
    "Ready for production, let's deploy!",
    "Issue resolved, time to celebrate 🎉",
    "Everything looks good, no issues found",
    "Task complete, time to move on to the next one",
    "Changes made, ready for final review",
    "Done and dusted!",
    "Task complete, happy to answer any questions",
    "Ready for prime time!",
    "Task completed, let's close this one out",
    "Code complete, ready for QA",
    "Changes implemented, please review and merge",
    "Ready to ship to the client",
    "Mission complete, awaiting next orders",
    "Task done, thanks for collaborating on this one",
    "All done here, please review and provide feedback",
    "Task complete, onto the next challenge!",
    "Task completed, ready to roll out",
    "Ready for deployment, let's push this to production",
  ])!;
