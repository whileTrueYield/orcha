import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Tag } from "components/tags/Tag";
import { FCWithFragments } from "types";
import {
  MutationAddTicketTagsArgs,
  MutationRemoveTicketTagsArgs,
  Ticket,
  MiniTag,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Combobox } from "@headlessui/react";
import { find } from "lodash";
import { CheckIcon } from "@heroicons/react/outline";
import { Button } from "components/fields/Button";
import { TicketTagCreateModal } from "../TicketTagCreate/TicketCreateTagModal";
import { plural } from "utils/string";
import { getColor } from "config";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";

interface Props {
  ticket: Ticket;
}

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

export const TicketTagInput: FCWithFragments<Props> = (props) => {
  const { ticket } = props;
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<MiniTag | null>();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const { data } = useQuery<QueryReturnValue["miniTags"]>(GET_MINI_TAGS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const [addTags] = useMutation<
    MutationReturnValue["addTicketTags"],
    MutationAddTicketTagsArgs
  >(ADD_TICKET_TAGS_MUTATION, {
    onError: onGraphQLError({ title: "Could not add tag" }),
    onCompleted: onMutationComplete({ title: "Tag added" }),
  });

  const [removeTags] = useMutation<
    MutationReturnValue["removeTicketTags"],
    MutationRemoveTicketTagsArgs
  >(REMOVE_TICKET_TAGS_MUTATION, {
    onError: onGraphQLError({ title: "Could not remove tag" }),
    onCompleted: onMutationComplete({ title: "Tag removed" }),
  });

  const removeTag = (tagId: number) => {
    removeTags({
      variables: {
        ticketId: ticket.id,
        tagIds: [tagId],
      },
    });
  };

  const addTag = (tagId: number) => {
    addTags({
      variables: {
        ticketId: ticket.id,
        tagIds: [tagId],
      },
    });
  };

  const miniTags = data ? data.miniTags : [];
  const tags = ticket.tags || [];

  const filteredTags =
    query === ""
      ? miniTags
      : miniTags.filter((miniTag) => {
          return miniTag.name.toLowerCase().includes(query.toLowerCase());
        });

  const isSelected = (tagId: number) => !!find(tags, { id: tagId });

  const toggleTag = (miniTag: MiniTag) => {
    if (isSelected(miniTag.id)) {
      removeTag(miniTag.id);
    } else {
      addTag(miniTag.id);
    }
    setSelectedTag(null);
  };

  const renderOptions = (filteredTags: MiniTag[]) => {
    if (filteredTags.length) {
      return filteredTags.map((miniTag) => (
        <Combobox.Option
          value={miniTag}
          key={miniTag.id}
          className={({ active }) =>
            classNames(
              "relative cursor-default select-none py-2 pl-3 pr-9",
              active ? "bg-brand-600 text-white" : "text-gray-900"
            )
          }
        >
          {({ active }) => (
            <>
              <span
                className={classNames(
                  "block truncate",
                  isSelected(miniTag.id) && "font-semibold"
                )}
              >
                {miniTag.name}
              </span>

              {isSelected(miniTag.id) && (
                <span
                  className={classNames(
                    "absolute inset-y-0 right-0 flex items-center pr-4",
                    active ? "text-white" : "text-indigo-600"
                  )}
                >
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
            </>
          )}
        </Combobox.Option>
      ));
    } else {
      return (
        <div className="p-2 text-center text-sm text-gray-400">
          No Match Found
        </div>
      );
    }
  };

  return (
    <>
      <TicketTagCreateModal
        ticketId={ticket.id}
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        name={query}
      />

      <Combobox value={selectedTag} onChange={toggleTag}>
        <Combobox.Label>
          <div className="mb-1 text-lg text-gray-700">Tags</div>
        </Combobox.Label>
        <div
          onClick={(event) => {
            event.currentTarget.querySelector("input")?.focus();
          }}
          className="rounded-md border border-gray-300 bg-white pl-2 pb-2 shadow-sm sm:pb-1.5"
        >
          {tags.map((tag) => {
            const colorSet = getColor(tag.color);

            return (
              <Tag
                large
                key={tag.id}
                onDelete={() => removeTag(tag.id)}
                className={`mr-2 mt-2 ${colorSet.textColor} ${colorSet.bgColor} shadow-sm sm:mt-1.5`}
              >
                {tag.name}
              </Tag>
            );
          })}
          <Combobox.Input
            placeholder="Search..."
            className="mr-2 mt-2 inline-block border-0 p-0 py-0.5 pl-1 text-sm text-gray-600  outline-none placeholder:text-gray-400 focus:border-0 focus:outline-none focus:ring-0 sm:mt-1.5"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(miniTag?: MiniTag) => (miniTag ? miniTag.name : "")}
          />

          <div className="relative">
            <Combobox.Options className="absolute z-10 mt-3 w-full rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className="max-h-60 overflow-auto py-1">
                {renderOptions(filteredTags)}
              </div>
              <div className="flex flex-row items-center justify-between rounded-b-md border-t bg-gray-100 p-2">
                <span className="pl-2 text-xs font-medium text-gray-400">
                  {plural("{} tag", "{} tags", filteredTags)}
                </span>
                <Button
                  onClick={() => setCreateModalVisible(true)}
                  btnType="white"
                  type="button"
                  btnSize="xsmall"
                >
                  Create Tag
                </Button>
              </div>
            </Combobox.Options>
          </div>
        </div>
      </Combobox>
    </>
  );
};

TicketTagInput.fragments = {
  TicketTagInputFragment: gql`
    fragment TicketTagInputFragment on Ticket {
      id
      tags {
        id
        name
        color
      }
    }
  `,
};

const REMOVE_TICKET_TAGS_MUTATION = gql`
  mutation TicketTagInputRemoveTags($ticketId: Int!, $tagIds: [Int!]!) {
    removeTicketTags(ticketId: $ticketId, tagIds: $tagIds) {
      ...TicketTagInputFragment
    }
  }
  ${TicketTagInput.fragments.TicketTagInputFragment}
`;

const ADD_TICKET_TAGS_MUTATION = gql`
  mutation TicketTagInputAddTags($ticketId: Int!, $tagIds: [Int!]!) {
    addTicketTags(ticketId: $ticketId, tagIds: $tagIds) {
      ...TicketTagInputFragment
    }
  }
  ${TicketTagInput.fragments.TicketTagInputFragment}
`;

const GET_MINI_TAGS_QUERY = gql`
  query GetMiniTagForTagInput {
    miniTags {
      id
      name
      color
    }
  }
`;
