import React from "react";
import cn from "classnames";

import { ListFilter } from "types/filter";
import { ToggleButton } from "components/fields/ToggleButton";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
  domain: keyof T["flags"];
}

export function ToggleFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, domain, ...divProps } = props;

  const element = filter.flags[domain as string];

  if (!element) {
    console.warn("ToggleFilter: Could not find filter.flags.%s", domain);
    return null;
  }

  const onToggle = () => {
    onFilterChange({
      ...filter,
      flags: {
        ...filter.flags,
        [domain]: {
          label: element.label,
          value: !element.value,
        },
      },
    });
  };

  divProps.className = cn(
    "text-gray-500 flex justify-between p-2 my-1 border-b",
    divProps.className
  );

  return (
    <div {...divProps}>
      <div className="cursor-pointer leading-6" onClick={onToggle}>
        {element.label}
      </div>
      <ToggleButton
        checked={!!filter.flags[domain as string]?.value}
        onChange={onToggle}
      />
    </div>
  );
}
