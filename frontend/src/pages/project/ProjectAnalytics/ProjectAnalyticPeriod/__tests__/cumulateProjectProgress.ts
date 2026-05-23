import { cumulateProjectProgress } from "../cumulateProjectProgress";

const goals = [
  {
    id: 1,
    name: "parent",
    parentId: null,
    progress: 2,
    accomplished: 0,
    total: 10,
    eta: "2023-09-12T00:00:00.000Z",
  },
  {
    id: 2,
    name: "child",
    parentId: 1,
    progress: 10,
    accomplished: 20,
    total: 50,
    eta: "2023-09-21T00:00:00.000Z",
  },
  {
    id: 3,
    name: "grand-child",
    parentId: 2,
    progress: 5,
    accomplished: 10,
    total: 30,
    eta: "2023-09-17T00:00:00.000Z",
  },
  {
    id: 4,
    name: "grand-child",
    parentId: 2,
    progress: 15,
    accomplished: 5,
    total: 20,
    eta: "2023-09-16T00:00:00.000Z",
  },
  {
    id: 5,
    name: "parent",
    parentId: null,
    progress: 2,
    accomplished: 10,
    total: 22,
    eta: "2023-09-30T00:00:00.000Z",
  },
];

describe("cumulateProjectProgress", () => {
  it("accumulate goals from children", () => {
    expect(cumulateProjectProgress(goals)).toEqual([
      {
        id: 1,
        name: "parent",
        parentId: null,
        progress: 32,
        accomplished: 35,
        total: 110,
        eta: "2023-09-21T00:00:00.000Z",
      },
      {
        id: 2,
        name: "child",
        parentId: 1,
        progress: 30,
        accomplished: 35,
        total: 100,
        eta: "2023-09-21T00:00:00.000Z",
      },
      {
        id: 3,
        name: "grand-child",
        parentId: 2,
        progress: 5,
        accomplished: 10,
        total: 30,
        eta: "2023-09-17T00:00:00.000Z",
      },
      {
        id: 4,
        name: "grand-child",
        parentId: 2,
        progress: 15,
        accomplished: 5,
        total: 20,
        eta: "2023-09-16T00:00:00.000Z",
      },
      {
        id: 5,
        name: "parent",
        parentId: null,
        progress: 2,
        accomplished: 10,
        total: 22,
        eta: "2023-09-30T00:00:00.000Z",
      },
    ]);
  });
});
