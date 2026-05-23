import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";

import MentionList from "./MentionList";
import { SuggestionOptions } from "@tiptap/suggestion";
import { gql } from "@apollo/client";
import { GQLClient } from "utils/GQLClient";
import { QueryReturnValue } from "types/queryTypes";
import { PluginKey } from "prosemirror-state";

export const roleSuggestion: Omit<SuggestionOptions, "editor"> = {
  char: "@",
  allowSpaces: true,
  pluginKey: new PluginKey("roleSuggestion"),
  items: async ({ query }) => {
    const { data } = await GQLClient.query<QueryReturnValue["searchRole"]>({
      query: SEARCH_TICKET_QUERY,
      variables: {
        query: query,
      },
    });

    return data.searchRole.map((r) => ({ id: r.id, label: r.name }));
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

const SEARCH_TICKET_QUERY = gql`
  query searchRole($query: String!) {
    searchRole(query: $query) {
      id
      name
    }
  }
`;
