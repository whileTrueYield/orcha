import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import {
  MiniWorkflow,
  ModelStage,
  QueryMiniWorkflowsArgs,
} from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { Tag } from "components/tags/Tag";
import { ObjectSelectSearch } from "./ObjectSelectSearch";
import { HighlightMatch } from "./HighlightMatch";
import cn from "classnames";
import fuzzysort from "fuzzysort";
import { find } from "lodash";
import { QueryReturnValue } from "types/queryTypes";

const GET_MINI_WORKFLOWS = gql`
  query GetMiniWorkflowsForProductWorkflowSelect($productId: Int) {
    miniWorkflows(productId: $productId) {
      id
      name
      stage
    }
  }
`;

interface Props {
  value?: MiniWorkflow | null;
  defaultId?: number;
  onChange: (workflow?: MiniWorkflow) => void;
  productId: number;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
  renderNoOptions?: () => React.ReactNode;
}

export const ProductWorkflowSelect: React.FC<Props> = (props) => {
  const { productId } = props;
  const [search, setSearch] = useState("");

  const { data, error } = useQuery<
    QueryReturnValue["miniWorkflows"],
    QueryMiniWorkflowsArgs
  >(GET_MINI_WORKFLOWS, {
    fetchPolicy: "cache-and-network",
    variables: {
      productId,
    },
    onCompleted: ({ miniWorkflows }) => {
      if (props.defaultId) {
        const workflow = find(miniWorkflows, { id: props.defaultId });
        if (workflow) {
          props.onChange(workflow);
        }
      }
    },
  });

  const workflows = useMemo((): MiniWorkflow[] => {
    if (!data?.miniWorkflows) {
      return [];
    }

    let allWorkflows = data.miniWorkflows;

    if (search) {
      const results = fuzzysort.go(search, allWorkflows, {
        key: "name",
        limit: 10,
        threshold: -Infinity,
      });
      return results.map((r) => r.obj);
    } else {
      return allWorkflows;
    }
  }, [data, search]);

  if (error) {
    return null;
  }

  const searchHeader = () => {
    if (search || workflows.length > 4) {
      return <ObjectSelectSearch onChange={setSearch} query={search} />;
    }
  };

  const renderOptionLabel = (
    workflow?: MiniWorkflow,
    isActive?: boolean,
    isSelected?: boolean
  ) => {
    if (workflow) {
      const tagClass = cn({
        "bg-gray-200 text-gray-800": !isActive && !isSelected,
        "bg-brand-200 text-brand-900": isSelected,
        "bg-brand-800 text-brand-50": isActive,
      });

      if (workflow.stage === ModelStage.Published) {
        return <HighlightMatch value={workflow.name} query={search} />;
      }

      return (
        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center">
            <div>
              <HighlightMatch value={workflow.name} query={search} />
            </div>
          </div>
          <Tag className={tagClass}>{workflow.stage}</Tag>
        </div>
      );
    } else {
      return "";
    }
  };

  return (
    <ObjectSelect<MiniWorkflow>
      tabIndex={props.tabIndex}
      label={props.label}
      header={searchHeader()}
      items={workflows}
      value={props.value}
      onChange={props.onChange}
      identityMethod={(workflow) => workflow?.id || ""}
      renderOptionLabel={renderOptionLabel}
      placeholder={props.placeholder}
      renderNoOptions={props.renderNoOptions}
    />
  );
};
