import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewProps,
} from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import React, { useState } from "react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    reactComponent: {
      insertCounter: (options?: { value: number }) => ReturnType;
    };
  }
}

const Component: React.FC<NodeViewProps> = (props) => {
  const [value, setValue] = useState(props.node.attrs.count);

  const increase = () => {
    setValue(value + 1);
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    });
  };

  return (
    <NodeViewWrapper className="react-component">
      <span className="label">React Component</span>

      <div className="content">
        <button onClick={increase}>
          This button has been clicked {props.node.attrs.count} times.
        </button>
      </div>
    </NodeViewWrapper>
  );
};

type CounterOptions = {
  value: number;
};

export const TipTapCounter = Node.create<CounterOptions>({
  name: "reactComponent",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "react-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["react-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView(attrs?: {}) {
    return ReactNodeViewRenderer(Component);
  },
});
