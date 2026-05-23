import React, { useEffect, useState } from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { RoleSelect } from "components/fields/RoleSelect";
import { find, get, uniqBy } from "lodash";
import { MiniRole } from "types/graphql";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
  label: string;
  domain: keyof T["recordSets"];
}

export function ExplorerRoleFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, domain, label, ...divProps } = props;
  const roles = get(filter.recordSets, domain) as RecordFilterElement[];
  const [lastSelected, setLastSelected] = useState<MiniRole | null>();

  useEffect(() => {
    if (lastSelected && !find(roles, { id: lastSelected.id })) {
      setLastSelected(undefined);
    }
  }, [roles, lastSelected, setLastSelected]);

  divProps.className = cn(divProps.className);

  const onAddFilter = (role: MiniRole | null) => {
    setLastSelected(role);
    if (role) {
      const filterElt: RecordFilterElement = {
        id: role.id,
        label: role.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          [domain]: uniqBy(
            [...filter.recordSets[domain as string], filterElt],
            "id"
          ),
        },
      });
    }
  };

  return (
    <div {...divProps}>
      <RoleSelect
        tabIndex={1}
        onChange={(role) => onAddFilter(role)}
        placeholder={`Filter by ${label.toLowerCase()}...`}
        includeMe
        value={lastSelected}
      />
    </div>
  );
}
