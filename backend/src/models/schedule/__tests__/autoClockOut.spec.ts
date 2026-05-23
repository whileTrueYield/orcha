import { autoClockOut } from "../jobs/autoClockOut";
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

describe("autoClockOut", () => {
  let installedClock: FakeTimers.InstalledClock;

  beforeEach(() => {
    // this should 12:01pm in New York
    installedClock = FakeTimers.install({
      now: new Date("2023-08-15T16:01:00.000Z"),
    });
  });

  afterEach(() => {
    installedClock.uninstall();
  });

  it("clocks out at the end of the time period when starting at the exact begining", async () => {
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

    // we started at exactly 8am, New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T12:00:00.000Z",
    });

    await autoClockOut();

    const updatedScheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
      where: {
        id: scheduleItem.id,
      },
    });

    expect(updatedScheduleItem.autoStopped).toBe(true);
    expect(updatedScheduleItem.stoppedAt?.toISOString()).toBe(
      "2023-08-15T16:00:00.000Z"
    );
  });

  it("clocks out at the end the time period", async () => {
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

    // we started at 9am, New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T13:00:00.000Z",
    });

    await autoClockOut();

    const updatedScheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
      where: {
        id: scheduleItem.id,
      },
    });

    expect(updatedScheduleItem.autoStopped).toBe(true);
    expect(updatedScheduleItem.stoppedAt?.toISOString()).toBe(
      "2023-08-15T16:00:00.000Z"
    );
  });

  it("clocks out at the end the time period when started less than 2 hours before start", async () => {
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

    // an early start at 7am, New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T11:00:00.000Z",
    });

    await autoClockOut();

    const updatedScheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
      where: {
        id: scheduleItem.id,
      },
    });

    expect(updatedScheduleItem.autoStopped).toBe(true);
    expect(updatedScheduleItem.stoppedAt?.toISOString()).toBe(
      "2023-08-15T16:00:00.000Z"
    );
  });

  it("clocks out within two hours of the start time when outside of work hours", async () => {
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

    // a very early start at 5am, New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T09:00:00.000Z",
    });

    await autoClockOut();

    const updatedScheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
      where: {
        id: scheduleItem.id,
      },
    });

    expect(updatedScheduleItem.autoStopped).toBe(true);
    expect(updatedScheduleItem.stoppedAt?.toISOString()).toBe(
      "2023-08-15T11:00:00.000Z"
    );
  });
});

describe("autoClockOut in period", () => {
  let installedClock: FakeTimers.InstalledClock;

  beforeEach(() => {
    // this should 11:01pm in New York
    installedClock = FakeTimers.install({
      now: new Date("2023-08-15T15:01:00.000Z"),
    });
  });

  afterEach(() => {
    installedClock.uninstall();
  });

  it("does not clockout when in period", async () => {
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

    // a regular start at 8am, New York time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T12:00:00.000Z",
    });

    await autoClockOut();

    const updatedScheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
      where: {
        id: scheduleItem.id,
      },
    });

    expect(updatedScheduleItem.autoStopped).toBe(false);
    expect(updatedScheduleItem.stoppedAt).toBe(null);
  });

  it("does not clockout when started in period limit (2hrs)", async () => {
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

    // early start at 7am, New York time, 1hr before regular time
    const scheduleItem = await createScheduleItem(role, ticket, {
      startedAt: "2023-08-15T11:00:00.000Z",
    });

    await autoClockOut();

    const updatedScheduleItem = await prisma.scheduleItem.findUniqueOrThrow({
      where: {
        id: scheduleItem.id,
      },
    });

    expect(updatedScheduleItem.autoStopped).toBe(false);
    expect(updatedScheduleItem.stoppedAt).toBe(null);
  });
});
