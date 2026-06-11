/**
 * MarkdownView — read-only Markdown rendering through a Crepe instance: the
 * read half of the editor/view split (MarkdownEditor edits, MarkdownView
 * views). One render path means a body always looks the same whether it is
 * being read or edited (ADR-0007).
 *
 * Variants pick the directive plugin preset (see `editorNodes.ts`):
 *   - "full"  — the main-body presentation: full TicketCard and Excalidraw
 *     embeds. For single-instance surfaces (e.g. the ticket modal body).
 *   - "light" — cheap embed views, soft breaks preserved. For chat-like
 *     surfaces that mount many instances (comments, workflow notes).
 *
 * Renders nothing for an empty/whitespace value, so callers need no guard.
 * Unlike MarkdownEditor (whose container owns the boundary and its reset key),
 * the EditorErrorBoundary is built in — a view has no save flow to coordinate
 * with, so callers stay one-liners. Like MarkdownEditor, this is an untestable
 * boundary (ESM editor + contenteditable) verified in the running app.
 */
import { Crepe } from "@milkdown/crepe";
// Crepe's theme CSS is imported in `index.tsx`, NOT here: it must land before
// Tailwind in the bundle so utility classes win specificity ties against
// Crepe's `.milkdown *` margin/padding reset (see the comment there).
import "./editorStyle.css";
import { useEffect, useRef, useState } from "react";
import cn from "classnames";

import { directiveEditorPlugins, directiveViewerPlugins } from "./editorNodes";
import { EditorErrorBoundary } from "./EditorErrorBoundary";
import "./directiveNodes.css";

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

interface Props {
  value: string;
  variant: "full" | "light";
  className?: string;
}

const CrepeView: React.FC<Props> = ({ value, variant, className }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  // Crepe failures (a throw while wiring it up, or a rejected async create())
  // are stored here and re-thrown during render, so the surrounding
  // EditorErrorBoundary shows the cause instead of a silent blank — React
  // boundaries don't catch errors from async callbacks on their own.
  const [crepeError, setCrepeError] = useState<Error | null>(null);

  const isEmpty = value.trim() === "";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let crepe: Crepe;
    try {
      crepe = new Crepe({
        root: host,
        defaultValue: value,
        // A pure read surface: no block handle, no selection toolbar, and no
        // placeholder (an empty value renders nothing at all, see below).
        features: {
          [Crepe.Feature.BlockEdit]: false,
          [Crepe.Feature.Toolbar]: false,
          [Crepe.Feature.Placeholder]: false,
        },
      });
      crepe.editor.use(
        variant === "full" ? directiveEditorPlugins : directiveViewerPlugins,
      );
      crepe.setReadonly(true);
    } catch (err) {
      setCrepeError(asError(err));
      return;
    }

    // create() is async; destroy synchronously once it has resolved so we
    // never leave two editors on the same host, and never tear down a
    // half-initialised one.
    let ready = false;
    const created = crepe
      .create()
      .then(() => {
        ready = true;
      })
      .catch((err) => setCrepeError(asError(err)));
    return () => {
      if (ready) crepe.destroy();
      else created.then(() => crepe.destroy());
    };
  }, [value, variant]);

  if (crepeError) throw crepeError;

  // After the hooks: an empty value mounts no host, so the effect no-ops.
  if (isEmpty) return null;

  return <div ref={hostRef} className={cn("orcha-markdown-view", className)} />;
};

// CrepeView re-throws async Crepe failures during render; the boundary must
// therefore sit above it, which is why the exported component is this wrapper.
const MarkdownView: React.FC<Props> = (props) => (
  <EditorErrorBoundary resetKey={props.value}>
    <CrepeView {...props} />
  </EditorErrorBoundary>
);

export default MarkdownView;
