import { sortProjectsByAncestry } from "../sortProjectGoals";

describe("sortedGoals", () => {
  it("should return empty array when no goals provided", () => {
    expect(sortProjectsByAncestry()).toEqual([]);
  });

  it("returns the parent before the children", () => {
    const goals = [
      { id: 2, parentId: 1 },
      { id: 1, parentId: null },
    ];

    expect(sortProjectsByAncestry(goals)).toEqual([
      { id: 1, parentId: null },
      { id: 2, parentId: 1 },
    ]);
  });

  it("returns the parents before the children", () => {
    const goals = [
      { id: 4, parentId: 1 },
      { id: 2, parentId: 1 },
      { id: 1, parentId: null },
      { id: 3, parentId: null },
    ];

    expect(sortProjectsByAncestry(goals)).toEqual([
      { id: 1, parentId: null },
      { id: 2, parentId: 1 },
      { id: 4, parentId: 1 },
      { id: 3, parentId: null },
    ]);
  });

  it("handles when parent ID points to nowhere", () => {
    const goals = [
      { id: 2, parentId: 1 },
      { id: 1, parentId: 5 },
    ];

    expect(sortProjectsByAncestry(goals)).toEqual([
      { id: 1, parentId: 5 },
      { id: 2, parentId: 1 },
    ]);
  });

  it("does not do infinite loops", () => {
    const goals = [
      {
        id: 3,
        parentId: 1,
      },
      {
        id: 2,
        parentId: 1,
      },
      {
        id: 4,
        parentId: 3,
      },
      {
        id: 1,
        parentId: null,
      },
    ];

    expect(sortProjectsByAncestry(goals)).toEqual([
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
        parentId: 1,
      },
      {
        id: 4,
        parentId: 3,
      },
    ]);
  });
});
