// Normalizes a raw GitHub `pull_request` webhook payload into the shape the PR
// mirror stores. Kept pure and separate from persistence so the mapping is unit
// testable without a DB. See ADR 0011.
//
// `state` mirrors the Prisma `PullRequestState` enum (OPEN | MERGED | CLOSED) —
// the values are kept identical so a parsed state is assignable straight into a
// Prisma write. GitHub itself only has open/closed plus a `merged` flag; we
// promote a merged-and-closed PR to MERGED because that is the distinction a
// reviewer cares about.
//
// Required fields (number, title, head.ref, html_url, updated_at) are always
// present on a real `pull_request` delivery, so their absence means a malformed
// payload — we crash clearly rather than store a half-formed row.

export type PullRequestState = "OPEN" | "MERGED" | "CLOSED";

export interface ParsedPullRequest {
  repoFullName: string;
  number: number;
  title: string;
  headRef: string;
  state: PullRequestState;
  isDraft: boolean;
  authorLogin: string | null;
  htmlUrl: string;
  githubUpdatedAt: Date;
}

export function parsePullRequestPayload(payload: unknown): ParsedPullRequest {
  const root = payload as Record<string, any>;
  const pr = root?.pull_request;

  if (!pr || typeof pr !== "object") {
    throw new Error(
      "GitHub pull_request payload is missing its `pull_request` object",
    );
  }

  const repoFullName = root?.repository?.full_name;
  if (typeof repoFullName !== "string" || repoFullName.length === 0) {
    throw new Error("GitHub pull_request payload is missing repository.full_name");
  }

  const number = pr.number;
  if (typeof number !== "number") {
    throw new Error("GitHub pull_request payload is missing pull_request.number");
  }

  const headRef = pr.head?.ref;
  if (typeof headRef !== "string") {
    throw new Error("GitHub pull_request payload is missing pull_request.head.ref");
  }

  const htmlUrl = pr.html_url;
  if (typeof htmlUrl !== "string") {
    throw new Error("GitHub pull_request payload is missing pull_request.html_url");
  }

  const updatedAt = pr.updated_at;
  if (typeof updatedAt !== "string") {
    throw new Error("GitHub pull_request payload is missing pull_request.updated_at");
  }

  const state: PullRequestState =
    pr.merged === true ? "MERGED" : pr.state === "closed" ? "CLOSED" : "OPEN";

  return {
    repoFullName,
    number,
    title: typeof pr.title === "string" ? pr.title : "",
    headRef,
    state,
    isDraft: pr.draft === true,
    authorLogin: typeof pr.user?.login === "string" ? pr.user.login : null,
    htmlUrl,
    githubUpdatedAt: new Date(updatedAt),
  };
}
