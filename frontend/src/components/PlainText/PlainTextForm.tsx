/**
 * PlainTextForm — interim plain-textarea replacement for the retired
 * Tiptap form editor (Tiptap removal, #41).
 *
 * Public API: default export, a react-hook-form-bound `<textarea>`. It mirrors
 * the subset of TiptapForm's props its callers relied on (`name`, `className`,
 * `placeholder`, `autoFocus`) so existing forms keep compiling and submitting.
 *
 * The field value is now a plain string. The form schema already validates
 * `string`, so no schema changes are needed. Migrating these editors to the new
 * Crepe/Markdown editor is a separate follow-up.
 *
 * Assumptions: must be rendered inside a react-hook-form `FormProvider`, exactly
 * like TiptapForm was — it reads `useFormContext()` and registers `name`.
 */
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  name: string;
  className?: string;
  placeholder?: string;
  // Accepted for signature parity with the old TiptapForm; the empty-string
  // case ("end"/"start"/"all") collapses to a boolean for a textarea.
  autoFocus?: boolean | "start" | "end" | "all";
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

const PlainTextForm: React.FC<Props> = (props) => {
  const { register, setValue, watch } = useFormContext();
  const value = watch(props.name, "");

  useEffect(() => {
    register(props.name);
  }, [register, props.name]);

  return (
    <textarea
      autoFocus={Boolean(props.autoFocus)}
      value={value ?? ""}
      onChange={(event) => setValue(props.name, event.currentTarget.value)}
      placeholder={props.placeholder}
      aria-invalid={props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      className={props.className ?? "w-full rounded border p-2"}
    />
  );
};

export default PlainTextForm;
