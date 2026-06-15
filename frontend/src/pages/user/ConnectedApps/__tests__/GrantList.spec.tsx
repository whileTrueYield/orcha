/**
 * Tests for GrantList — the presentational table of connected apps.
 *
 * Behaviors that matter: it names the app and the access it was granted, shows
 * "Never" until first use, and revokes by familyId. Every listed grant is live
 * (the server returns only active ones), so every row is revocable.
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GrantList } from "../GrantList";
import { OAuthGrant } from "types/graphql";

const NOW = new Date("2026-06-13T00:00:00.000Z");

const makeGrant = (overrides: Partial<OAuthGrant> = {}): OAuthGrant =>
  ({
    __typename: "OAuthGrant",
    familyId: "fam-1",
    clientId: "client-abc",
    clientName: "Claude Desktop",
    scope: "read write",
    readOnly: false,
    connectedAt: "2026-06-01T00:00:00.000Z",
    lastUsedAt: null,
    ...overrides,
  }) as OAuthGrant;

const renderList = (
  grants: OAuthGrant[],
  props: { onRevoke?: (familyId: string) => void } = {}
) =>
  render(
    <GrantList
      grants={grants}
      now={NOW}
      onRevoke={props.onRevoke ?? jest.fn()}
    />
  );

describe("GrantList", () => {
  it("renders the app name, scope, and a read-only badge", () => {
    renderList([makeGrant({ readOnly: true, scope: "read" })]);

    expect(screen.getByText("Claude Desktop")).toBeInTheDocument();
    expect(screen.getByText("read")).toBeInTheDocument();
    expect(screen.getByText(/read-only/i)).toBeInTheDocument();
  });

  it("shows 'Never' for a grant that has not been used", () => {
    renderList([makeGrant({ lastUsedAt: null })]);

    expect(screen.getByText("Never")).toBeInTheDocument();
  });

  it("falls back to a placeholder when the client has no name", () => {
    renderList([makeGrant({ clientName: null })]);

    expect(screen.getByText("Unnamed app")).toBeInTheDocument();
  });

  it("revokes a grant by familyId", async () => {
    const user = userEvent.setup();
    const onRevoke = jest.fn();
    renderList([makeGrant({ familyId: "fam-42" })], { onRevoke });

    await user.click(screen.getByRole("button", { name: /revoke/i }));

    expect(onRevoke).toHaveBeenCalledWith("fam-42");
  });

  it("renders an empty state when there are no connected apps", () => {
    renderList([]);

    expect(screen.getByText(/no connected apps yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /revoke/i })
    ).not.toBeInTheDocument();
  });

  it("renders one row per grant", () => {
    renderList([
      makeGrant({ familyId: "fam-1" }),
      makeGrant({ familyId: "fam-2" }),
    ]);

    expect(screen.getByTestId("grant-row-fam-1")).toBeInTheDocument();
    expect(screen.getByTestId("grant-row-fam-2")).toBeInTheDocument();
    within(screen.getByTestId("grant-row-fam-1")).getByText("Claude Desktop");
  });
});
