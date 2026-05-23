import React, { useEffect, useState } from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { WorkflowSelect } from "components/fields/WorkflowSelect";
import { find, uniqBy } from "lodash";
import { MiniWorkflow } from "types/graphql";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function ExplorerWorkflowFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;
  const { workflows } = filter.recordSets;
  const [lastSelected, setLastSelected] = useState<MiniWorkflow | undefined>();

  divProps.className = cn(divProps.className);

  useEffect(() => {
    if (lastSelected && !find(workflows, { id: lastSelected.id })) {
      setLastSelected(undefined);
    }
  }, [workflows, lastSelected, setLastSelected]);

  const onAddFilter = (workflow?: MiniWorkflow) => {
    setLastSelected(workflow);
    if (workflow) {
      const filterElt: RecordFilterElement = {
        id: workflow.id,
        label: workflow.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          workflows: uniqBy([...filter.recordSets.workflows, filterElt], "id"),
        },
      });
    }
  };

  return (
    <div {...divProps}>
      <WorkflowSelect
        tabIndex={1}
        onChange={(tag) => onAddFilter(tag)}
        placeholder="Filter by workflow..."
        value={lastSelected}
      />
    </div>
  );
}
