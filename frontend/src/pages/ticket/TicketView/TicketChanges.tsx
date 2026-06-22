/**
 * TicketChanges — the read-only "Changes" tab of the Ticket view.
 *
 * Lists the pull requests GitHub has mirrored onto this ticket (#121/#122):
 * a state badge (open / draft / merged / closed), the PR title and #number,
 * the author's GitHub login, and a link out to the PR on GitHub. This surface
 * never writes back to GitHub — the mirror is inbound-only (ADR 0011).
 *
 * Props:
 *  - pullRequests: the ticket's linked PRs, already fetched and ordered by the
 *    parent (newest GitHub activity first).
 *
 * The fragment static is what TicketView spreads into its query so the array
 * arrives shaped exactly as this component reads it.
 */

import { gql } from "@apollo/client";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import { formatDistance } from "date-fns";
import cn from "classnames";
import { LinkedPullRequest, PullRequestState } from "types/graphql";
import { FCWithFragments } from "types";

interface Props {
  pullRequests: LinkedPullRequest[];
}

// A draft PR is structurally OPEN + isDraft; we surface "Draft" instead of
// "Open" because that distinction is the whole point of the badge. Merged and
// closed PRs are never drafts, so isDraft takes precedence only over OPEN.
const describeState = (
  pr: Pick<LinkedPullRequest, "state" | "isDraft">
): { label: string; badgeClassName: string } => {
  if (pr.isDraft && pr.state === PullRequestState.Open) {
    return { label: "Draft", badgeClassName: "bg-gray-200 text-gray-700" };
  }
  switch (pr.state) {
    case PullRequestState.Merged:
      return { label: "Merged", badgeClassName: "bg-purple-100 text-purple-800" };
    case PullRequestState.Closed:
      return { label: "Closed", badgeClassName: "bg-red-100 text-red-800" };
    default:
      return { label: "Open", badgeClassName: "bg-green-100 text-green-800" };
  }
};

export const TicketChanges: FCWithFragments<Props> = ({ pullRequests }) => {
  if (!pullRequests.length) {
    return (
      <div className="p-6 text-center">
        <div className="text-base font-medium text-gray-500">
          No linked pull requests
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Pull requests that reference this ticket will appear here once GitHub
          mirrors them.
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3 px-4 sm:px-0">
      {pullRequests.map((pr) => {
        const { label, badgeClassName } = describeState(pr);

        return (
          <li key={pr.id} data-testid={`linked-pr-${pr.id}`}>
            <a
              href={pr.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-x-3 rounded-lg border bg-white px-4 py-3 shadow-sm transition hover:border-gray-300 hover:shadow"
            >
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  badgeClassName
                )}
              >
                {label}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900 group-hover:text-brand-700">
                  {pr.title}
                </div>
                <div className="mt-0.5 flex items-center gap-x-2 text-xs text-gray-500">
                  <span className="font-mono">#{pr.number}</span>
                  <span aria-hidden>·</span>
                  <span>{pr.authorLogin ?? "unknown author"}</span>
                  <span aria-hidden>·</span>
                  <span>
                    updated{" "}
                    {formatDistance(new Date(pr.githubUpdatedAt), new Date(), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              <ExternalLinkIcon className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-gray-600" />
            </a>
          </li>
        );
      })}
    </ul>
  );
};

TicketChanges.fragments = {
  TicketChangesFragment: gql`
    fragment TicketChangesFragment on Ticket {
      id
      linkedPullRequests {
        id
        number
        title
        state
        isDraft
        authorLogin
        htmlUrl
        githubUpdatedAt
      }
    }
  `,
};
