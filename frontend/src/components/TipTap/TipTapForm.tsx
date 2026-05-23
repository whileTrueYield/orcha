import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import Tiptap from "./TipTap";
import { TipTapProps } from "./TipTapProps";

interface Props extends TipTapProps {
  name: string;
}

const TiptapForm: React.FC<Props> = (props) => {
  const { register, setValue, watch } = useFormContext();

  const content = watch(props.name, "");

  useEffect(() => {
    register(props.name);
  });

  return (
    <Tiptap
      {...props}
      onChange={(json: string) => {
        setValue(props.name, json);
      }}
      readonly={props.readonly}
      showToolbar={props.showToolbar}
      content={content}
      className={props.className}
      placeholder={props.placeholder}
      autoFocus={props.autoFocus}
    />
  );
};

export default TiptapForm;
