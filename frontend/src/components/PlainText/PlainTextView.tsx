/**
 * PlainTextView — interim read-only replacement for the retired Tiptap editor
 * used in `readonly` mode (Tiptap removal, #41).
 *
 * Public API: default export. Renders a string body as plain text, splitting on
 * newlines into paragraphs. Mirrors the props its callers passed to the old
 * readonly `<Tiptap content={...} readonly />` (`content`, `className`).
 *
 * Note: content stored before this migration may be Tiptap JSON. We do NOT
 * parse it — it renders as its raw string, which is accepted breakage during
 * the migration. New content is plain text / Markdown source.
 */
import cn from "classnames";

interface Props {
  content?: string | null;
  className?: string;
}

const PlainTextView: React.FC<Props> = (props) => {
  const body = props.content ?? "";

  return (
    <div className={cn("whitespace-pre-wrap break-words", props.className)}>
      {body}
    </div>
  );
};

export default PlainTextView;
