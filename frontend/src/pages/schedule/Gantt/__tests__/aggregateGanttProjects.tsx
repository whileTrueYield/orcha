import { getProjectAncestry } from "../aggregateGanttProjects";

describe("getProjectAncestry", () => {
  it("return ancestry of a set projects", () => {
    const projects = [
      {
        id: 1,
        parentId: null,
      },
      {
        id: 2,
        parentId: 1,
      },
      {
        id: 3,
        parentId: null,
      },
      {
        id: 4,
        parentId: 3,
      },
      {
        id: 5,
        parentId: 2,
      },
    ];

    expect(getProjectAncestry(projects as any)).toEqual({
      "1": [],
      "2": [1],
      "3": [],
      "4": [3],
      "5": [2, 1],
    });
  });
});
