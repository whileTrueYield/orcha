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
} from "react";

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

    useImperativeHandle(
      ref,
      () => ({ getMarkdown: () => latestRef.current }),
      [],
    );

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;

      latestRef.current = value;
      const crepe = new Crepe({ root: host, defaultValue: value });
      crepe.setReadonly(readOnly);
      crepe.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
          latestRef.current = markdown;
          onDirty?.();
        });
      });

      // create() is async; destroy synchronously once it has resolved so we
      // never leave two editors on the same host, and never tear down a
      // half-initialised one.
      let ready = false;
      const created = crepe.create().then(() => {
        ready = true;
      });
      return () => {
        if (ready) crepe.destroy();
        else created.then(() => crepe.destroy());
      };
      // Remount when the seeded content or the readonly flag changes. onDirty is
      // intentionally excluded — it must not trigger a remount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, readOnly]);

    return <div ref={hostRef} />;
  },
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
