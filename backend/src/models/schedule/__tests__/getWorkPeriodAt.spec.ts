import { WorkWeekTime } from "../../entities";
import { getWorkPeriodAt, getAvailableWorkHoursAt } from "../helper";
import expect from "expect";

describe("getWorkPeriodAt", () => {
  it("should return work period", () => {
    const workweek: WorkWeekTime = {
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

    const timeZone = "Pacific/Guam";
    // This should be 2022-02-23T22:34 in Guam time
    const date = new Date("2022-02-22T22:34:22.000Z");

    expect(getWorkPeriodAt(workweek, timeZone, date)).toEqual([
      new Date("2022-02-22T22:00:00.000Z"), // 8am
      new Date("2022-02-23T02:00:00.000Z"), // 12pm
    ]);
  });
});

describe("getAvailableWorkHoursAt", () => {
  it("should return work period (western timezone)", () => {
    const workweek: WorkWeekTime = {
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

    const timeZone = "America/New_York";
    // Friday, March 10, 2023 - 12:14
    const fromDate = new Date("2023-03-10T17:14:05.139Z");
    // Wednesday, March 15, 2023 - 22:15
    const toDateDate = new Date("2023-03-16T02:15:00.000Z");

    expect(
      getAvailableWorkHoursAt(workweek, timeZone, fromDate, toDateDate)
    ).toEqual(4 + 8 + 8 + 8);
  });

  it("should return work period (eastern timezone)", () => {
    const workweek: WorkWeekTime = {
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

    const timeZone = "Australia/Perth";
    // Thursday, March 16, 2023 - 07:15 (morning)
    const fromDate = new Date("2023-03-15T23:15:00.000Z");
    // Monday, March 20, 2023 - 11:15 (before lunch time)
    const toDateDate = new Date("2023-03-20T03:15:00.000Z");

    expect(
      getAvailableWorkHoursAt(workweek, timeZone, fromDate, toDateDate)
    ).toEqual(8 + 8 + 3.25);
  });
});
