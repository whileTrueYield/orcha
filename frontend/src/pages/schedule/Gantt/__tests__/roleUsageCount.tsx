import { GanttProject, GanttState } from "../types";
import { roleUsageCount } from "../roleUsageCount";

const getProjects = (id: number, states: GanttState[]): GanttProject => ({
  id,
  name: "foo",
  startDate: new Date("2023-10-03T00:00:00.000"),
  stopDate: new Date("2023-10-16T00:00:00.000"),
  states,
  childrenStates: [],
  children: [],
  childrenMilestones: [],
  milestones: [],
  level: 0,
});

describe("roleUsageCount", () => {
  it("detects overlapping tasks with the same assignees", () => {
    const project = getProjects(1, [
      {
        startDate: new Date("2023-10-03T00:00:00.000"),
        stopDate: new Date("2023-10-06T00:00:00.000"),
        roleId: 1,
      },
      {
        startDate: new Date("2023-10-04T00:00:00.000"),
        stopDate: new Date("2023-10-07T00:00:00.000"),
        roleId: 1,
      },
    ]);

    const usage = roleUsageCount([project]);

    expect(usage["2023-10-03"]["1"].value).toBe(1);
    expect(usage["2023-10-04"]["1"].value).toBe(2);
    expect(usage["2023-10-05"]["1"].value).toBe(2);
    expect(usage["2023-10-06"]["1"].value).toBe(1);
  });

  it("ignores overlapping tasks with the different assignees", () => {
    const project = getProjects(1, [
      {
        startDate: new Date("2023-10-03T00:00:00.000"),
        stopDate: new Date("2023-10-06T00:00:00.000"),
        roleId: 1,
      },
      {
        startDate: new Date("2023-10-04T00:00:00.000"),
        stopDate: new Date("2023-10-07T00:00:00.000"),
        roleId: 2,
      },
    ]);

    const usage = roleUsageCount([project]);
    expect(usage["2023-10-03"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-04"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
      "2": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-05"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
      "2": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-06"]).toEqual({
      "2": { value: 1, byProjectId: { "1": 1 } },
    });
  });

  it("distinguish non-overlapping tasks with the same assignees", () => {
    const project = getProjects(1, [
      {
        startDate: new Date("2023-10-03T00:00:00.000"),
        stopDate: new Date("2023-10-05T12:00:00.000"),
        roleId: 1,
      },
      {
        startDate: new Date("2023-10-05T12:00:00.000"),
        stopDate: new Date("2023-10-07T00:00:00.000"),
        roleId: 1,
      },
    ]);

    const usage = roleUsageCount([project]);
    expect(usage["2023-10-03"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-04"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-05"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-06"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
  });

  it("aggregate multiple projects", () => {
    const projectA = getProjects(1, [
      {
        startDate: new Date("2023-10-03T00:00:00.000"),
        stopDate: new Date("2023-10-05T12:00:00.000"),
        roleId: 1,
      },
    ]);

    const projectB = getProjects(2, [
      {
        startDate: new Date("2023-10-05T12:00:00.000"),
        stopDate: new Date("2023-10-07T00:00:00.000"),
        roleId: 1,
      },
    ]);

    const usage = roleUsageCount([projectA, projectB]);

    expect(usage["2023-10-03"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-04"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-05"]).toEqual({
      "1": { value: 1, byProjectId: { "1": 0.5, "2": 0.5 } },
    });
    expect(usage["2023-10-06"]).toEqual({
      "1": { value: 1, byProjectId: { "2": 1 } },
    });
  });

  it("aggregate sub projects", () => {
    const projectA = getProjects(1, [
      {
        startDate: new Date("2023-10-03T00:00:00.000"),
        stopDate: new Date("2023-10-05T12:00:00.000"),
        roleId: 5,
      },
    ]);

    const projectB = getProjects(2, [
      {
        startDate: new Date("2023-10-05T12:00:00.000"),
        stopDate: new Date("2023-10-07T00:00:00.000"),
        roleId: 5,
      },
    ]);

    projectA.children = [projectB];

    const usage = roleUsageCount([projectA]);

    expect(usage["2023-10-03"]).toEqual({
      "5": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-04"]).toEqual({
      "5": { value: 1, byProjectId: { "1": 1 } },
    });
    expect(usage["2023-10-05"]).toEqual({
      "5": { value: 1, byProjectId: { "1": 0.5, "2": 0.5 } },
    });
    expect(usage["2023-10-06"]).toEqual({
      "5": { value: 1, byProjectId: { "2": 1 } },
    });
  });
});
