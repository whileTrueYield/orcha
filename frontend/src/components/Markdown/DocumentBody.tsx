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
import { Button } from "components/fields/Button";
import {
  readBodyDraft,
  writeBodyDraft,
  clearBodyDraft,
} from "components/Markdown/bodyDraftStorage";

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

  // A locally-cached unsaved edit from a previous visit, if any. Restoring it on
  // mount is what lets the user leave mid-edit and come back without losing work.
  // Ignored in read-only mode, and when it already matches the server content
  // (nothing to restore). Read once — storage is only re-consulted by writes.
  const restoredDraft = useRef(readBodyDraft(documentType, documentId)).current;
  const hasRestoredDraft =
    !readOnly &&
    restoredDraft !== null &&
    restoredDraft.markdown !== initialMarkdown;

  // The last content the server accepted. Discard reverts the editor to this.
  // Kept in a ref (not state) so refreshing it after a save never feeds a new
  // `value` into MarkdownEditor — which would remount Crepe and lose the cursor.
  const lastSavedRef = useRef(initialMarkdown);
  const [seed, setSeed] = useState(
    hasRestoredDraft ? restoredDraft!.markdown : initialMarkdown,
  );
  // `seedId` bumps only when we deliberately replace editor content (conflict or
  // discard), forcing a remount. A normal successful save does NOT bump it, so
  // the editor keeps the user's content.
  const [seedId, setSeedId] = useState(0);
  // baseVersion is never rendered, only read at save time — a ref keeps it
  // current for `onDirty`'s closure (which MarkdownEditor captures once at mount)
  // without an extra render or a stale value persisted into the draft after a
  // save. A restored draft carries the version it was based on (see save flow).
  const baseVersionRef = useRef(
    hasRestoredDraft ? restoredDraft!.baseVersion : initialVersion,
  );
  const [dirty, setDirty] = useState(hasRestoredDraft);
  const [status, setStatus] = useState(
    hasRestoredDraft ? "Unsaved draft restored" : "",
  );
  const [conflict, setConflict] = useState(false);
  const [warnings, setWarnings] = useState<MentionWarning[]>([]);

  const [save, { loading }] = useMutation<Pick<Mutation, "saveDocumentBody">>(
    SAVE_DOCUMENT_BODY,
    { onError: onGraphQLError({ title: saveErrorTitle }) },
  );

  const onSave = async () => {
    const markdown = editorRef.current?.getMarkdown() ?? "";
    const { data } = await save({
      variables: {
        documentType,
        documentId,
        markdown,
        baseVersion: baseVersionRef.current,
      },
    });
    const result = data?.saveDocumentBody;
    if (!result) return;

    if (result.conflict) {
      // The cached draft is superseded by the conflict-markered text we're about
      // to seed, so drop it; edits to the resolution will cache a fresh one.
      clearBodyDraft(documentType, documentId);
      lastSavedRef.current = result.conflict.markdown;
      setSeed(result.conflict.markdown);
      setSeedId((n) => n + 1);
      baseVersionRef.current = result.conflict.version;
      setConflict(true);
      setWarnings([]);
      setDirty(false);
      setStatus("");
      return;
    }

    // Persisted to the server — the local draft has done its job.
    clearBodyDraft(documentType, documentId);
    // The stored content can differ from what we submitted: a stale base is
    // 3-way merged server-side, and loose @mentions/#refs are resolved to
    // id-bearing directives. When it diverges, reseed the editor so it shows
    // exactly what was persisted (e.g. another writer's merged-in changes)
    // instead of our now-superseded submission. An identical result skips the
    // remount, so the common fast-forward save keeps the cursor in place.
    const persisted = result.body!.markdown;
    lastSavedRef.current = persisted;
    baseVersionRef.current = result.body!.version;
    if (persisted !== markdown) {
      setSeed(persisted);
      setSeedId((n) => n + 1);
    }
    setWarnings(result.warnings);
    setConflict(false);
    setDirty(false);
    setStatus("Saved");
  };

  // Revert unsaved edits: remount the editor (bumped key + reseeded value) with
  // the last saved content. A remount is the only way to reset Crepe's content,
  // and it's the expected, deliberate behaviour for an explicit Discard.
  const onDiscard = () => {
    clearBodyDraft(documentType, documentId);
    setSeed(lastSavedRef.current);
    setSeedId((n) => n + 1);
    setConflict(false);
    setWarnings([]);
    setDirty(false);
    setStatus("");
  };

  // Cmd/Ctrl+S saves the body instead of opening the browser's "save page"
  // dialog. The handler sits on the wrapper and catches keydowns bubbling up
  // from the editor, so it's scoped to this component with no global listener.
  // While editing we always swallow the shortcut (even when there's nothing to
  // save) so the reflex never pops the browser dialog; read-only bodies let it
  // through untouched.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (readOnly) return;
    const isSaveShortcut =
      (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s";
    if (!isSaveShortcut) return;
    event.preventDefault();
    if (dirty && !loading) onSave();
  };

  return (
    <div className="text-gray-800" onKeyDown={onKeyDown}>
      {conflict && (
        <div
          role="alert"
          className="m-2 rounded bg-amber-50 p-2 text-amber-800"
        >
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
            writeBodyDraft(documentType, documentId, {
              markdown: editorRef.current?.getMarkdown() ?? "",
              baseVersion: baseVersionRef.current,
            });
          }}
        />
      </EditorErrorBoundary>
      {!readOnly && (
        <div className="flex items-center justify-end gap-x-2 py-2 px-4">
          {status && (
            <span className="mr-auto text-sm text-gray-500">{status}</span>
          )}
          <Button
            type="button"
            btnType="secondaryWhite"
            btnSize="small"
            disabled={!dirty || loading}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            type="button"
            btnType="primary"
            btnSize="small"
            disabled={!dirty || loading}
            onClick={onSave}
          >
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
};
