import React, { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import {
  MiniWorkflow,
  ModelStage,
  QueryMiniWorkflowsArgs,
} from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { ObjectSelectSearch } from "./ObjectSelectSearch";
import { Tag } from "components/tags/Tag";
import { HighlightMatch } from "./HighlightMatch";
import cn from "classnames";
import fuzzysort from "fuzzysort";
import { QueryReturnValue } from "types/queryTypes";

const GET_MINI_WORKFLOWS = gql`
  query GetMiniWorkflows {
    miniWorkflows {
      id
      name
      stage
    }
  }
`;
interface Props {
  value?: MiniWorkflow;
  onChange: (workflow?: MiniWorkflow) => void;
  onDelete?: () => void;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
}

export const WorkflowSelect: React.FC<Props> = (props) => {
  const [search, setSearch] = useState("");

  const { data, error } = useQuery<
    QueryReturnValue["miniWorkflows"],
    QueryMiniWorkflowsArgs
  >(GET_MINI_WORKFLOWS, { fetchPolicy: "cache-and-network" });

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
      onDelete={props.onDelete}
      identityMethod={(workflow) => (workflow ? workflow.id : null)}
      renderOptionLabel={renderOptionLabel}
      placeholder={props.placeholder}
    />
  );
};
