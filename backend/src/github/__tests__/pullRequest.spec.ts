/**
 * Unit tests for parsePullRequestPayload — turning a raw GitHub `pull_request`
 * webhook payload into the normalized shape the mirror stores. Pure; no DB.
 */

import expect from "expect";
import { parsePullRequestPayload } from "../pullRequest";

// A minimal but realistic `pull_request` payload. Tests override the parts they
// exercise via `overrides` on the nested pull_request object.
function buildPayload(pr: Record<string, unknown> = {}): unknown {
  return {
    action: "opened",
    number: 42,
    repository: { full_name: "octo/widgets" },
    pull_request: {
      number: 42,
      state: "open",
      title: "Fix the login crash (WEB-7)",
      draft: false,
      merged: false,
      html_url: "https://github.com/octo/widgets/pull/42",
      updated_at: "2026-06-21T10:00:00Z",
      head: { ref: "feature/WEB-7-login" },
      user: { login: "octocat" },
      ...pr,
    },
  };
}

describe("parsePullRequestPayload", () => {
  it("normalizes an opened pull request", () => {
    expect(parsePullRequestPayload(buildPayload())).toEqual({
      repoFullName: "octo/widgets",
      number: 42,
      title: "Fix the login crash (WEB-7)",
      headRef: "feature/WEB-7-login",
      state: "OPEN",
      isDraft: false,
      authorLogin: "octocat",
      htmlUrl: "https://github.com/octo/widgets/pull/42",
      githubUpdatedAt: new Date("2026-06-21T10:00:00Z"),
    });
  });

  it("maps a merged pull request to MERGED (merged wins over closed state)", () => {
    const parsed = parsePullRequestPayload(
      buildPayload({ state: "closed", merged: true }),
    );
    expect(parsed.state).toBe("MERGED");
  });

  it("maps a closed-but-not-merged pull request to CLOSED", () => {
    const parsed = parsePullRequestPayload(
      buildPayload({ state: "closed", merged: false }),
    );
    expect(parsed.state).toBe("CLOSED");
  });

  it("reads the draft flag", () => {
    const parsed = parsePullRequestPayload(buildPayload({ draft: true }));
    expect(parsed.isDraft).toBe(true);
  });

  it("tolerates a missing author (ghost user) as a null login", () => {
    const parsed = parsePullRequestPayload(buildPayload({ user: null }));
    expect(parsed.authorLogin).toBeNull();
  });

  it("crashes clearly on a payload with no pull_request", () => {
    expect(() => parsePullRequestPayload({ action: "opened" })).toThrow(
      /pull_request/,
    );
  });
});
