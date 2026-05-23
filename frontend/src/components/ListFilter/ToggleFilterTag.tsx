import { CheckIcon } from "@heroicons/react/solid";
import { GroupTag } from "components/tags/GroupTag";
import React from "react";
import { ListFilter } from "types";

interface Props<T extends ListFilter> {
  filter: T;
  onChange: (filter: T) => void;
  className?: string;
  domain: keyof T["flags"];
}

export function ToggleFilterAsTag<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { filter, domain, onChange } = props;

  const element = filter.flags[domain as string];

  if (!element) {
    console.warn("ToggleFilterAsTag: Could not find filter.flags.%s", domain);
    return null;
  }

  if (!element.value) {
    return null;
  }

  const onToggleFilterDelete = () => {
    onChange({
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

  return (
    <GroupTag
      large
      key={element.label}
      groupLabel={element.label}
      label={<CheckIcon className="h-5 w-5 text-gray-700" />}
      groupBgColor="bg-green-300"
      bgColor="bg-green-200"
      actionBgColor="bg-green-300 hover:bg-green-400"
      className="mr-2 mt-2 text-green-900"
      onDelete={onToggleFilterDelete}
    />
  );
}
