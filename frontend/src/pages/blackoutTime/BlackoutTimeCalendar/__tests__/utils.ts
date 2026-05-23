import { RecurringBlackoutTime } from "types/graphql";
import { recurringBlackoutTimeToCalendarEvents } from "../utils";
import { endOfWeek, startOfWeek } from "date-fns";

describe("Running text in UTC Timezones", () => {
  it("should always be UTC", () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});

describe("recurringBlackoutTimeToCalendarEvent", () => {
  it("convert BlackoutTime to CalendarEvent (simple)", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "08:00", // 8:00 am
      stopTime: "09:00", // 9:00 am
      name: "example",
      disabled: false,
      timeZone: "UTC",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: false,
      sunday: false,
      roles: [],
      createdAt: new Date("2023-01-02T03:00:00Z"),
      updatedAt: new Date("2023-01-02T03:00:00Z"),
    };

    const event = recurringBlackoutTimeToCalendarEvents(
      blackoutTime,
      startOfWeek(new Date("2023-02-02T03:00:00Z")),
      endOfWeek(new Date("2023-02-02T03:00:00Z")),
      "bg-sky-200 rounded"
    );

    expect(event).toEqual([
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-02T08:00:00.000Z"),
        stopDate: new Date("2023-02-02T09:00:00.000Z"),

        name: "example",
        className: "bg-sky-200 rounded",
      },
    ]);
  });

  it("convert BlackoutTime to CalendarEvent (with negative TZ)", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "03:00", // 3:00 am
      stopTime: "04:00", // 4:00 am
      name: "example",
      disabled: false,
      timeZone: "America/Los_Angeles",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: false,
      sunday: false,
      roles: [],
      createdAt: new Date("2023-01-02T03:00:00Z"),
      updatedAt: new Date("2023-01-02T03:00:00Z"),
    };

    const event = recurringBlackoutTimeToCalendarEvents(
      blackoutTime,
      startOfWeek(new Date("2023-02-02T03:00:00Z")),
      endOfWeek(new Date("2023-02-02T03:00:00Z"))
    );

    expect(event).toEqual([
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-02T11:00:00.000Z"),
        stopDate: new Date("2023-02-02T12:00:00.000Z"),
        name: "example",
      },
    ]);
  });

  it("convert BlackoutTime to CalendarEvent (with positive TZ)", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "08:00", // 8:00 am
      stopTime: "09:00", // 9:00 am
      name: "example",
      disabled: false,
      timeZone: "Pacific/Enderbury",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: false,
      sunday: false,
      roles: [],
      createdAt: new Date("2023-01-02T03:00:00Z"),
      updatedAt: new Date("2023-01-02T03:00:00Z"),
    };

    const event = recurringBlackoutTimeToCalendarEvents(
      blackoutTime,
      startOfWeek(new Date("2023-02-02T03:00:00Z")),
      endOfWeek(new Date("2023-02-02T03:00:00Z"))
    );

    expect(event).toEqual([
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-01T19:00:00.000Z"),
        stopDate: new Date("2023-02-01T20:00:00.000Z"),
        name: "example",
      },
    ]);
  });

  it("convert BlackoutTime to CalendarEvent (with split negative TZ)", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "02:00", // 2 am
      stopTime: "06:00", // 6 am
      name: "example",
      disabled: false,
      timeZone: "Europe/Moscow",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: false,
      sunday: false,
      roles: [],
      createdAt: new Date("2023-01-02T03:00:00Z"),
      updatedAt: new Date("2023-01-02T03:00:00Z"),
    };

    const event = recurringBlackoutTimeToCalendarEvents(
      blackoutTime,
      startOfWeek(new Date("2023-02-02T03:00:00Z")),
      endOfWeek(new Date("2023-02-02T03:00:00Z"))
    );

    expect(event).toEqual([
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-01T23:00:00.000Z"),
        stopDate: new Date("2023-02-01T23:59:59.000Z"),
        name: "example",
      },
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-02T00:00:00.000Z"),
        stopDate: new Date("2023-02-02T03:00:00.000Z"),
        name: "example",
      },
    ]);
  });

  it("convert BlackoutTime to CalendarEvent over many days", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "02:00", // 2 am
      stopTime: "06:00", // 6 am
      name: "example",
      disabled: false,
      timeZone: "Europe/Moscow",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: false,
      sunday: true,
      roles: [],
      createdAt: new Date("2023-01-02T03:00:00Z"),
      updatedAt: new Date("2023-01-02T03:00:00Z"),
    };

    const event = recurringBlackoutTimeToCalendarEvents(
      blackoutTime,
      startOfWeek(new Date("2023-02-02T03:00:00Z")),
      endOfWeek(new Date("2023-02-02T03:00:00Z"))
    );

    expect(event).toEqual([
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-01-29T00:00:00.000Z"),
        stopDate: new Date("2023-01-29T03:00:00.000Z"),
        name: "example",
      },
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-01T23:00:00.000Z"),
        stopDate: new Date("2023-02-01T23:59:59.000Z"),
        name: "example",
      },
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-02T00:00:00.000Z"),
        stopDate: new Date("2023-02-02T03:00:00.000Z"),
        name: "example",
      },
      {
        id: 1,
        type: "RecurringBlackoutTime",
        startDate: new Date("2023-02-04T23:00:00.000Z"),
        stopDate: new Date("2023-02-04T23:59:59.000Z"),
        name: "example",
      },
    ]);
  });
});
