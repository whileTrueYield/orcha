import { BarDatum } from "@nivo/bar";
import { filter, groupBy } from "lodash";
import { QueryAggregate } from "types/graphql";
import { autoFormatDatum, FormaterOptions } from "./helpers";
import { formatEnum } from "./helpers";

interface DataForBarChart {
  data: BarDatum[];
  keys: string[];
}

export function formatForBarChart(
  values: QueryAggregate[],
  options: FormaterOptions
): DataForBarChart {
  const { main, secondary, granularity, noUnknowns } = options;

  // format values based on the values of main:
  // - CLOSED_AT will be a date formated from an epoch value
  // - PRODUCT will be a capitalize from a string
  const mainFormaterFn = autoFormatDatum(main, granularity);

  const datum: DataForBarChart = {
    data: [],
    keys: [],
  };

  // remove unknowns if requested
  if (noUnknowns) {
    values = filter(values, "main");
    if (secondary) {
      values = filter(values, "secondary");
    }
  }

  // sort the keys, if we received epochs this will ensure
  // we follow the time line chronologically
  const indexedValues = groupBy(values, "main");
  const keys = Object.keys(indexedValues).sort();

  // do we have two groupings for this graph?
  // like group by product and sub-divide by workflows
  if (secondary) {
    // format values based on the values of the secondary grouping:
    // - CLOSED_AT will be a date formated from an epoch value
    // - PRODUCT will be a capitalize from a string
    const secondaryFormaterFn = autoFormatDatum(secondary, granularity);

    for (const key of keys) {
      const datumRow: BarDatum = {
        __main: mainFormaterFn(key),
      };

      for (const row of indexedValues[key]) {
        const subName = secondaryFormaterFn(row?.secondary);

        datumRow[subName] = row.value;

        if (datum.keys.indexOf(subName) === -1) {
          datum.keys.push(subName);
        }
      }

      datum.data.push(datumRow);
    }
  } else {
    const groupName = formatEnum(main);

    // there will be only one key, like counts of tickets per product
    datum.keys = [formatEnum(main)];

    for (const key of keys) {
      const name = mainFormaterFn(key);

      let value = 0;
      for (const row of indexedValues[key]) {
        value = value + row.value;
      }

      datum.data.push({ [groupName]: value, __main: name });
    }
  }

  return datum;
}
