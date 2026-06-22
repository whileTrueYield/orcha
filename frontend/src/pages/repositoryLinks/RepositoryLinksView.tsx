/**
 * Repository Links admin page (presentational container).
 *
 * Lists the Organization's GitHub repository links, lets an admin create one
 * (revealing the webhook URL + secret once) and remove one. Removing an active
 * link frees its repo to be linked again, so it is gated behind a confirmation.
 * Owns the list query and mutations; no redux, so it can be tested without a
 * store.
 *
 * Assumes an Apollo client is in context.
 */

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { LinkIcon } from "@heroicons/react/outline";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { RepositoryLink } from "types/graphql";
import { RepositoryLinkList } from "./RepositoryLinkList";
import { RepositoryLinkCreateModal } from "./RepositoryLinkCreateModal";
import {
  REPOSITORY_LINKS,
  DELETE_REPOSITORY_LINK,
} from "./repositoryLinkQueries";

export const RepositoryLinksView: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  // The link awaiting a remove confirmation; gated because removing an active
  // link unbinds the repo and stops mirroring its PRs.
  const [pendingDelete, setPendingDelete] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const { data, refetch } = useQuery<{ repositoryLinks: RepositoryLink[] }>(
    REPOSITORY_LINKS,
    { fetchPolicy: "cache-and-network" },
  );
  const links = data?.repositoryLinks ?? [];

  const [remove] = useBlockingMutation(DELETE_REPOSITORY_LINK, {
    onError: onGraphQLError({ title: "Could not remove link" }),
    onCompleted: () => refetch(),
  });

  const requestDelete = (id: number) => {
    const link = links.find((l) => l.id === id);
    setPendingDelete({
      id,
      label: link?.repoFullName ?? link?.name ?? "this link",
    });
  };

  const confirmDelete = () => {
    if (pendingDelete) remove({ variables: { id: pendingDelete.id } });
  };

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="flex items-start justify-between px-4 sm:px-0">
        <div>
          <h1 className="flex items-center text-2xl font-semibold text-gray-900">
            <LinkIcon className="mr-2 h-6 w-6 text-brand-600" />
            Repository Links
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Connect a GitHub repository to mirror its pull requests onto the
            tickets they reference. A link activates once GitHub sends its first
            signed delivery, proving you control the repo.
          </p>
        </div>
        <Button
          type="button"
          btnType="primary"
          onClick={() => setCreateOpen(true)}
        >
          Link a repository
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <RepositoryLinkList links={links} onDelete={requestDelete} />
      </div>

      <RepositoryLinkCreateModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refetch}
      />

      <WarningConfirm
        visible={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title={`Remove "${pendingDelete?.label ?? ""}"?`}
        description="Orcha will stop mirroring this repository's pull requests and the repo can be linked again. Delete the webhook in GitHub too."
        cta="Remove link"
      />
    </div>
  );
};
