/**
 * MarkdownEditor — a thin React wrapper around a Crepe (Milkdown) instance.
 *
 * Crepe seeds its content once at construction (there is no setMarkdown), so we
 * remount on a `value` change (initial load, or conflict-markered text after a
 * 409). The latest markdown is tracked from Crepe's markdownUpdated listener and
 * exposed via an imperative `getMarkdown()` so the container reads it only at
 * save time — Crepe stays uncontrolled and the parent never re-renders per
 * keystroke.
 *
 * This component is the untestable boundary (ESM editor + contenteditable); it
 * is verified manually in the running app, not in jsdom.
 */
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export interface MarkdownEditorHandle {
  getMarkdown: () => string;
}

interface Props {
  value: string;
  readOnly?: boolean;
  onDirty?: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorHandle, Props>(
  ({ value, readOnly = false, onDirty }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const latestRef = useRef<string>(value);
    // Crepe failures (a throw while wiring it up, or a rejected async create())
    // are stored here and re-thrown during render, so the surrounding
    // EditorErrorBoundary shows the cause instead of a silent blank — React
    // boundaries don't catch errors from async callbacks on their own.
    const [crepeError, setCrepeError] = useState<Error | null>(null);

    useImperativeHandle(
      ref,
      () => ({ getMarkdown: () => latestRef.current }),
      [],
    );

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      latestRef.current = value;
      let crepe: Crepe;
      try {
        crepe = new Crepe({ root: host, defaultValue: value });
        crepe.setReadonly(readOnly);
        crepe.on((listener) => {
          listener.markdownUpdated((_ctx, markdown) => {
            latestRef.current = markdown;
            onDirty?.();
          });
        });
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
      // Remount when the seeded content or the readonly flag changes. onDirty is
      // intentionally excluded — it must not trigger a remount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, readOnly]);

    if (crepeError) throw crepeError;

    return <div ref={hostRef} />;
  },
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
