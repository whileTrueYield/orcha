import { GroupTag } from "components/tags/GroupTag";
import { map, reject } from "lodash";
import React from "react";
import { ListFilter, ValueFilterElement } from "types";

interface Props<T extends ListFilter> {
  filter: T;
  onChange?: (filter: T) => void;
  className?: string;
  domain: keyof T["valueSets"];
  label: string;
}

export function ValueFilterAsTag<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { filter, domain, onChange, label } = props;

  const onRecordFilterDelete = (value: any) => () => {
    if (onChange) {
      onChange({
        ...filter,
        valueSets: {
          ...filter.valueSets,
          [domain]: reject(filter.valueSets[domain as string], { value }),
        },
      });
    }
  };

  const renderFilterSet = (element: ValueFilterElement) => (
    <GroupTag
      large
      key={element.label}
      groupLabel={label}
      label={element.label}
      groupBgColor="bg-purple-300"
      bgColor="bg-purple-200"
      actionBgColor="bg-purple-300 hover:bg-purple-400"
      className="mr-2 mt-2 text-purple-900"
      onDelete={onChange ? onRecordFilterDelete(element.value) : undefined}
    />
  );

  return <>{map(filter.valueSets[domain as string], renderFilterSet)}</>;
}
