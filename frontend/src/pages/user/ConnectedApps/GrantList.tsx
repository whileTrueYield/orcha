/**
 * Presentational table of connected apps (OAuth grants).
 *
 * Every row is a live grant — the server only ever returns active ones — so,
 * unlike the PAT list, there is no status state machine and every row is
 * revocable. Pure presentation: no queries, no state.
 *
 * Props:
 *  - grants: the rows to render (already fetched and ordered by the parent).
 *  - onRevoke: called with a grant's familyId when its Revoke action is used.
 *  - now: reference time for the "last used" / "connected" distances (test seam).
 */

import { formatDistance, format } from "date-fns";
import { OAuthGrant } from "types/graphql";
import { Button } from "components/fields/Button";

interface Props {
  grants: OAuthGrant[];
  onRevoke: (familyId: string) => void;
  now?: Date;
}

export const GrantList: React.FC<Props> = ({
  grants,
  onRevoke,
  now = new Date(),
}) => {
  if (grants.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        No connected apps yet.
      </p>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <th className="px-4 py-3">Application</th>
          <th className="px-4 py-3">Access</th>
          <th className="px-4 py-3">Connected</th>
          <th className="px-4 py-3">Last used</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {grants.map((grant) => (
          <tr
            key={grant.familyId}
            data-testid={`grant-row-${grant.familyId}`}
            className="text-sm"
          >
            <td className="px-4 py-3">
              <div className="font-medium text-gray-900">
                {grant.clientName ?? "Unnamed app"}
              </div>
              {/* Scope is the authority the user granted at consent (#80). */}
              <div className="font-mono text-xs text-gray-400">
                {grant.scope}
              </div>
            </td>
            <td className="px-4 py-3">
              {grant.readOnly ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  Read-only
                </span>
              ) : (
                <span className="text-xs text-gray-500">Read &amp; write</span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-500">
              {format(new Date(grant.connectedAt), "PP")}
            </td>
            <td className="px-4 py-3 text-gray-500">
              {grant.lastUsedAt
                ? formatDistance(new Date(grant.lastUsedAt), now, {
                    addSuffix: true,
                  })
                : "Never"}
            </td>
            <td className="px-4 py-3 text-right">
              <Button
                type="button"
                btnType="secondaryWhite"
                onClick={() => onRevoke(grant.familyId)}
              >
                Revoke
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
