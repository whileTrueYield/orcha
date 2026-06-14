/**
 * Presentational table of Personal Access Tokens, shared by the personal view
 * ("My tokens") and the org-admin view ("Organization").
 *
 * Props:
 *  - tokens: the rows to render (already fetched and ordered by the parent).
 *  - onRevoke: called with a token id when its Revoke action is used. A token
 *    that is already revoked offers no action — revocation is terminal.
 *  - showOwner: render the owning Role's name as a leading column. The org-admin
 *    view needs it to tell whose token is whose; the personal view does not.
 *  - now: the reference time for status/last-used (injectable for tests).
 *
 * This component is pure presentation — it runs no queries and owns no state.
 */

import { formatDistance, format } from "date-fns";
import { PersonalAccessToken } from "types/graphql";
import { Button } from "components/fields/Button";
import { tokenStatus, TokenStatus } from "./helper";

interface Props {
  tokens: PersonalAccessToken[];
  onRevoke: (id: number) => void;
  showOwner: boolean;
  now?: Date;
}

const STATUS_STYLES: Record<TokenStatus, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-gray-100 text-gray-600",
  revoked: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<TokenStatus, string> = {
  active: "Active",
  expired: "Expired",
  revoked: "Revoked",
};

export const TokenList: React.FC<Props> = ({
  tokens,
  onRevoke,
  showOwner,
  now = new Date(),
}) => {
  if (tokens.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        No tokens yet.
      </p>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          {showOwner && <th className="px-4 py-3">Owner</th>}
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Token</th>
          <th className="px-4 py-3">Access</th>
          <th className="px-4 py-3">Last used</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {tokens.map((token) => {
          const status = tokenStatus(token, now);
          return (
            <tr key={token.id} data-testid={`token-row-${token.id}`} className="text-sm">
              {showOwner && (
                <td className="px-4 py-3 text-gray-700">{token.role.name}</td>
              )}
              <td className="px-4 py-3 font-medium text-gray-900">
                {token.name}
              </td>
              <td className="px-4 py-3 font-mono text-gray-500">
                {token.tokenPrefix}…
              </td>
              <td className="px-4 py-3">
                {token.readOnly ? (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                    Read-only
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Read &amp; write</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {token.lastUsedAt
                  ? formatDistance(new Date(token.lastUsedAt), now, {
                      addSuffix: true,
                    })
                  : "Never"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
                {token.expiresAt && status !== "revoked" && (
                  <span className="ml-2 text-xs text-gray-400">
                    {status === "expired" ? "on " : "expires "}
                    {format(new Date(token.expiresAt), "PP")}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {!token.revokedAt && (
                  <Button
                    type="button"
                    btnType="secondaryWhite"
                    onClick={() => onRevoke(token.id)}
                  >
                    Revoke
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
