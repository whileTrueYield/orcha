import "./CodeBlock.css";
import "highlight.js/styles/atom-one-dark-reasonable.min.css";

import { NodeViewContent, NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import React from "react";
import { createLowlight, common } from "lowlight";
import { ClipboardCopyIcon } from "@heroicons/react/outline";

export const lowlight = createLowlight(common);

lowlight.registerAlias({
  typescript: ["tsx", "ts"],
  javascript: ["js", "jsx"],
  python: ["py"],
});

const getTextFromNode = (node: any) => {
  const content = node.content || [];
  const text = node.text || "";

  return text + content.map(getTextFromNode).join("");
};

const CodeBlock: React.FC<NodeViewProps> = (props) => {
  const defaultLanguage = props.node.attrs.language;
  const updateAttributes = props.updateAttributes;
  const extension = props.extension;
  const copyIcon = (
    <ClipboardCopyIcon className="h-4 w-4 text-gray-300 hover:text-gray-50" />
  );
  const [copyLabel, setCopyLabel] = React.useState(copyIcon);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(props.node.content.content[0].text ?? "");
    setCopyLabel(<span>Copied!</span>);
    setTimeout(() => {
      setCopyLabel(copyIcon);
    }, 1000);
  };

  return (
    <NodeViewWrapper className="code-block group">
      <div className="absolute top-2 right-2 flex flex-row space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          contentEditable={false}
          title="Copy to clipboard"
          onClick={copyToClipboard}
          className="rounded-md bg-gray-900 py-1 px-2 hover:bg-gray-700 text-gray-300 hover:text-gray-50 ring-1 ring-inset ring-gray-800 hover:ring-gray-500 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
        >
          {copyLabel}
        </button>
        <select
          title="Change language"
          contentEditable={false}
          defaultValue={defaultLanguage}
          onChange={(event) =>
            updateAttributes({ language: event.target.value })
          }
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 bg-gray-900 hover:bg-gray-700 text-gray-300 hover:text-gray-50 ring-1 ring-inset ring-gray-800 hover:ring-gray-500 focus:ring-2 focus:ring-sky-600 sm:text-sm sm:leading-6"
        >
          <option value="null">auto</option>
          <option disabled>—</option>
          {extension.options.lowlight
            .listLanguages()
            .map((lang: string, index: number) => (
              <option key={index} value={lang}>
                {lang}
              </option>
            ))}
        </select>
      </div>
      <pre className="overflow-x-auto overscroll-x-contain" spellCheck={false}>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlock;
