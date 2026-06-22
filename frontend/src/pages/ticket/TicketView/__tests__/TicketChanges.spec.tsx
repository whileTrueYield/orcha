/**
 * Tests for TicketChanges — the read-only "Changes" tab listing a ticket's
 * linked GitHub pull requests (#122).
 *
 * Behaviors that matter: it names each PR by title and #number, attributes it
 * to a GitHub author, links out to the PR on GitHub, draws a visually distinct
 * badge per state (open / draft / merged / closed), and shows an empty state
 * when nothing is linked. Nothing here writes back to GitHub.
 */

import { render, screen, within } from "@testing-library/react";
import { TicketChanges } from "../TicketChanges";
import { LinkedPullRequest, PullRequestState } from "types/graphql";

const makePr = (overrides: Partial<LinkedPullRequest> = {}): LinkedPullRequest =>
  ({
    __typename: "LinkedPullRequest",
    id: 1,
    repoFullName: "octo/repo",
    number: 42,
    title: "Wire up the thing",
    state: PullRequestState.Open,
    isDraft: false,
    authorLogin: "octocat",
    htmlUrl: "https://github.com/octo/repo/pull/42",
    githubUpdatedAt: "2026-06-20T00:00:00.000Z",
    createdAt: "2026-06-20T00:00:00.000Z",
    updatedAt: "2026-06-20T00:00:00.000Z",
    ...overrides,
  }) as LinkedPullRequest;

describe("TicketChanges", () => {
  it("renders a PR's title, #number, and author login", () => {
    render(
      <TicketChanges
        pullRequests={[
          makePr({ number: 7, title: "Fix the bug", authorLogin: "hubot" }),
        ]}
      />
    );

    expect(screen.getByText("Fix the bug")).toBeInTheDocument();
    expect(screen.getByText("#7")).toBeInTheDocument();
    expect(screen.getByText("hubot")).toBeInTheDocument();
  });

  it("links out to the PR on GitHub in a new tab", () => {
    render(
      <TicketChanges
        pullRequests={[
          makePr({ htmlUrl: "https://github.com/octo/repo/pull/99" }),
        ]}
      />
    );

    const link = screen.getByRole("link", { name: /Wire up the thing/i });
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/octo/repo/pull/99"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows an Open badge for an open PR", () => {
    render(<TicketChanges pullRequests={[makePr({ state: PullRequestState.Open })]} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows a Draft badge for a draft PR, not its underlying open state", () => {
    render(
      <TicketChanges
        pullRequests={[makePr({ state: PullRequestState.Open, isDraft: true })]}
      />
    );
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.queryByText("Open")).not.toBeInTheDocument();
  });

  it("shows a Merged badge for a merged PR", () => {
    render(
      <TicketChanges pullRequests={[makePr({ state: PullRequestState.Merged })]} />
    );
    expect(screen.getByText("Merged")).toBeInTheDocument();
  });

  it("shows a Closed badge for a closed PR", () => {
    render(
      <TicketChanges pullRequests={[makePr({ state: PullRequestState.Closed })]} />
    );
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("falls back to a placeholder when the PR has no author login", () => {
    render(<TicketChanges pullRequests={[makePr({ authorLogin: null })]} />);
    expect(screen.getByText(/unknown author/i)).toBeInTheDocument();
  });

  it("renders an empty state when the ticket has no linked PRs", () => {
    render(<TicketChanges pullRequests={[]} />);

    expect(screen.getByText(/no linked pull requests/i)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders one row per linked PR", () => {
    render(
      <TicketChanges
        pullRequests={[
          makePr({ id: 1, number: 1 }),
          makePr({ id: 2, number: 2 }),
        ]}
      />
    );

    expect(screen.getByTestId("linked-pr-1")).toBeInTheDocument();
    expect(screen.getByTestId("linked-pr-2")).toBeInTheDocument();
    within(screen.getByTestId("linked-pr-1")).getByText("#1");
  });
});
