/**
 * Tests for ApiTokensView — the tabbed token page.
 *
 * The behavior that matters here is role gating: the "Organization" tab (an
 * audit/offboarding view of every token under the org) must appear only for
 * org admins, and that tab must never offer token creation — it is revoke-only.
 * Personal token creation lives behind the "New token" action on the My tab.
 */

import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("utils/GQLClient", () => ({
  onGraphQLError: () => () => {},
}));

import { ApiTokensView } from "../ApiTokensView";
import {
  MY_API_TOKENS,
  ORGANIZATION_API_TOKENS,
  REVOKE_API_TOKEN,
} from "../tokenQueries";

const tokenNode = (overrides: object = {}) => ({
  __typename: "PersonalAccessToken",
  id: 1,
  name: "CI bot",
  tokenPrefix: "orcha_pat_ab",
  readOnly: false,
  lastUsedAt: null,
  expiresAt: null,
  revokedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  roleId: 1,
  role: { __typename: "Role", id: 1, name: "Alice" },
  ...overrides,
});

const myTokensMock = {
  request: { query: MY_API_TOKENS },
  result: { data: { myApiTokens: [tokenNode({ name: "my-token" })] } },
};

const orgTokensMock = {
  request: { query: ORGANIZATION_API_TOKENS },
  result: {
    data: {
      organizationApiTokens: [
        tokenNode({ id: 2, name: "bob-token", role: { __typename: "Role", id: 2, name: "Bob" } }),
      ],
    },
  },
};

const renderView = (isAdmin: boolean) =>
  render(
    <MockedProvider mocks={[myTokensMock, orgTokensMock]}>
      <ApiTokensView isAdmin={isAdmin} />
    </MockedProvider>
  );

describe("ApiTokensView", () => {
  it("lists my tokens by default", async () => {
    renderView(false);
    expect(await screen.findByText("my-token")).toBeInTheDocument();
  });

  it("hides the Organization tab from non-admins", async () => {
    renderView(false);
    await screen.findByText("my-token");
    expect(
      screen.queryByRole("button", { name: /organization/i })
    ).not.toBeInTheDocument();
  });

  it("shows the Organization tab to admins", async () => {
    renderView(true);
    await screen.findByText("my-token");
    expect(
      screen.getByRole("button", { name: /organization/i })
    ).toBeInTheDocument();
  });

  it("opens the create modal from the My tab", async () => {
    const user = userEvent.setup();
    renderView(false);
    await screen.findByText("my-token");

    await user.click(screen.getByRole("button", { name: /new token/i }));

    expect(await screen.findByText("New API token")).toBeInTheDocument();
  });

  it("requires confirmation before revoking, then fires the mutation", async () => {
    const user = userEvent.setup();
    let revokeCalled = false;
    const revokeMock = {
      request: { query: REVOKE_API_TOKEN, variables: { id: 1 } },
      result: () => {
        revokeCalled = true;
        return {
          data: {
            revokeApiToken: tokenNode({
              revokedAt: "2026-06-13T00:00:00.000Z",
            }),
          },
        };
      },
    };
    // The mutation refetches the list on success, so it needs a second response.
    const myTokensAfter = {
      request: { query: MY_API_TOKENS },
      result: {
        data: {
          myApiTokens: [
            tokenNode({ name: "my-token", revokedAt: "2026-06-13T00:00:00.000Z" }),
          ],
        },
      },
    };

    render(
      <MockedProvider mocks={[myTokensMock, revokeMock, myTokensAfter]}>
        <ApiTokensView isAdmin={false} />
      </MockedProvider>
    );
    await screen.findByText("my-token");

    await user.click(screen.getByRole("button", { name: /revoke/i }));

    // A confirmation must appear, and nothing is revoked until it is accepted.
    expect(await screen.findByText(/cannot be undone/i)).toBeInTheDocument();
    expect(revokeCalled).toBe(false);

    await user.click(screen.getByRole("button", { name: /revoke token/i }));

    await waitFor(() => expect(revokeCalled).toBe(true));
  });

  it("switches to the org view, naming owners and offering no creation", async () => {
    const user = userEvent.setup();
    renderView(true);
    await screen.findByText("my-token");

    await user.click(screen.getByRole("button", { name: /organization/i }));

    expect(await screen.findByText("bob-token")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /new token/i })
    ).not.toBeInTheDocument();
  });
});
