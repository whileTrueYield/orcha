import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useState } from "react";
import { EditorErrorBoundary } from "../EditorErrorBoundary";

// React logs caught errors to console.error; silence it for these tests.
let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => consoleSpy.mockRestore());

function Boom(): JSX.Element {
  throw new Error("crepe exploded");
}

it("shows the error message instead of blanking when a child throws", () => {
  render(
    <EditorErrorBoundary>
      <Boom />
    </EditorErrorBoundary>,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("editor failed to load");
  expect(screen.getByText("crepe exploded")).toBeInTheDocument();
});

it("retries: clears the error so a now-healthy child renders", () => {
  // A child that throws once, then renders after a parent re-render flips it.
  function Flaky({ throwIt }: { throwIt: boolean }) {
    if (throwIt) throw new Error("boom");
    return <div>editor ok</div>;
  }
  function Harness() {
    const [throwIt, setThrowIt] = useState(true);
    return (
      <>
        <button onClick={() => setThrowIt(false)}>fix</button>
        <EditorErrorBoundary>
          <Flaky throwIt={throwIt} />
        </EditorErrorBoundary>
      </>
    );
  }

  render(<Harness />);
  expect(screen.getByRole("alert")).toBeInTheDocument();

  // Make the child healthy, then Retry the boundary.
  fireEvent.click(screen.getByText("fix"));
  fireEvent.click(screen.getByText("Retry"));

  expect(screen.getByText("editor ok")).toBeInTheDocument();
});

it("clears a caught error when resetKey changes", () => {
  function Harness() {
    const [key, setKey] = useState(1);
    return (
      <>
        <button onClick={() => setKey(2)}>next</button>
        <EditorErrorBoundary resetKey={key}>
          {key === 1 ? <Boom /> : <div>second ticket</div>}
        </EditorErrorBoundary>
      </>
    );
  }

  render(<Harness />);
  expect(screen.getByRole("alert")).toBeInTheDocument();

  fireEvent.click(screen.getByText("next"));
  expect(screen.getByText("second ticket")).toBeInTheDocument();
});
