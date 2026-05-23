import React, { useEffect, useState } from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { find, uniqBy } from "lodash";
import { Tag } from "types/graphql";
import { TagSelect } from "components/fields/TagSelect";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function ExplorerTagFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;
  const { tags } = filter.recordSets;
  const [lastSelected, setLastSelected] = useState<Tag | undefined>();

  divProps.className = cn(divProps.className);

  useEffect(() => {
    if (lastSelected && !find(tags, { id: lastSelected.id })) {
      setLastSelected(undefined);
    }
  }, [tags, lastSelected, setLastSelected]);

  const onAddFilter = (tag?: Tag) => {
    setLastSelected(tag);
    if (tag) {
      const filterElt: RecordFilterElement = {
        id: tag.id,
        label: tag.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          tags: uniqBy([...filter.recordSets.tags, filterElt], "id"),
        },
      });
    }
  };

  return (
    <div {...divProps}>
      <TagSelect
        tabIndex={1}
        onChange={(tag) => onAddFilter(tag)}
        placeholder="Filter by tag..."
        value={lastSelected}
      />
    </div>
  );
}
