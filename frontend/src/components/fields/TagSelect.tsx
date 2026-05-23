import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Tag } from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { get } from "lodash";
import { ObjectSelectSearch } from "./ObjectSelectSearch";
import { QueryReturnValue } from "types/queryTypes";

const GET_TAGS = gql`
  query GetTagsForTagSelect($first: Int!, $search: String, $offset: Int) {
    tags(first: $first, search: $search, offset: $offset) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        name
      }
    }
  }
`;

interface Props {
  value?: Tag;
  onChange: (tag?: Tag) => void;
  onDelete?: () => void;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
}

export const TagSelect: React.FC<Props> = (props) => {
  const [filter, setFilter] = useState("");

  const { data, error } = useQuery<QueryReturnValue["tags"]>(GET_TAGS, {
    fetchPolicy: "cache-and-network",
    variables: {
      first: 20,
      search: filter,
      offset: 0,
    },
  });

  if (error) {
    return null;
  }

  const tags = get(data, "tags.nodes", []);
  const tagCount = get(data, "tags.totalCount", 0);

  const searchHeader = () => {
    if (filter || tagCount > 4) {
      return <ObjectSelectSearch onChange={setFilter} />;
    }
  };

  return (
    <ObjectSelect<Tag>
      tabIndex={props.tabIndex}
      placeholder={props.placeholder}
      label={props.label}
      header={searchHeader()}
      items={tags}
      value={props.value}
      onChange={props.onChange}
      onDelete={props.onDelete}
      identityMethod={(tag) => (tag ? tag.id : null)}
      renderOptionLabel={(tag) =>
        tag ? (
          <div className="flex items-center justify-between">{tag.name}</div>
        ) : (
          ""
        )
      }
    />
  );
};
