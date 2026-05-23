import { createRandomOrgAndUser } from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import expect from "expect";
import { getNextWorkDayStartDate } from "../jobs/workDayEmail";
import { DEFAULT_WORK_WEEK } from "../entity";

describe("getNextWorkDayStartDate", () => {
  it("accepts an optional offset argument in hours", async () => {
    const { role } = await createRandomOrgAndUser(RoleType.MEMBER, false, {
      timeZone: "America/New_York",
      workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
    });

    // we start on sunday
    let runDate = new Date("2022-03-07T00:00:00.000Z");
    let nextDate = await getNextWorkDayStartDate(role, runDate, 6);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-07T02:00:00.000-05:00").toISOString()
    );
  });

  it("returns the next work day (west timezone)", async () => {
    const { role } = await createRandomOrgAndUser(RoleType.MEMBER, false, {
      timeZone: "America/New_York",
      workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
    });

    // we start on sunday
    let runDate = new Date("2022-03-07T00:00:00.000Z");
    let nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-07T07:00:00.000-05:00").toISOString()
    );

    // ...monday
    runDate = new Date("2022-03-08T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-08T07:00:00.000-05:00").toISOString()
    );

    // ...tuesday
    runDate = new Date("2022-03-09T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-09T07:00:00.000-05:00").toISOString()
    );

    // ...wednesday
    runDate = new Date("2022-03-10T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-10T07:00:00.000-05:00").toISOString()
    );

    // ...thursday
    runDate = new Date("2022-03-11T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-11T07:00:00.000-05:00").toISOString()
    );

    // ...friday
    runDate = new Date("2022-03-12T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-14T07:00:00.000-04:00").toISOString()
    );

    // ...saturday
    runDate = new Date("2022-03-13T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -04:00 summer time in New York on Monday, 1 hour before start of day
      new Date("2022-03-14T07:00:00.000-04:00").toISOString()
    );

    // finally the following sunday
    runDate = new Date("2022-03-14T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -04:00 summer time in New York on Monday, 1 hour before start of day
      new Date("2022-03-14T07:00:00.000-04:00").toISOString()
    );
  });

  it("returns the next work day (east timezone)", async () => {
    const { role } = await createRandomOrgAndUser(RoleType.MEMBER, false, {
      timeZone: "Europe/Kiev",
      workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
    });

    // we start on sunday (in kiev time)
    let runDate = new Date("2022-03-21T00:00:00.000Z");
    let nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +02:00 winter time in Kiev, 1 hour before start of day
      new Date("2022-03-21T07:00:00.000+02:00").toISOString()
    );

    // ...monday
    runDate = new Date("2022-03-22T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +02:00 winter time in Kiev, 1 hour before start of day
      new Date("2022-03-22T07:00:00.000+02:00").toISOString()
    );

    // ...tuesday
    runDate = new Date("2022-03-23T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +02:00 winter time in Kiev, 1 hour before start of day
      new Date("2022-03-23T07:00:00.000+02:00").toISOString()
    );

    // ...wednesday
    runDate = new Date("2022-03-24T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +02:00 winter time in Kiev, 1 hour before start of day
      new Date("2022-03-24T07:00:00.000+02:00").toISOString()
    );

    // ...thursday
    runDate = new Date("2022-03-25T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +02:00 winter time in Kiev, 1 hour before start of day
      new Date("2022-03-25T07:00:00.000+02:00").toISOString()
    );

    // ...friday
    runDate = new Date("2022-03-26T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +03:00 summer time in Kiev on Monday, 1 hour before start of day
      new Date("2022-03-28T07:00:00.000+03:00").toISOString()
    );

    // ...saturday
    runDate = new Date("2022-03-27T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +03:00 summer time in Kiev on Monday, 1 hour before start of day
      new Date("2022-03-28T07:00:00.000+03:00").toISOString()
    );

    // finally the following sunday
    runDate = new Date("2022-03-28T00:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // +03:00 summer time in Kiev on Monday, 1 hour before start of day
      new Date("2022-03-28T07:00:00.000+03:00").toISOString()
    );
  });

  it("returns the next work day (west timezone - end of day)", async () => {
    const { role } = await createRandomOrgAndUser(RoleType.MEMBER, false, {
      timeZone: "America/New_York",
      workWeek: JSON.stringify(DEFAULT_WORK_WEEK),
    });

    // we start on Monday, 12pm EST
    let runDate = new Date("2022-03-07T23:00:00.000Z");
    let nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-08T07:00:00.000-05:00").toISOString()
    );

    // ...Tuesday, 12pm EST
    runDate = new Date("2022-03-08T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-09T07:00:00.000-05:00").toISOString()
    );

    // ...Wednesday, 12pm EST
    runDate = new Date("2022-03-09T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-10T07:00:00.000-05:00").toISOString()
    );

    // ...Thrusday, 12pm EST
    runDate = new Date("2022-03-10T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -05:00 winter time in New York, 1 hour before start of day
      new Date("2022-03-11T07:00:00.000-05:00").toISOString()
    );

    // ...Friday, 12pm EST
    runDate = new Date("2022-03-11T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -04:00 summer time in New York on Monday, 1 hour before start of day
      new Date("2022-03-14T07:00:00.000-04:00").toISOString()
    );

    // ...Saturday, 12pm EST
    runDate = new Date("2022-03-12T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -04:00 summer time in New York on Monday, 1 hour before start of day
      new Date("2022-03-14T07:00:00.000-04:00").toISOString()
    );

    // ...Sunday, 13pm EST
    runDate = new Date("2022-03-13T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -04:00 summer time in New York on Monday, 1 hour before start of day
      new Date("2022-03-14T07:00:00.000-04:00").toISOString()
    );

    // finally the following Monday, 13pm EST
    runDate = new Date("2022-03-14T23:00:00.000Z");
    nextDate = await getNextWorkDayStartDate(role, runDate, 1);
    expect(nextDate.toISOString()).toBe(
      // -04:00 summer time in New York on Tuesday, 1 hour before start of day
      new Date("2022-03-15T07:00:00.000-04:00").toISOString()
    );
  });
});
