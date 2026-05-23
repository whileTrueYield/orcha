import { useCurrentEditor } from "@tiptap/react";

export const EditorJSONPreview: React.FC = () => {
  const { editor } = useCurrentEditor();

  if (editor) {
    return (
      <pre className="mx-auto max-h-80 max-w-3xl overflow-auto rounded bg-gray-800 p-2 text-xs text-white">
        {JSON.stringify(editor.getJSON(), null, 2)}
      </pre>
    );
  }

  return null;
};
