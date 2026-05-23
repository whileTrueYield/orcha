import React from "react";
import { ListFilter, ValueFilterElement } from "types/filter";
import { findIndex, reject, uniqBy } from "lodash";
import { Checkbox } from "components/fields/Checkbox";
import cn from "classnames";

interface Props<T extends ListFilter> {
  onFilterChange: (filter: T) => void;
  filter: T;
  domain: keyof T["valueSets"];
  options: ValueFilterElement[];
  className?: string;
  placeholder?: string;
}

export function SelectAsCheckboxFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { domain, onFilterChange, options } = props;

  const isActive = (filter: ValueFilterElement) => {
    const activeOptions = props.filter.valueSets[domain as string];
    return (
      findIndex(activeOptions, (option) => {
        return filter.value === option.value;
      }) > -1
    );
  };

  const onToggleFilter = (value: ValueFilterElement) => {
    const filterElt: ValueFilterElement = {
      value: value.value,
      label: value.label,
    };

    if (isActive(value)) {
      onFilterChange({
        ...props.filter,
        valueSets: {
          ...props.filter.valueSets,
          [domain]: reject(
            props.filter.valueSets[domain as string],
            (elt) => elt.value === value.value
          ),
        },
      });
    } else {
      onFilterChange({
        ...props.filter,
        valueSets: {
          ...props.filter.valueSets,
          [domain]: uniqBy(
            [...props.filter.valueSets[domain as string], filterElt],
            "value"
          ),
        },
      });
    }
  };

  const className = cn("space-y-4 sm:space-y-3", props.className);

  return (
    <div className={className}>
      {options.map((option) => (
        <div
          className="flex items-center text-base sm:text-sm"
          key={`valueset-${domain.toString()}-${option.value}`}
        >
          <Checkbox
            checked={isActive(option)}
            onChange={() => onToggleFilter(option)}
            id={`valueset-${domain.toString()}-${option.value}`}
          />
          <label
            htmlFor={`valueset-${domain.toString()}-${option.value}`}
            className="ml-3 min-w-0 text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}
