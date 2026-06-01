/**
 * DocumentBody — the shared editing/saving core for any Markdown document body
 * (ticket, project, documentation page). It owns everything that is identical
 * across document types: the Crepe editor, the optimistic-concurrency save
 * through `saveDocumentBody` (#40), conflict reseeding, mention warnings, and
 * the dirty/save/status UI.
 *
 * What differs per type — how to LOAD the body and how to decide read-only —
 * lives in the thin per-type containers (TicketBody, ProjectBody, …), which
 * load their own focused query and hand the resolved values here as props. This
 * component is rendered only once those values exist, so it seeds its state from
 * them directly; callers should key it by `documentId` so switching documents
 * remounts it with fresh content.
 *
 * Exports: DocumentBody, SAVE_DOCUMENT_BODY.
 */
import { gql, useMutation } from "@apollo/client";
import { useRef, useState } from "react";
import { onGraphQLError } from "utils/GQLClient";
import { DocumentBodyType, MentionWarning, Mutation } from "types/graphql";
// Imported eagerly (not React.lazy): Vite's dep scanner skips dynamic imports
// behind React.lazy, so Crepe's ProseMirror was pre-bundled in a separate pass
// and loaded twice, triggering "Adding different instances of a keyed plugin".
import MarkdownEditor, {
  type MarkdownEditorHandle,
} from "components/Markdown/MarkdownEditor";
import { EditorErrorBoundary } from "components/Markdown/EditorErrorBoundary";

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
  documentType: DocumentBodyType;
  documentId: number;
  initialMarkdown: string;
  initialVersion: number;
  readOnly: boolean;
  saveErrorTitle: string;
}

export const DocumentBody: React.FC<Props> = ({
  documentType,
  documentId,
  initialMarkdown,
  initialVersion,
  readOnly,
  saveErrorTitle,
}) => {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [seed, setSeed] = useState(initialMarkdown);
  // `seedId` bumps only when we deliberately replace editor content (conflict),
  // forcing a remount. A normal successful save does NOT bump it, so the editor
  // keeps the user's content.
  const [seedId, setSeedId] = useState(0);
  const [baseVersion, setBaseVersion] = useState(initialVersion);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);
  const [warnings, setWarnings] = useState<MentionWarning[]>([]);

  const [save, { loading }] = useMutation<Pick<Mutation, "saveDocumentBody">>(
    SAVE_DOCUMENT_BODY,
    { onError: onGraphQLError({ title: saveErrorTitle }) },
  );

  const onSave = async () => {
    const markdown = editorRef.current?.getMarkdown() ?? "";
    const { data } = await save({
      variables: { documentType, documentId, markdown, baseVersion },
    });
    const result = data?.saveDocumentBody;
    if (!result) return;

    if (result.conflict) {
      setSeed(result.conflict.markdown);
      setSeedId((n) => n + 1);
      setBaseVersion(result.conflict.version);
      setConflict(true);
      setWarnings([]);
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
      <EditorErrorBoundary resetKey={documentId}>
        <MarkdownEditor
          key={seedId}
          ref={editorRef}
          value={seed}
          readOnly={readOnly}
          onDirty={() => {
            setDirty(true);
            setStatus("");
          }}
        />
      </EditorErrorBoundary>
      {!readOnly && (
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
