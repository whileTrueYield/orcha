import { generateTimeOffsFromRecurringBlackoutTime } from "../entity";
import { RecurringBlackoutTime } from "../../entities";
import expect from "expect";
import "mocha";

describe("generateTimeOffsFromRecurringBlackoutTime", () => {
  it("should generate time offs in a positive TZ", () => {
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

    const fromDate = new Date("2023-02-01T00:00:00Z");
    const untilDate = new Date("2023-02-08T00:00:00Z");

    const timeOffs = generateTimeOffsFromRecurringBlackoutTime(
      [blackoutTime],
      fromDate,
      untilDate
    );

    expect(timeOffs).toEqual([[1675292400, 1675306800]]);
  });

  it("should generate time offs in a negative TZ", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "20:00", // 8 pm
      stopTime: "22:00", // 10 pm
      name: "example",
      disabled: false,
      timeZone: "America/New_York",
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

    const fromDate = new Date("2023-02-01T00:00:00Z");
    const untilDate = new Date("2023-02-08T00:00:00Z");

    const timeOffs = generateTimeOffsFromRecurringBlackoutTime(
      [blackoutTime],
      fromDate,
      untilDate
    );

    expect(timeOffs).toEqual([[1675386000, 1675393200]]);
  });

  it("should generate as many time offs as active days", () => {
    const blackoutTime: RecurringBlackoutTime = {
      id: 1,
      organizationId: 1,
      startTime: "08:00", // 8 am
      stopTime: "09:00", // 9 am
      name: "example",
      disabled: false,
      timeZone: "Europe/Paris",
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      roles: [],
      createdAt: new Date("2023-01-02T03:00:00Z"),
      updatedAt: new Date("2023-01-02T03:00:00Z"),
    };

    const fromDate = new Date("2023-02-01T00:00:00Z");
    const untilDate = new Date("2023-02-08T00:00:00Z");

    const timeOffs = generateTimeOffsFromRecurringBlackoutTime(
      [blackoutTime],
      fromDate,
      untilDate
    );

    expect(timeOffs).toEqual([
      [1675234800, 1675238400],
      [1675321200, 1675324800],
      [1675407600, 1675411200],
      [1675666800, 1675670400],
      [1675753200, 1675756800],
    ]);
  });

  it("should generate time offs for all blackout time provided", () => {
    const blackoutTimes: RecurringBlackoutTime[] = [
      {
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
      },
      {
        id: 1,
        organizationId: 1,
        startTime: "20:00", // 8 pm
        stopTime: "22:00", // 10 pm
        name: "example",
        disabled: false,
        timeZone: "America/New_York",
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
      },
    ];

    const fromDate = new Date("2023-02-01T00:00:00Z");
    const untilDate = new Date("2023-02-08T00:00:00Z");

    const timeOffs = generateTimeOffsFromRecurringBlackoutTime(
      blackoutTimes,
      fromDate,
      untilDate
    );

    expect(timeOffs).toEqual([
      [1675292400, 1675306800],
      [1675386000, 1675393200],
    ]);
  });
});
