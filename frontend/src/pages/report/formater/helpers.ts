import {
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
} from "date-fns";
import { format, utcToZonedTime } from "date-fns-tz";
import { capitalize, filter, find, map, sortBy, startCase } from "lodash";
import {
  QueryAggregate,
  ReportDateGranularity,
  ReportGroupBy,
} from "types/graphql";

export interface FormaterOptions {
  main: ReportGroupBy;
  secondary?: ReportGroupBy | null;
  granularity?: DatumGranularity;
  noUnknowns?: boolean;
  cummulative?: boolean;
  label?: string | null;
}

// The following are all expected to be an epoch
export const epochFields = [
  ReportGroupBy.CreatedAt,
  ReportGroupBy.Eta,
  ReportGroupBy.ClosedAt,
  ReportGroupBy.ScheduledAt,
  ReportGroupBy.WorkDay,
];

// The different level of granularity for date formatting
export enum DatumGranularity {
  iso = "ISO",
  hour = "HOUR",
  day = "DAY",
  month = "MONTH",
  year = "YEAR",
}

export function isDatumEpochField(field?: ReportGroupBy | null): boolean {
  return !!field && epochFields.indexOf(field) > -1;
}

export const autoFormatDatum = (
  field?: ReportGroupBy | null,
  granularity?: DatumGranularity
) => {
  if (isDatumEpochField(field)) {
    return datumToDate(granularity);
  } else {
    return formatEnum;
  }
};

export const datumToDate =
  (granularity?: DatumGranularity) =>
  (datumEpoch?: string | null): string => {
    if (datumEpoch) {
      const epoch = parseInt(datumEpoch);

      if (isNaN(epoch)) {
        return "Unknown";
      }

      const date = utcToZonedTime(new Date(epoch), "UTC");
      switch (granularity) {
        case DatumGranularity.day:
          return format(date, "E LLL d", { timeZone: "UTC" });
        case DatumGranularity.month:
          return format(date, "LLL yyyy", { timeZone: "UTC" });
        case DatumGranularity.year:
          return format(date, "yyyy", { timeZone: "UTC" });
        case DatumGranularity.iso:
        default:
          return format(date, "yyyy-MM-dd", { timeZone: "UTC" });
      }
    }

    return "Unknown";
  };

export const formatEnum = (enumValue?: string | null): string =>
  enumValue ? capitalize(startCase(enumValue)) : "Unknown";

export const guessTimeGranularity = (dates: Date[]): ReportDateGranularity => {
  const sortedDates = sortBy(dates);

  const days = differenceInDays(
    sortedDates[sortedDates.length - 1],
    sortedDates[0]
  );

  if (isNaN(days)) {
    throw new Error(
      `Bad date format: ${sortedDates.length - 1}, ${sortedDates[0]}`
    );
  }

  if (days < 21) {
    return ReportDateGranularity.Day;
  } else if (days < 7 * 14) {
    return ReportDateGranularity.Week;
  } else {
    return ReportDateGranularity.Month;
  }
};

function* dateIterator(values: QueryAggregate[]) {
  for (const value of values) {
    yield value;
  }
}

const createInterval = (
  startDate: Date,
  stopDate: Date,
  granularity: ReportDateGranularity
): Date[] => {
  if (granularity === ReportDateGranularity.Month) {
    return eachMonthOfInterval({
      start: startDate,
      end: stopDate,
    });
  } else if (granularity === ReportDateGranularity.Week) {
    return eachWeekOfInterval({
      start: startDate,
      end: stopDate,
    });
  }

  return eachDayOfInterval({
    start: startDate,
    end: stopDate,
  });
};

export function boundaries<T>(dataset: T[]): [T, T] | undefined {
  if (dataset.length) {
    let min: T = dataset[0];
    let max: T = dataset[0];

    console.log({ min, max, dataset });

    dataset.forEach((cursor, index) => {
      if (cursor > max) {
        max = cursor;
      }
      if (cursor < min) {
        min = cursor;
      }
    });

    return [min, max];
  } else return undefined;
}

/**
 * Group and normalize a QueryAggregate valueset according to requested granularity.
 * Hole in the original dataset will be filled by a value of 0.
 * Optionally, the start and stop date boundaries can be customized
 * @param values
 * @param groupBy
 * @param granularity
 * @param startDate
 * @param stopDate
 * @returns
 */
export const bucketDates = (
  values: QueryAggregate[],
  groupBy: ReportGroupBy,
  granularity: ReportDateGranularity,
  startDate?: Date,
  stopDate?: Date
): QueryAggregate[] => {
  if (!isDatumEpochField(groupBy)) {
    return values;
  }

  values = sortBy(filter(values, "main"), "main");

  // extract all the different combinations
  const rows: QueryAggregate[] = [];
  for (const value of values) {
    if (!find(rows, { secondary: value.secondary })) {
      rows.push({ main: "", secondary: value.secondary, value: 0 });
    }
  }

  const dates = map(values, (value) => value.main);
  startDate = startDate ? startDate : new Date(parseInt(dates[0] as string));
  stopDate = stopDate
    ? stopDate
    : new Date(parseInt(dates[dates.length - 1] as string));

  if (granularity === ReportDateGranularity.Auto) {
    granularity = guessTimeGranularity([startDate, stopDate]);
  }

  const interval = createInterval(startDate, stopDate, granularity);

  let results: QueryAggregate[] = [];
  const valueIter = dateIterator(values);
  let current = valueIter.next();

  for (let dayCursor = 0; dayCursor < interval.length; dayCursor++) {
    const currentInterval = interval[dayCursor];

    const dayResults: QueryAggregate[] = map(rows, (row) => ({
      ...row,
      main: currentInterval.getTime().toString(),
    }));

    const nextInterval = interval[dayCursor + 1];

    if (nextInterval) {
      while (
        !current.done &&
        new Date(parseInt(current.value.main as string)) < nextInterval
      ) {
        const row = find(dayResults, { secondary: current.value.secondary });
        if (row) {
          row.value += current.value.value;
        }

        current = valueIter.next();
      }
    } else {
      while (!current.done) {
        const row = find(dayResults, { secondary: current.value.secondary });
        if (row) {
          row.value += current.value.value;
        }

        current = valueIter.next();
      }
    }

    results = [...results, ...dayResults];
  }

  return results;
};
