import { autoResumeTask } from "../jobs/autoResumeTask";
import "mocha";
import expect from "expect";
import {
  createRandomOrgAndUser,
  createRandomTicket,
  createScheduleItem,
} from "../../../utils/testing";
import FakeTimers from "@sinonjs/fake-timers";
import { RoleType } from "@prisma/client";
import { WorkWeekTime } from "../../entities";
import prisma from "../../../prisma";
import { autoClockOut } from "../../schedule/jobs/autoClockOut";

export const FULL_TIME_WORK_WEEK: WorkWeekTime = {
  monday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  tuesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  wednesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  thursday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  friday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  saturday: [],
  sunday: [],
};

export const TUESDAY_SMALL_BLOCK_WORK: WorkWeekTime = {
  monday: [],
  tuesday: [
    { startTime: "08:00", stopTime: "08:30" },
    { startTime: "09:00", stopTime: "09:30" },
    { startTime: "10:00", stopTime: "10:30" },
    { startTime: "11:00", stopTime: "11:30" },
    { startTime: "12:00", stopTime: "12:30" },
  ],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

describe("autoResumeTask short periods", () => {
  let installedClock: FakeTimers.InstalledClock;

  beforeEach(() => {
    // Tuesday, aug 15, 2023, 06:00 am in New York
    // see https://savvytime.com/converter/utc-to-ny-new-york-city/aug-15-2023/12-00
    installedClock = FakeTimers.install({
      now: new Date("2023-08-15T10:00:00.000Z"),
    });
  });

  afterEach(() => {
    installedClock.uninstall();
  });

  it("should auto resume short tasks", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(TUESDAY_SMALL_BLOCK_WORK),
        timeZone: "America/New_York",
      }
    );

    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: "SCHEDULED",
    });

    // This is the first block, started the day before and auto-stopped
    await createScheduleItem(role, ticket, {
      startedAt: "2023-08-14T13:00:00.000Z",
      stoppedAt: "2023-08-14T16:00:00.000Z",
      autoStopped: true,
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // we'll had 10 minutes at a time, going from 06:00am to 04:00pm
    for (let i = 0; i < 60; i++) {
      await autoClockOut(); // we need to auto-clock out
      await autoResumeTask(); // ...and auto resume
      installedClock.tick("00:10:00");
    }

    // this should have created 6 blocks total (including the one from the day before)
    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        roleId: role.id,
      },
      orderBy: { id: "desc" },
    });

    expect(scheduleItems.length).toBe(6);

    expect(scheduleItems[0].autoStarted).toBe(true);
    expect(scheduleItems[0].autoStopped).toBe(true);
    expect(scheduleItems[0].startedAt.toISOString()).toBe(
      "2023-08-15T16:00:00.000Z"
    );
    expect(scheduleItems[0].stoppedAt!.toISOString()).toBe(
      "2023-08-15T16:30:00.000Z"
    );

    expect(scheduleItems[1].autoStarted).toBe(true);
    expect(scheduleItems[1].autoStopped).toBe(true);
    expect(scheduleItems[1].startedAt.toISOString()).toBe(
      "2023-08-15T15:00:00.000Z"
    );
    expect(scheduleItems[1].stoppedAt!.toISOString()).toBe(
      "2023-08-15T15:30:00.000Z"
    );

    expect(scheduleItems[2].autoStarted).toBe(true);
    expect(scheduleItems[2].autoStopped).toBe(true);
    expect(scheduleItems[2].startedAt.toISOString()).toBe(
      "2023-08-15T14:00:00.000Z"
    );
    expect(scheduleItems[2].stoppedAt!.toISOString()).toBe(
      "2023-08-15T14:30:00.000Z"
    );

    expect(scheduleItems[3].autoStarted).toBe(true);
    expect(scheduleItems[3].autoStopped).toBe(true);
    expect(scheduleItems[3].startedAt.toISOString()).toBe(
      "2023-08-15T13:00:00.000Z"
    );
    expect(scheduleItems[3].stoppedAt!.toISOString()).toBe(
      "2023-08-15T13:30:00.000Z"
    );

    expect(scheduleItems[4].autoStarted).toBe(true);
    expect(scheduleItems[4].autoStopped).toBe(true);
    expect(scheduleItems[4].startedAt.toISOString()).toBe(
      "2023-08-15T12:00:00.000Z"
    );
    expect(scheduleItems[4].stoppedAt!.toISOString()).toBe(
      "2023-08-15T12:30:00.000Z"
    );
  });
});

