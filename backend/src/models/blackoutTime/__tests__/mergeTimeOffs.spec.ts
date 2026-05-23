import { mergeTimeOffs } from "../entity";
import expect from "expect";
import "mocha";

describe("mergeTimeOffs", () => {
  it("should merge time offs", () => {
    expect(
      mergeTimeOffs([
        [1, 10],
        [5, 15],
        [20, 30],
        [2, 6],
      ])
    ).toEqual([
      [1, 15],
      [20, 30],
    ]);
  });

  it("should not merge time offs if no overlaps", () => {
    expect(
      mergeTimeOffs([
        [7, 10],
        [15, 19],
        [20, 30],
        [2, 6],
      ])
    ).toEqual([
      [2, 6],
      [7, 10],
      [15, 19],
      [20, 30],
    ]);
  });

  it("should merge touching time off", () => {
    expect(
      mergeTimeOffs([
        [7, 10],
        [10, 19],
        [25, 30],
        [19, 22],
      ])
    ).toEqual([
      [7, 22],
      [25, 30],
    ]);
  });
});
