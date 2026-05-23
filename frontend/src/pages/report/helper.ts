import { DateFilterElement, RecordFilterElement } from "types";
import { FilterElement } from "types/graphql";

export const toRecordFilterElement = (
  record: FilterElement
): RecordFilterElement => {
  return {
    id: record.recordId,
    label: record.label,
  };
};

export const toDateFilterElement = (
  fromDate?: string | null,
  untilDate?: string | null
): DateFilterElement | null => {
  const dateFilterElement: DateFilterElement = {};

  if (!fromDate && !fromDate) {
    return null;
  }

  if (fromDate) {
    dateFilterElement.afterDate = fromDate;
  }

  if (untilDate) {
    dateFilterElement.beforeDate = untilDate;
  }

  return dateFilterElement;
};
