/**
 * Presentational table of Repository links.
 *
 * A link is PENDING until a signed webhook delivery proves repo control, then
 * ACTIVE with its discovered repository. Pure presentation: no queries, no
 * state.
 *
 * Props:
 *  - links: the rows to render (already fetched and ordered by the parent).
 *  - onDelete: called with a link's id when its Remove action is used.
 */

import { format } from "date-fns";
import { RepositoryLink, RepositoryLinkStatus } from "types/graphql";
import { Button } from "components/fields/Button";

interface Props {
  links: RepositoryLink[];
  onDelete: (id: number) => void;
}

export const RepositoryLinkList: React.FC<Props> = ({ links, onDelete }) => {
  if (links.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        No repositories linked yet.
      </p>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <th className="px-4 py-3">Repository</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Created</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {links.map((link) => (
          <tr
            key={link.id}
            data-testid={`repository-link-row-${link.id}`}
            className="text-sm"
          >
            <td className="px-4 py-3">
              <div className="font-medium text-gray-900">
                {link.repoFullName ?? link.name ?? "Untitled link"}
              </div>
              {/* While pending we don't yet know the repo — name the link if the
                  admin labelled it, and explain what's still needed. */}
              {link.status === RepositoryLinkStatus.Pending && (
                <div className="text-xs text-gray-400">
                  Awaiting the first webhook delivery
                </div>
              )}
            </td>
            <td className="px-4 py-3">
              {link.status === RepositoryLinkStatus.Active ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  Pending
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-500">
              {format(new Date(link.createdAt), "PP")}
            </td>
            <td className="px-4 py-3 text-right">
              <Button
                type="button"
                btnType="secondaryWhite"
                onClick={() => onDelete(link.id)}
              >
                Remove
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
