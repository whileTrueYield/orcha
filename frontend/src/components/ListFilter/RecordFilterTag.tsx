import { GroupTag } from "components/tags/GroupTag";
import { map, reject } from "lodash";
import React from "react";
import { ListFilter, RecordFilterElement } from "types";
import cn from "classnames";

interface Props<T extends ListFilter> {
  filter: T;
  onChange?: (filter: T) => void;
  className?: string;
  domain: keyof T["recordSets"];
  label: string;
}

export function RecordFilterAsTag<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { filter, domain, onChange, label } = props;

  const className = cn("mr-2 mt-2 text-brand-900", props.className);

  const onRecordFilterDelete = (id: number) => () => {
    if (onChange) {
      onChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          [domain]: reject(filter.recordSets[domain as string], { id }),
        },
      });
    }
  };

  const renderFilterSet = (element: RecordFilterElement) => (
    <GroupTag
      large
      key={`${String(domain)}-${element.id}`}
      groupLabel={label}
      label={element.label}
      groupBgColor="bg-brand-300"
      bgColor="bg-brand-200"
      actionBgColor="bg-brand-400 hover:bg-brand-600 text-white"
      className={className}
      onDelete={onChange ? onRecordFilterDelete(element.id) : undefined}
    />
  );

  return <>{map(filter.recordSets[domain as string], renderFilterSet)}</>;
}
