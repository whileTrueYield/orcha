import React from "react";
import cn from "classnames";

import { ListFilter } from "types/filter";
import { Checkbox } from "components/fields/Checkbox";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
  domain: keyof T["flags"];
  label: string;
}

export function CheckboxFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, domain, label, ...divProps } = props;

  const element = filter.flags[domain as string];

  if (!element) {
    console.warn("CheckboxFilter: Could not find filter.flags.%s", domain);
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
    "flex items-center text-base sm:text-sm",
    divProps.className
  );

  return (
    <div {...divProps}>
      <Checkbox
        checked={!!filter.flags[domain.toString()]?.value}
        onChange={onToggle}
        id={`flag-${domain.toString()}`}
      />
      <label
        htmlFor={`flag-${domain.toString()}`}
        className="ml-3 min-w-0 text-gray-700"
      >
        {label}
      </label>
    </div>
  );
}
