import { Datum, Serie } from "@nivo/line";
import { filter, groupBy, map, sortBy } from "lodash";
import { QueryAggregate } from "types/graphql";
import { autoFormatDatum, formatEnum, FormaterOptions } from "./helpers";

export function formatForLineChart(
  values: QueryAggregate[],
  options: FormaterOptions,
): Serie[] {
  const { main, secondary, granularity, noUnknowns, label } = options;

  // format values based on the values of main:
  // - CLOSED_AT will be a date formated from an epoch value
  // - PRODUCT will be a capitalize from a string
  const mainFormaterFn = autoFormatDatum(main, granularity);

  // remove unknowns if requested
  if (noUnknowns) {
    values = filter(values, "main");
    if (secondary) {
      values = filter(values, "secondary");
    }
  }

  // do we have two groupings for this graph?
  // like group by closed at and sub-divide by products
  if (secondary) {
    // format values based on the values of the secondary grouping:
    // - CLOSED_AT will be a date formated from an epoch value
    // - PRODUCT will be a capitalize from a string
    const secondaryFormaterFn = autoFormatDatum(secondary, granularity);

    const serie: Serie[] = [];

    const indexedValues = groupBy(values, "secondary");

    // sort the keys, if we received epochs this will ensure
    // we follow the time line chronologically
    const keys = Object.keys(indexedValues).sort();

    for (const key of keys) {
      // replace the "main" value by the "secondary" one since we have 2 groupings
      let rows = map(indexedValues[key], (row) => ({
        ...row,
        secondary: row.secondary,
      }));

      serie.push(
        buildLineSerie(
          secondaryFormaterFn(key),
          sortBy(rows, "main"),
          mainFormaterFn,
          options.cummulative,
        ),
      );
    }

    return serie;
  } else {
    return [
      buildLineSerie(
        label ? label : formatEnum(main),
        sortBy(values, "main"),
        mainFormaterFn,
        options.cummulative,
      ),
    ];
  }
}

export function formatForComparisonLineChart(
  primary: QueryAggregate[],
  secondary: QueryAggregate[],
  options: FormaterOptions,
): Serie[] {
  const { main, granularity, noUnknowns } = options;

  // format values based on the values of main:
  // - CLOSED_AT will be a date formated from an epoch value
  // - PRODUCT will be a capitalize from a string
  const mainFormaterFn = autoFormatDatum(main, granularity);

  // remove unknowns if requested
  if (noUnknowns) {
    primary = filter(primary, "main");
    secondary = filter(secondary, "main");
  }

  return [
    buildLineSerie(
      formatEnum(main),
      sortBy(primary, "main"),
      mainFormaterFn,
      options.cummulative,
    ),
    buildLineSerie(
      formatEnum(main),
      sortBy(secondary, "main"),
      mainFormaterFn,
      options.cummulative,
    ),
  ];
}

const buildLineSerie = (
  id: string,
  rows: QueryAggregate[],
  formater: ReturnType<typeof autoFormatDatum>,
  cummulative?: boolean,
): Serie => {
  const data: Datum[] = [];

  let previousValue = 0;

  for (const row of rows) {
    const yValue = cummulative ? previousValue + row.value : row.value;
    data.push({
      x: formater(row.main),
      y: yValue,
    });

    previousValue = yValue;
  }

  return { id, data };
};
