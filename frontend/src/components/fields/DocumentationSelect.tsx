import React, { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { ModelStage, Documentation } from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { get } from "lodash";
import { ObjectSelectSearch } from "components/fields/ObjectSelectSearch";
import { Tag } from "components/tags/Tag";
import { QueryReturnValue } from "types/queryTypes";

const GET_DOCUMENTATIONS = gql`
  query GetDocumentationsForDocumentationSelect(
    $first: Int!
    $search: String
    $offset: Int
    $stages: [ModelStage!]
  ) {
    documentations(
      first: $first
      search: $search
      offset: $offset
      stages: $stages
    ) {
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
        stage
      }
    }
  }
`;

interface Props {
  value?: Documentation | null;
  onChange: (documentation?: Documentation) => void;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
  scheduledOnly?: boolean;
}

export const DocumentationSelect: React.FC<Props> = (props) => {
  const [filter, setFilter] = useState("");

  const { data, error } = useQuery<QueryReturnValue["documentations"]>(
    GET_DOCUMENTATIONS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        first: 20,
        search: filter,
        offset: 0,
        stages: props.scheduledOnly ? [ModelStage.Published] : undefined,
      },
    }
  );

  if (error) {
    return null;
  }

  const documentations = get(data, "documentations.nodes", []);
  const documentationCount = get(data, "documentations.totalCount", 0);

  const searchHeader = () => {
    if (filter || documentationCount > 4) {
      return <ObjectSelectSearch onChange={setFilter} />;
    }
  };

  const renderOption = (documentation?: Documentation) => {
    if (documentation) {
      return (
        <div className="flex min-w-0 flex-1 flex-row">
          <div className="flex-1 truncate">{documentation.name}</div>
          {documentation.stage !== ModelStage.Published && (
            <div className="shrink-0">
              <Tag className="bg-gray-900 bg-opacity-10">
                {documentation.stage}
              </Tag>
            </div>
          )}
        </div>
      );
    }

    return "";
  };

  return (
    <ObjectSelect<Documentation>
      tabIndex={props.tabIndex}
      label={props.label}
      header={searchHeader()}
      items={documentations}
      value={props.value}
      onChange={props.onChange}
      identityMethod={(documentation) =>
        documentation ? documentation.id : null
      }
      renderOptionLabel={renderOption}
      placeholder={props.placeholder}
    />
  );
};
