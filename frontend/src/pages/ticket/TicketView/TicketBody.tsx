/**
 * TicketBody — loads a ticket's Markdown body, edits it in the Crepe-backed
 * MarkdownEditor, and saves it through the optimistic-concurrency body API
 * (#40). Replaces the collaborative TipTap/hocuspocus TicketDescription.
 *
 * It holds the base version read from the server and sends it on save. The
 * server fast-forwards a matching base, 3-way merges a stale one, or returns a
 * conflict (git-markered Markdown + the current version) — in which case we load
 * the markered text back into the editor for manual resolution.
 */
import { gql, useMutation, useQuery } from "@apollo/client";
import { Suspense, lazy, useRef, useState } from "react";
import { onGraphQLError } from "utils/GQLClient";
import {
  DocumentBodyType,
  ModelStage,
  MentionWarning,
  Mutation,
  Query,
} from "types/graphql";
import type { MarkdownEditorHandle } from "components/Markdown/MarkdownEditor";

const MarkdownEditor = lazy(() => import("components/Markdown/MarkdownEditor"));

export const GET_TICKET_BODY = gql`
  query GetTicketBody($id: Int!) {
    ticket(id: $id) {
      id
      stage
      body {
        markdown
        version
      }
    }
  }
`;

export const SAVE_DOCUMENT_BODY = gql`
  mutation SaveDocumentBody(
    $documentType: DocumentBodyType!
    $documentId: Int!
    $markdown: String!
    $baseVersion: Int!
  ) {
    saveDocumentBody(
      documentType: $documentType
      documentId: $documentId
      markdown: $markdown
      baseVersion: $baseVersion
    ) {
      body {
        markdown
        version
      }
      conflict {
        markdown
        version
      }
      warnings {
        kind
        reference
        matches
      }
    }
  }
`;

interface Props {
  ticketId: number;
}

export const TicketBody: React.FC<Props> = ({ ticketId }) => {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [seed, setSeed] = useState<string | null>(null);
  // `seedId` bumps only when we deliberately replace editor content (load,
  // conflict), forcing a remount. A normal successful save does NOT bump it, so
  // the editor keeps the user's content.
  const [seedId, setSeedId] = useState(0);
  const [baseVersion, setBaseVersion] = useState<number | null>(null);
  const [archived, setArchived] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);
  const [warnings, setWarnings] = useState<MentionWarning[]>([]);

  useQuery<Pick<Query, "ticket">>(GET_TICKET_BODY, {
    variables: { id: ticketId },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (!data.ticket) return;
      setSeed(data.ticket.body.markdown);
      setBaseVersion(data.ticket.body.version);
      setArchived(data.ticket.stage === ModelStage.Archived);
    },
    onError: onGraphQLError({ title: "Could not load the ticket body" }),
  });

  const [save, { loading }] = useMutation<Pick<Mutation, "saveDocumentBody">>(
    SAVE_DOCUMENT_BODY,
    { onError: onGraphQLError({ title: "Could not save the ticket body" }) },
  );

  const onSave = async () => {
    if (baseVersion === null) return;
    const markdown = editorRef.current?.getMarkdown() ?? "";
    const { data } = await save({
      variables: {
        documentType: DocumentBodyType.Ticket,
        documentId: ticketId,
        markdown,
        baseVersion,
      },
    });
    const result = data?.saveDocumentBody;
    if (!result) return;

    if (result.conflict) {
      setSeed(result.conflict.markdown);
      setSeedId((n) => n + 1);
      setBaseVersion(result.conflict.version);
      setConflict(true);
      setDirty(false);
      setStatus("");
      return;
    }

    setBaseVersion(result.body!.version);
    setWarnings(result.warnings);
    setConflict(false);
    setDirty(false);
    setStatus("Saved");
  };

  if (seed === null) return null;

  return (
    <div className="text-gray-800">
      {conflict && (
        <div role="alert" className="m-2 rounded bg-amber-50 p-2 text-amber-800">
          This body was edited elsewhere. Resolve the conflict markers
          (&lt;&lt;&lt;&lt;&lt;&lt;&lt; … &gt;&gt;&gt;&gt;&gt;&gt;&gt;) and save
          again.
        </div>
      )}
      {warnings.length > 0 && (
        <div role="status" className="m-2 rounded bg-blue-50 p-2 text-blue-800">
          Some references couldn&apos;t be resolved:{" "}
          {warnings.map((w) => w.reference).join(", ")}
        </div>
      )}
      <Suspense fallback={null}>
        <MarkdownEditor
          key={seedId}
          ref={editorRef}
          value={seed}
          readOnly={archived}
          onDirty={() => {
            setDirty(true);
            setStatus("");
          }}
        />
      </Suspense>
      {!archived && (
        <div className="flex items-center gap-x-3 p-2">
          <button
            type="button"
            disabled={!dirty || loading}
            onClick={onSave}
            className="rounded bg-indigo-600 px-3 py-1 text-white disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          {status && <span className="text-sm text-gray-500">{status}</span>}
        </div>
      )}
    </div>
  );
};
