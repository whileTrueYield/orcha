/**
 * PlainTextView — renders a string as plain text, preserving line breaks.
 *
 * Public API: default export (`content`, `className`).
 *
 * Body-like content (comments, notes, ticket bodies) renders through
 * `components/Markdown/MarkdownView` instead; this stays for fields that are
 * genuinely plain text and must never be interpreted as Markdown (e.g. a
 * team's description).
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
