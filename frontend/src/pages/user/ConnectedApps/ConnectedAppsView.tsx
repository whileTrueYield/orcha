/**
 * Connected Apps page (presentational container).
 *
 * Lists the caller's active OAuth grants and lets them cut one off. Revoking is
 * irreversible and instantly drops the client (its access AND refresh tokens),
 * so it is gated behind a confirmation. Owns the list query and revocation; no
 * redux, so it can be tested without a store.
 *
 * Assumes an Apollo client is in context.
 */

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { LinkIcon } from "@heroicons/react/outline";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { OAuthGrant } from "types/graphql";
import { GrantList } from "./GrantList";
import { MY_OAUTH_GRANTS, REVOKE_OAUTH_GRANT } from "./connectedAppQueries";

export const ConnectedAppsView: React.FC = () => {
  // The grant awaiting a revoke confirmation; gated because revocation is
  // terminal and immediately cuts off the connected client.
  const [pendingRevoke, setPendingRevoke] = useState<{
    familyId: string;
    name: string;
  } | null>(null);

  const { data, refetch } = useQuery<{ myOAuthGrants: OAuthGrant[] }>(
    MY_OAUTH_GRANTS
  );
  const grants = data?.myOAuthGrants ?? [];

  const [revoke] = useBlockingMutation(REVOKE_OAUTH_GRANT, {
    onError: onGraphQLError({ title: "Could not revoke app" }),
    onCompleted: () => refetch(),
  });

  // Open the confirmation; the mutation fires only once accepted.
  const requestRevoke = (familyId: string) => {
    const grant = grants.find((g) => g.familyId === familyId);
    setPendingRevoke({
      familyId,
      name: grant?.clientName ?? "this app",
    });
  };

  const confirmRevoke = () => {
    if (pendingRevoke)
      revoke({ variables: { familyId: pendingRevoke.familyId } });
  };

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="px-4 sm:px-0">
        <h1 className="flex items-center text-2xl font-semibold text-gray-900">
          <LinkIcon className="mr-2 h-6 w-6 text-brand-600" />
          Connected Apps
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Apps you have connected through the Orcha MCP server act as you, with
          the access you granted. Revoke any you no longer use — the app loses
          access immediately and cannot reconnect without your consent.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <GrantList grants={grants} onRevoke={requestRevoke} />
      </div>

      <WarningConfirm
        visible={pendingRevoke !== null}
        onClose={() => setPendingRevoke(null)}
        onConfirm={confirmRevoke}
        title={`Revoke "${pendingRevoke?.name ?? ""}"?`}
        description="This app will lose access immediately and cannot be undone. It will need your consent again to reconnect."
        cta="Revoke app"
      />
    </div>
  );
};
