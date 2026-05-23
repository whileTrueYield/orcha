import { EditorProvider } from "@tiptap/react";
import "./tiptap.css";
import { TipTapToolbar } from "./TipTapToolbar";
import { TipTapBubbleMenu } from "./TipTapBubbleMenu";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { useAppDispatch } from "store";
import { TipTapCollabProps } from "./TipTapCollabProps";
import { getTipTapExtensions } from "./TipTapExtensions";

const TiptapCollab: React.FC<TipTapCollabProps> = (props) => {
  const { documentId, documentType, accessToken, readonly } = props;
  const dispatch = useAppDispatch();
  const me = useSelector(getMe);

  const provider = new HocuspocusProvider({
    url: import.meta.env.VITE_API_WS_URI || `ws://127.0.0.1:38268`,
    name: `${documentType}:${documentId}`,
    token: accessToken,
  });

  // define the tiptap extension array
  const extensions = getTipTapExtensions(dispatch, {
    withCollab: { provider, role: me?.role },
    withRoleMention: true,
    withDrawing: true,
    withTicketMention: true,
    withTaskList: true,
    placeholder: props.placeholder,
  });

  return (
    <div>
      <EditorProvider
        editable={!readonly}
        editorProps={{
          attributes: {
            class:
              "prose min-h-[10rem] mx-auto max-w-4xl p-4 text-base leading-6 text-gray-700 selection:bg-sky-200",
          },
        }}
        slotBefore={
          <div className="sticky top-0 z-20 border-b bg-white px-0 pb-1 pt-1 sm:px-4">
            <TipTapToolbar className="bg-gray-100 p-1.5 sm:rounded-lg" />
          </div>
        }
        extensions={extensions}
      >
        <TipTapBubbleMenu />
        {/* <EditorJSONPreview /> */}
      </EditorProvider>
    </div>
  );
};

export default TiptapCollab;
