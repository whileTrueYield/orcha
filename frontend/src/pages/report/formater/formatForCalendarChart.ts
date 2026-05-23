import { reduce, sortBy } from "lodash";
import { QueryAggregate } from "types/graphql";
import { DatumGranularity, datumToDate } from "./helpers";

interface CalendarDatum {
  value: number;
  day: string;
}

export function formatForCalendarChart(
  values: QueryAggregate[]
): CalendarDatum[] {
  const mainFormaterFn = datumToDate(DatumGranularity.iso);

  return reduce(
    sortBy(values, "main"), // make sure dates are sorted
    (acc: CalendarDatum[], { main, value }) => {
      // we want to add the the set if the date is defined
      if (main) {
        return [
          ...acc,
          {
            day: mainFormaterFn(main),
            value,
          },
        ];
      }
      return acc;
    },
    []
  );
}
