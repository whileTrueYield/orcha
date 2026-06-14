/**
 * Tabbed Personal Access Token page (presentational container).
 *
 * Takes `isAdmin` rather than reading redux directly, so it can be tested
 * without a store; the thin ApiTokens wrapper supplies it. Owns the tab state,
 * the two list queries, the create modal, and revocation.
 *
 *  - "My tokens" tab: the caller's own tokens (myApiTokens), with create/revoke.
 *  - "Organization" tab (admins only): every token under the org
 *    (organizationApiTokens), revoke-only, with the owner named. Its query is
 *    skipped until the tab is opened so non-admins never trigger it.
 *
 * Assumes an Apollo client is in context.
 */

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { KeyIcon } from "@heroicons/react/outline";
import { Button } from "components/fields/Button";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { PersonalAccessToken } from "types/graphql";
import { TokenList } from "./TokenList";
import { TokenCreateModal } from "./TokenCreateModal";
import {
  MY_API_TOKENS,
  ORGANIZATION_API_TOKENS,
  REVOKE_API_TOKEN,
} from "./tokenQueries";

type Tab = "mine" | "org";

interface Props {
  isAdmin: boolean;
}

export const ApiTokensView: React.FC<Props> = ({ isAdmin }) => {
  const [tab, setTab] = useState<Tab>("mine");
  const [creating, setCreating] = useState(false);
  // The token awaiting a revoke confirmation; revoking a credential is
  // irreversible and instantly cuts off any agent using it, so it is gated.
  const [pendingRevoke, setPendingRevoke] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const mine = useQuery<{ myApiTokens: PersonalAccessToken[] }>(MY_API_TOKENS);
  const org = useQuery<{ organizationApiTokens: PersonalAccessToken[] }>(
    ORGANIZATION_API_TOKENS,
    // Only admins viewing the org tab should ever hit this query.
    { skip: !isAdmin || tab !== "org" }
  );

  const [revoke] = useBlockingMutation(REVOKE_API_TOKEN, {
    onError: onGraphQLError({ title: "Could not revoke token" }),
    onCompleted: () => {
      mine.refetch();
      if (isAdmin) org.refetch();
    },
  });

  const showingOrg = tab === "org";
  const tokens = showingOrg
    ? org.data?.organizationApiTokens ?? []
    : mine.data?.myApiTokens ?? [];

  // Open the confirmation; the actual mutation fires only once accepted.
  const requestRevoke = (id: number) => {
    const token = tokens.find((t) => t.id === id);
    setPendingRevoke({ id, name: token?.name ?? "this token" });
  };

  const confirmRevoke = () => {
    if (pendingRevoke) revoke({ variables: { id: pendingRevoke.id } });
  };

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="px-4 sm:px-0">
        <h1 className="flex items-center text-2xl font-semibold text-gray-900">
          <KeyIcon className="mr-2 h-6 w-6 text-brand-600" />
          API Tokens
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Personal Access Tokens let agents and scripts act as you through the
          Orcha REST API. Use{" "}
          <code className="rounded bg-gray-100 px-1">
            Authorization: Bearer &lt;token&gt;
          </code>
          .
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-4">
          <nav className="flex space-x-6">
            <TabButton active={!showingOrg} onClick={() => setTab("mine")}>
              My tokens
            </TabButton>
            {isAdmin && (
              <TabButton active={showingOrg} onClick={() => setTab("org")}>
                Organization
              </TabButton>
            )}
          </nav>
          {/* Creation is personal-only; the org tab is a revoke-only audit view. */}
          {!showingOrg && (
            <Button
              type="button"
              btnType="primary"
              onClick={() => setCreating(true)}
            >
              New token
            </Button>
          )}
        </div>

        <TokenList
          tokens={tokens}
          onRevoke={requestRevoke}
          showOwner={showingOrg}
        />
      </div>

      <TokenCreateModal
        visible={creating}
        onClose={() => setCreating(false)}
        onCreated={() => mine.refetch()}
      />

      <WarningConfirm
        visible={pendingRevoke !== null}
        onClose={() => setPendingRevoke(null)}
        onConfirm={confirmRevoke}
        title={`Revoke "${pendingRevoke?.name ?? ""}"?`}
        description="This token will stop working immediately and cannot be undone. Any agent or script using it will lose access."
        cta="Revoke token"
      />
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`border-b-2 py-4 text-sm font-medium ${
      active
        ? "border-brand-500 text-brand-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
  >
    {children}
  </button>
);