describe("autoResumeTask", () => {
  let installedClock: FakeTimers.InstalledClock;

  beforeEach(() => {
    // this should 13:01pm in New York
    installedClock = FakeTimers.install({
      now: new Date("2023-08-15T16:30:00.000Z"),
    });
  });

  afterEach(() => {
    installedClock.uninstall();
  });

  it("auto resume task", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(FULL_TIME_WORK_WEEK),
        timeZone: "America/New_York",
      }
    );

    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: "SCHEDULED",
    });

    // we started at 9am, auto-stopped at 12pm New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T13:00:00.000Z",
      stoppedAt: "2023-08-15T16:00:00.000Z",
      autoStopped: true,
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // adding 35 minutes to reach past 1pm
    installedClock.tick("00:35:00");

    // second call should actively resume task
    await autoResumeTask();

    const newScheduleItem = await prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: role.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(newScheduleItem.autoStarted).toBe(true);
    expect(newScheduleItem.stoppedAt).toBe(null);
    // work resume at 1pm
    expect(newScheduleItem.startedAt.toISOString()).toBe(
      "2023-08-15T17:00:00.000Z"
    );
    expect(newScheduleItem.ticketId).toBe(ticket.id);
    expect(newScheduleItem.ticketWorkflowStateId).toBe(
      scheduleItem.ticketWorkflowStateId
    );
  });

  it("does not auto resume done ticket", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(FULL_TIME_WORK_WEEK),
        timeZone: "America/New_York",
      }
    );

    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: "DONE",
    });

    // we started at 9am, auto-stopped at 12pm New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T13:00:00.000Z",
      stoppedAt: "2023-08-15T16:00:00.000Z",
      autoStopped: true,
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // adding 35 minutes to reach past 1pm
    installedClock.tick("00:35:00");

    // second call should actively resume task
    await autoResumeTask();

    const dbScheduleItem = await prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: role.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(dbScheduleItem.autoStarted).toBe(false);
    expect(dbScheduleItem.id).toBe(scheduleItem.id);
    expect(dbScheduleItem.stoppedAt).toEqual(scheduleItem.stoppedAt);
    expect(dbScheduleItem.startedAt).toEqual(scheduleItem.startedAt);
  });

  it("does not auto resume done workflow state", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(FULL_TIME_WORK_WEEK),
        timeZone: "America/New_York",
      }
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    // we started at 9am, auto-stopped at 12pm New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T13:00:00.000Z",
      stoppedAt: "2023-08-15T16:00:00.000Z",
      nextTicketWorkflowState: { connect: { id: ticketWorkflowStates[1].id } },
      autoStopped: true,
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // adding 35 minutes to reach past 1pm
    installedClock.tick("00:35:00");

    // second call should actively resume task
    await autoResumeTask();

    const dbScheduleItem = await prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: role.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(dbScheduleItem.autoStarted).toBe(false);
    expect(dbScheduleItem.id).toBe(scheduleItem.id);
    expect(dbScheduleItem.stoppedAt).toEqual(scheduleItem.stoppedAt);
    expect(dbScheduleItem.startedAt).toEqual(scheduleItem.startedAt);
  });

  it("does not resume task that was not auto-stopped", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(FULL_TIME_WORK_WEEK),
        timeZone: "America/New_York",
      }
    );

    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: "SCHEDULED",
    });

    // we started at 9am, auto-stopped at 12pm New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T13:00:00.000Z",
      stoppedAt: "2023-08-15T16:00:00.000Z",
      autoStopped: false,
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // adding 35 minutes to reach past 1pm
    installedClock.tick("00:35:00");

    // second call should actively resume task but will not
    // in this case since the autoStopped was false
    await autoResumeTask();

    const dbScheduleItem = await prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: role.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(dbScheduleItem.autoStarted).toBe(false);
    expect(dbScheduleItem.id).toBe(scheduleItem.id);
    expect(dbScheduleItem.stoppedAt).toEqual(scheduleItem.stoppedAt);
    expect(dbScheduleItem.startedAt).toEqual(scheduleItem.startedAt);
  });

  it("does not resume task that was auto-stopped if it's not the very last one", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(FULL_TIME_WORK_WEEK),
        timeZone: "America/New_York",
      }
    );

    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: "SCHEDULED",
    });

    const { ticket: secondTicket } = await createRandomTicket(
      organization,
      role,
      undefined,
      {
        status: "SCHEDULED",
      }
    );

    // first body of work, it was auto stopped
    const autoStoppedScheduleItem = await createScheduleItem(
      role,
      secondTicket,
      {
        startedAt: "2023-08-15T13:00:00.000Z",
        stoppedAt: "2023-08-15T14:00:00.000Z",
        autoStopped: true,
      }
    );

    // second body of work, happens after but was not auto-stopped
    const regularScheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T15:00:00.000Z",
      stoppedAt: "2023-08-15T16:00:00.000Z",
      autoStopped: false,
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // adding 35 minutes to reach past 1pm
    installedClock.tick("00:35:00");

    // second call should actively resume task but will not
    // in this case since the last schedule item was not auto-stopped
    await autoResumeTask();

    const dbScheduleItem = await prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: role.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(dbScheduleItem.autoStarted).toBe(false);
    expect(dbScheduleItem.id).toBe(regularScheduleItem.id);
    expect(dbScheduleItem.stoppedAt).toEqual(regularScheduleItem.stoppedAt);
    expect(dbScheduleItem.startedAt).toEqual(regularScheduleItem.startedAt);
  });

  it("does not resume task if another task is active", async () => {
    const { organization, role } = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {
        workWeek: JSON.stringify(FULL_TIME_WORK_WEEK),
        timeZone: "America/New_York",
      }
    );

    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: "SCHEDULED",
    });

    const { ticket: otherTicket } = await createRandomTicket(
      organization,
      role,
      undefined,
      {
        status: "SCHEDULED",
      }
    );

    // we started at 9am, auto-stopped at 10pm New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T13:00:00.000Z",
      stoppedAt: "2023-08-15T14:00:00.000Z",
      autoStopped: true,
    });

    // we are now actively working on something else
    const activeScheduleItem = await createScheduleItem(role, otherTicket, {
      startedAt: "2023-08-15T15:00:00.000Z",
    });

    // first call will create the resume records but
    // not resuming any task since the clock is set at 12:30pm
    await autoResumeTask();

    // adding 35 minutes to reach past 1pm
    installedClock.tick("00:35:00");

    // second call should actively resume task but will not
    // in this case since the autoStopped was false
    await autoResumeTask();

    const dbScheduleItem = await prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: role.id,
      },
      orderBy: { createdAt: "desc" },
    });

    expect(dbScheduleItem.autoStarted).toBe(false);
    expect(dbScheduleItem.id).toBe(activeScheduleItem.id);
    expect(dbScheduleItem.stoppedAt).toEqual(activeScheduleItem.stoppedAt);
    expect(dbScheduleItem.startedAt).toEqual(activeScheduleItem.startedAt);
  });
});
