/**
 * Tests for ConflictResolver — the side-by-side picker shown on a 409. Covers
 * pure reassembly (stable lines + chosen side per conflict) and the UI gate
 * (Resolve & Save stays disabled until every clash has a choice).
 */
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ConflictResolver, {
  reassembleBody,
  serverVersion,
} from "../ConflictResolver";
import { ConflictRegion, ConflictRegionKind } from "types/graphql";

// react-diff-viewer-continued drives a web worker + ResizeObserver + layout
// measurement jsdom can't run (the same untestable boundary as Crepe). Mock it
// to a flat element exposing the titles and both sides as text.
jest.mock("react-diff-viewer-continued", () => {
  const React = require("react");
  return {
    __esModule: true,
    DiffMethod: { WORDS: "diffWords" },
    default: ({ oldValue, newValue, leftTitle, rightTitle }: any) =>
      React.createElement("div", { "data-testid": "diff" }, [
        React.createElement("span", { key: "lt" }, leftTitle),
        React.createElement("span", { key: "rt" }, rightTitle),
        React.createElement("span", { key: "ov" }, oldValue),
        React.createElement("span", { key: "nv" }, newValue),
      ]),
  };
});

const region = (over: Partial<ConflictRegion>): ConflictRegion => ({
  __typename: "ConflictRegion",
  kind: ConflictRegionKind.Stable,
  lines: [],
  ours: [],
  theirs: [],
  ...over,
});

const REGIONS: ConflictRegion[] = [
  region({ kind: ConflictRegionKind.Conflict, ours: ["mine"], theirs: ["theirs"] }),
  region({ kind: ConflictRegionKind.Stable, lines: ["shared", ""] }),
];

describe("reassembleBody", () => {
  it("keeps the chosen side per conflict and all stable lines", () => {
    expect(reassembleBody(REGIONS, { 0: "ours" })).toBe("mine\nshared\n");
    expect(reassembleBody(REGIONS, { 0: "theirs" })).toBe("theirs\nshared\n");
    expect(reassembleBody(REGIONS, { 0: "both" })).toBe("mine\ntheirs\nshared\n");
  });
});

describe("serverVersion", () => {
  it("reproduces the current server body by taking theirs everywhere", () => {
    expect(serverVersion(REGIONS)).toBe("theirs\nshared\n");
  });
});

describe("ConflictResolver", () => {
  it("disables Resolve & Save until every conflict is chosen, then emits markdown", () => {
    const onResolve = jest.fn();
    render(
      <ConflictResolver
        regions={REGIONS}
        saving={false}
        onResolve={onResolve}
        onCancel={() => {}}
      />,
    );

    const resolve = screen.getByText("Resolve & Save");
    expect(resolve).toBeDisabled();

    fireEvent.click(screen.getByText("Keep yours"));
    expect(resolve).toBeEnabled();

    fireEvent.click(resolve);
    expect(onResolve).toHaveBeenCalledWith("mine\nshared\n");
  });

  it("calls onCancel when Discard my changes is clicked", () => {
    const onCancel = jest.fn();
    render(
      <ConflictResolver
        regions={REGIONS}
        saving={false}
        onResolve={() => {}}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByText("Discard my changes"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
