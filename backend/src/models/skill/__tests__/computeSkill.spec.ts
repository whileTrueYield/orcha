import { computeSkill } from "../computeSkill";
import { SkillRequirementConfig, WorkUnit } from "../types";
import expect from "expect";

const ONE_HOUR = 3600 * 1000;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

describe("computeSkill", () => {
  it("do not break without data", () => {
    const level = computeSkill([], []);
    expect(level).toBe(0);
  });

  it("assign basic level", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 1,
        period: ONE_WEEK,
        occurences: 1,
        difficulty: 1,
        points: 20,
      },
    ];

    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(1);
  });

  it("do not grant level if session count is below threshold", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 2,
        period: ONE_WEEK,
        occurences: 4,
        difficulty: 1,
        points: 20,
      },
    ];

    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-04T00:00:00.000Z",
        stopDate: "2021-01-04T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-06T00:00:00.000Z",
        stopDate: "2021-01-06T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(0);
  });

  it("grant level if session count is beyond threshold", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 2,
        period: ONE_WEEK,
        occurences: 3,
        difficulty: 1,
        points: 20,
      },
    ];

    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-10T00:00:00.000Z",
        stopDate: "2021-01-10T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-20T00:00:00.000Z",
        stopDate: "2021-01-20T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(2);
  });

  it("do not grant level if period is not respected", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 2,
        period: ONE_WEEK,
        occurences: 2,
        difficulty: 1,
        points: 20,
      },
    ];

    // learning happened 3 days appart
    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-03T00:00:00.000Z",
        stopDate: "2021-01-03T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-06T00:00:00.000Z",
        stopDate: "2021-01-06T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(0);
  });

  it("grant level if period is respected", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 2,
        period: ONE_WEEK,
        occurences: 2,
        difficulty: 1,
        points: 20,
      },
    ];

    // learning happened 8 days appart
    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-08T00:00:00.000Z",
        stopDate: "2021-01-08T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(2);
  });

  it("grant the highest possible level", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 1,
        period: ONE_WEEK,
        occurences: 2,
        difficulty: 1,
        points: 20,
      },
      {
        level: 2,
        period: ONE_WEEK,
        occurences: 2,
        difficulty: 1,
        points: 20,
      },
    ];

    // learning happened 8 days appart
    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-08T00:00:00.000Z",
        stopDate: "2021-01-08T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(2);
  });

  it("do not grant level from tight cluster", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 5,
        period: 4 * ONE_WEEK,
        occurences: 5,
        difficulty: 1,
        points: 20,
      },
    ];

    // the first 3 happen 2 days appart, too close to be accounted
    // as properly spaced out
    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-03T00:00:00.000Z",
        stopDate: "2021-01-03T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-05T00:00:00.000Z",
        stopDate: "2021-01-05T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-15T00:00:00.000Z",
        stopDate: "2021-01-16T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-30T00:00:00.000Z",
        stopDate: "2021-01-30T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);
    expect(level).toBe(0);
  });

  it("grant level on closely tight sessions", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 5,
        period: 2 * ONE_WEEK,
        occurences: 5,
        difficulty: 1,
        points: 20,
      },
    ];

    // the first 3 happen 2 days appart, too close to be accounted
    // as properly spaced out
    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-03T00:00:00.000Z",
        stopDate: "2021-01-03T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-06T00:00:00.000Z",
        stopDate: "2021-01-06T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-07T00:00:00.000Z",
        stopDate: "2021-01-07T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-09T00:00:00.000Z",
        stopDate: "2021-01-09T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-10T00:00:00.000Z",
        stopDate: "2021-01-10T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-13T00:00:00.000Z",
        stopDate: "2021-01-13T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-16T00:00:00.000Z",
        stopDate: "2021-01-16T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-19T00:00:00.000Z",
        stopDate: "2021-01-19T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);
    expect(level).toBe(5);
  });

  it("grant level when sessions are evenly spread", () => {
    const skillTable: SkillRequirementConfig[] = [
      {
        level: 5,
        period: 4 * ONE_WEEK,
        occurences: 5,
        difficulty: 1,
        points: 20,
      },
    ];

    // learning happened 3 days appart
    const workUnits: WorkUnit[] = [
      {
        startDate: "2021-01-01T00:00:00.000Z",
        stopDate: "2021-01-01T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-03T00:00:00.000Z",
        stopDate: "2021-01-03T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-10T00:00:00.000Z",
        stopDate: "2021-01-10T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-21T00:00:00.000Z",
        stopDate: "2021-01-21T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-01-30T00:00:00.000Z",
        stopDate: "2021-01-30T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
      {
        startDate: "2021-02-10T00:00:00.000Z",
        stopDate: "2021-02-10T01:00:00.000Z",
        timeSpent: 20 * ONE_HOUR,
        difficulty: 1,
      },
    ];

    const level = computeSkill(workUnits, skillTable);

    expect(level).toBe(5);
  });
});
