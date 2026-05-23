import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders learn react link", () => {
  window.postMessage = jest.fn((x) => 42 + x);

  render(<App />);
  const linkElement = screen.getByText(/Contact Support/);
  expect(linkElement).toBeInTheDocument();
  expect(window.postMessage).toBeCalled();
});
