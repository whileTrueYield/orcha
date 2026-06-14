/**
 * Tests for TokenList — the presentational table shared by the personal and
 * org-admin token views.
 *
 * Behaviors that matter: it surfaces the audit fields (name, prefix, read-only,
 * status), it lets a live token be revoked but never a dead one, and it only
 * names the owner when asked (the org-admin view needs it; the personal view,
 * where every token is yours, does not).
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokenList } from "../TokenList";
import { PersonalAccessToken } from "types/graphql";

const NOW = new Date("2026-06-13T00:00:00.000Z");

const makeToken = (
  overrides: Partial<PersonalAccessToken> = {}
): PersonalAccessToken =>
  ({
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
    role: { __typename: "Role", id: 1, name: "Alice" } as PersonalAccessToken["role"],
    ...overrides,
  }) as PersonalAccessToken;

const renderList = (
  tokens: PersonalAccessToken[],
  props: { onRevoke?: (id: number) => void; showOwner?: boolean } = {}
) =>
  render(
    <TokenList
      tokens={tokens}
      now={NOW}
      onRevoke={props.onRevoke ?? jest.fn()}
      showOwner={props.showOwner ?? false}
    />
  );

describe("TokenList", () => {
  it("renders name, prefix, and a read-only badge", () => {
    renderList([makeToken({ readOnly: true })]);

    expect(screen.getByText("CI bot")).toBeInTheDocument();
    expect(screen.getByText(/orcha_pat_ab/)).toBeInTheDocument();
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
  });

  it("shows the correct status for active, expired, and revoked tokens", () => {
    renderList([
      makeToken({ id: 1, name: "live" }),
      makeToken({ id: 2, name: "old", expiresAt: "2026-01-01T00:00:00.000Z" }),
      makeToken({ id: 3, name: "dead", revokedAt: "2026-05-01T00:00:00.000Z" }),
    ]);

    expect(within(screen.getByTestId("token-row-1")).getByText(/active/i)).toBeInTheDocument();
    expect(within(screen.getByTestId("token-row-2")).getByText(/expired/i)).toBeInTheDocument();
    expect(within(screen.getByTestId("token-row-3")).getByText(/revoked/i)).toBeInTheDocument();
  });

  it("revokes a live token by id", async () => {
    const user = userEvent.setup();
    const onRevoke = jest.fn();
    renderList([makeToken({ id: 42 })], { onRevoke });

    await user.click(screen.getByRole("button", { name: /revoke/i }));

    expect(onRevoke).toHaveBeenCalledWith(42);
  });

  it("offers no revoke action for an already-revoked token", () => {
    renderList([makeToken({ id: 7, revokedAt: "2026-05-01T00:00:00.000Z" })]);

    expect(screen.queryByRole("button", { name: /revoke/i })).not.toBeInTheDocument();
  });

  it("names the owner only when showOwner is set", () => {
    const { rerender } = renderList([makeToken()], { showOwner: false });
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();

    rerender(
      <TokenList
        tokens={[makeToken()]}
        now={NOW}
        onRevoke={jest.fn()}
        showOwner={true}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
