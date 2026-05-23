import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import "./tiptap.css";
import { TipTapToolbar } from "./TipTapToolbar";
import { TipTapBubbleMenu } from "./TipTapBubbleMenu";
import { useAppDispatch } from "store";
import { useEffect, useMemo } from "react";
import cn from "classnames";
import { MiniTipTapToolbar } from "./MiniTipTapToolbar";
import { TipTapProps } from "./TipTapProps";
import { getTipTapExtensions } from "./TipTapExtensions";

const Tiptap: React.FC<TipTapProps> = (props) => {
  const { onChange, autoFocus, readonly, showToolbar } = props;
  const dispatch = useAppDispatch();
  const content = useMemo(() => {
    try {
      return props.content ? JSON.parse(props.content) : null;
    } catch (e) {
      return null;
    }
  }, [props.content]);

  // define the tiptap extension array
  const extensions = getTipTapExtensions(dispatch, {
    withRoleMention: true,
    withDrawing: true,
    withTicketMention: true,
    withTaskList: true,
    placeholder: props.placeholder,
  });

  const renderToolBar = () => {
    if (readonly) {
      return null;
    } else if (showToolbar === "minimal") {
      return <MiniTipTapToolbar className="bg-gray-100 p-1.5 sm:rounded-lg" />;
    } else if (showToolbar) {
      return (
        <div className="sticky top-0 z-20 border-b px-0 pb-1 pt-1 sm:px-4">
          <TipTapToolbar className="bg-gray-100 p-1.5 sm:rounded-lg" />
        </div>
      );
    } else return null;
  };

  return (
    <EditorProvider
      editable={!readonly}
      editorProps={{
        attributes: {
          class: cn(
            "prose mx-auto text-base leading-6 text-gray-700 selection:bg-sky-200",
            {
              "min-h-[8rem]": !readonly,
            },
            props.className,
          ),
        },
      }}
      slotBefore={renderToolBar()}
      extensions={extensions}
      content={content}
      onUpdate={({ editor }) => onChange?.(JSON.stringify(editor.getJSON()))}
    >
      {readonly ? (
        // This is a hack to refresh the content when it changes
        <TipTapRefreshOnChange content={content} />
      ) : (
        <>
          <TipTapBubbleMenu />
          <TipTapFocusFix autofocus={autoFocus} />
        </>
      )}
    </EditorProvider>
  );
};

const TipTapRefreshOnChange = (props: { content: any }) => {
  const { editor } = useCurrentEditor();

  useEffect(() => {
    editor?.commands.setContent(props.content);
  }, [editor, props.content]);

  return null;
};

/**
 * Fix to focus TipTap editor, the regular autofocus doesn't work
 * @param props
 * @returns
 */
const TipTapFocusFix = (props: {
  autofocus?: "start" | "end" | "all" | boolean;
}) => {
  const { editor } = useCurrentEditor();

  useEffect(() => {
    if (editor && props.autofocus) {
      editor.commands.focus(props.autofocus);
    }
  }, [editor, props.autofocus]);

  return null;
};

export default Tiptap;
