import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";

import MentionList from "./MentionList";
import { SuggestionOptions } from "@tiptap/suggestion";
import { PluginKey } from "prosemirror-state";
import { emoji } from "./emoji";
import fuzzysort from "fuzzysort";

const defaultSmileys = [
  { char: "😃", name: "smiley" },
  { char: "😆", name: "laughing" },
  { char: "👍", name: "thumbsup" },
  { char: "👎", name: "thumbsdown" },
  { char: "😢", name: "cry" },
  { char: "😮", name: "open_mouth" },
  { char: "❤️", name: "heart" },
];

export const emojiSuggestion: Omit<SuggestionOptions, "editor"> = {
  char: ":",
  allowSpaces: true,
  pluginKey: new PluginKey("emojiSuggestion"),
  items: async ({ query }) => {
    if (query.length === 0) {
      return defaultSmileys.map((emoji) => ({
        id: emoji.char,
        label: `${emoji.char} ${emoji.name.replace(/_/g, " ")}`,
      }));
    }

    const results = fuzzysort.go(query, emoji, {
      key: "name",
      limit: 10,
      threshold: -Infinity,
    });

    return results.map((r) => ({
      id: r.obj.char,
      label: `${r.obj.char} ${r.obj.name.replace(/_/g, " ")}`,
    }));
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as any,
          appendTo: document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props) {
        component.updateProps(props);

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0].hide();
          component.destroy();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
