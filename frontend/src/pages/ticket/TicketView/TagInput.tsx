import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Tag as TagElement } from "components/tags/Tag";
import { FCWithFragments } from "types";
import { MiniTag, Tag } from "types/graphql";
import { Combobox } from "@headlessui/react";
import { find } from "lodash";
import { CheckIcon } from "@heroicons/react/outline";
import { Button } from "components/fields/Button";
import { plural } from "utils/string";
import { getColor } from "config";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  onAddTag: (tag: MiniTag) => void;
  onRemoveTag: (tag: MiniTag | Tag) => void;
  tags: Array<MiniTag | Tag>;
  label?: string;
  onCreate?: (name: string) => void;
}

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

export const TagInput: FCWithFragments<Props> = (props) => {
  const [query, setQuery] = useState("");
  const { tags } = props;

  const [selectedTag, setSelectedTag] = useState<MiniTag | null>();

  const { data } = useQuery<QueryReturnValue["miniTags"]>(GET_MINI_TAGS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  const miniTags = data ? data.miniTags : [];

  const filteredTags =
    query === ""
      ? miniTags
      : miniTags.filter((miniTag) => {
          return miniTag.name.toLowerCase().includes(query.toLowerCase());
        });

  const isSelected = (tagId: number) => !!find(tags, { id: tagId });

  const toggleTag = (miniTag: MiniTag) => {
    if (isSelected(miniTag.id)) {
      props.onRemoveTag(miniTag);
    } else {
      props.onAddTag(miniTag);
    }
    setSelectedTag(null);
  };

  const renderOptions = (filteredTags: MiniTag[]) => {
    if (filteredTags.length) {
      return filteredTags.map((miniTag) => (
        <Combobox.Option
          value={miniTag}
          key={miniTag.id}
          className={({ focus }) =>
            classNames(
              "relative cursor-default select-none py-2 pl-3 pr-9",
              focus ? "bg-brand-600 text-white" : "text-gray-900"
            )
          }
        >
          {({ focus }) => (
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
                    focus ? "text-white" : "text-indigo-600"
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
      <Combobox value={selectedTag} onChange={(tag) => tag && toggleTag(tag)}>
        <div
          onClick={(event) => {
            event.currentTarget.querySelector("input")?.focus();
          }}
          className="rounded-md border border-gray-300 bg-white pl-2 pb-2 shadow-sm sm:pb-1.5"
        >
          {tags.map((tag) => {
            const colorSet = getColor(tag.color);

            return (
              <TagElement
                large
                key={tag.id}
                onDelete={() => props.onRemoveTag(tag)}
                className={`mr-2 mt-2 ${colorSet.textColor} ${colorSet.bgColor} shadow-sm sm:mt-1.5`}
              >
                {tag.name}
              </TagElement>
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
                {props.onCreate && (
                  <Button
                    onClick={() => props.onCreate?.(query)}
                    btnType="white"
                    type="button"
                    btnSize="xsmall"
                  >
                    Create Tag
                  </Button>
                )}
              </div>
            </Combobox.Options>
          </div>
        </div>
      </Combobox>
    </>
  );
};

TagInput.fragments = {
  TagInputFragment: gql`
    fragment TagInputFragment on Tag {
      id
      name
      color
    }
  `,
};

const GET_MINI_TAGS_QUERY = gql`
  query GetMiniTagForTicket {
    miniTags {
      id
      name
      color
    }
  }
`;
