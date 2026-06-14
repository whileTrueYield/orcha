// Global test setup, wired via package.json's jest.setupFilesAfterEnv.
//
// - jest-dom: adds DOM matchers (toBeInTheDocument, etc.) to every suite.
// - ResizeObserver: jsdom does not implement it, but Headless UI (used by our
//   Modal/Dialog) references it on mount. A no-op stub is enough for behavior
//   tests, which never assert on layout.

import "@testing-library/jest-dom";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
