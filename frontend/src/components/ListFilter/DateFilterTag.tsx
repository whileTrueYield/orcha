import { GroupTag } from "components/tags/GroupTag";
import { addDays, format, formatISO } from "date-fns";
import React from "react";
import { ListFilter, DateFilterElement } from "types";

interface Props<T extends ListFilter> {
  filter: T;
  onChange: (filter: T) => void;
  className?: string;
  domain: keyof T["dates"];
  label: string;
  dateOnly?: boolean;
}

export const formatDateFilter = (after?: string, before?: string): string => {
  // not the that one day is added to the before ISO date value. This is because
  // every day start at midnight which would exclude the provided date
  if (before && after) {
    const beforeISO = formatISO(addDays(new Date(before), 1), {
      representation: "date",
    });
    const afterISO = formatISO(new Date(after), { representation: "date" });
    return `${afterISO}|${beforeISO}`;
  } else if (before) {
    return (
      "|" +
      formatISO(addDays(new Date(before), 1), {
        representation: "date",
      })
    );
  } else if (after) {
    return formatISO(new Date(after), { representation: "date" }) + "|";
  } else {
    return "";
  }
};

export function DateFilterAsTag<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { filter, domain, onChange, label, dateOnly } = props;

  const element = filter.dates[domain as string];

  if (!element) {
    return null;
  }

  const onRecordFilterDelete = () => {
    onChange({
      ...filter,
      dates: {
        ...filter.dates,
        [domain]: null,
      },
    });
  };

  const getDate = (date: string): string => {
    if (dateOnly) {
      return format(new Date(date + "T00:00:00.000"), "PP");
    }
    return format(new Date(date), "PP");
  };

  const getLabel = (elt: DateFilterElement): string => {
    if (elt.afterDate && elt.beforeDate) {
      return elt.afterDate === elt.beforeDate
        ? getDate(elt.afterDate)
        : `${getDate(elt.afterDate)} - ${getDate(elt.beforeDate)}`;
    } else if (elt.afterDate) {
      return `after ${getDate(elt.afterDate)}`;
    } else if (elt.beforeDate) {
      return `before ${getDate(elt.beforeDate)}`;
    } else {
      return "";
    }
  };

  return (
    <GroupTag
      large
      groupLabel={label}
      label={getLabel(element)}
      groupBgColor="bg-orange-300"
      bgColor="bg-orange-200"
      actionBgColor="bg-orange-300 hover:bg-orange-400"
      className="mr-2 mt-2 text-orange-900"
      onDelete={onRecordFilterDelete}
    />
  );
}
